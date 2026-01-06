import { Hono } from "hono";
import { db } from "../db";
import { cameras, deviceStatuses, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { broadcast } from "../index";

export const cameraRoutes = new Hono();

cameraRoutes.use("*", authMiddleware);

// Get all cameras
cameraRoutes.get("/", requirePermission("cameras:read"), async (c) => {
    const roomId = c.req.query("roomId");
    const status = c.req.query("status");

    const allCameras = await db.query.cameras.findMany({
        with: {
            room: {
                with: { unit: true },
            },
            deviceStatuses: {
                limit: 1,
                orderBy: (ds, { desc }) => [desc(ds.timestamp)],
            },
        },
        orderBy: (cam, { asc }) => [asc(cam.name)],
    });

    let filtered = allCameras;
    if (roomId) filtered = filtered.filter(c => c.roomId === roomId);
    if (status) filtered = filtered.filter(c => c.status === status);

    return c.json(filtered);
});

// Get camera status overview
cameraRoutes.get("/status/overview", requirePermission("cameras:read"), async (c) => {
    const allCameras = await db.query.cameras.findMany({
        columns: {
            id: true,
            name: true,
            status: true,
            lastHeartbeat: true,
        },
        with: {
            room: {
                columns: { name: true },
            },
        },
    });

    const online = allCameras.filter(c => c.status === "online").length;
    const offline = allCameras.filter(c => c.status === "offline").length;
    const degraded = allCameras.filter(c => c.status === "degraded").length;

    return c.json({
        total: allCameras.length,
        online,
        offline,
        degraded,
        cameras: allCameras,
    });
});

// Get single camera
cameraRoutes.get("/:id", requirePermission("cameras:read"), async (c) => {
    const camera = await db.query.cameras.findFirst({
        where: eq(cameras.id, c.req.param("id")),
        with: {
            room: {
                with: {
                    unit: {
                        with: { organization: true },
                    },
                },
            },
            deviceStatuses: {
                limit: 50,
                orderBy: (ds, { desc }) => [desc(ds.timestamp)],
            },
        },
    });

    if (!camera) {
        return c.json({ error: "Camera not found" }, 404);
    }

    return c.json(camera);
});

// Create camera
cameraRoutes.post("/", requirePermission("cameras:create"), async (c) => {
    const user = c.get("user");
    const { name, rtspUrl, type, roomId, roiConfig, threshold } = await c.req.json();

    const [camera] = await db
        .insert(cameras)
        .values({
            name,
            rtspUrl,
            type: type || "entry",
            roomId,
            roiConfig,
            threshold: threshold || 0.85,
        })
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "create",
        entityType: "camera",
        entityId: camera.id,
        newValue: { name: camera.name, type: camera.type, roomId: camera.roomId },
    });

    return c.json(camera, 201);
});

// Update camera
cameraRoutes.put("/:id", requirePermission("cameras:update"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { name, rtspUrl, type, roomId, roiConfig, threshold } = await c.req.json();

    const oldCamera = await db.query.cameras.findFirst({
        where: eq(cameras.id, id),
    });

    const [camera] = await db
        .update(cameras)
        .set({ name, rtspUrl, type, roomId, roiConfig, threshold, updatedAt: new Date() })
        .where(eq(cameras.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "update",
        entityType: "camera",
        entityId: id,
        oldValue: { threshold: oldCamera?.threshold },
        newValue: { threshold: camera.threshold },
    });

    return c.json(camera);
});

// Delete camera
cameraRoutes.delete("/:id", requirePermission("cameras:delete"), async (c) => {
    const id = c.req.param("id");

    await db.delete(cameras).where(eq(cameras.id, id));

    return c.json({ message: "Camera deleted" });
});

// Test camera stream (placeholder)
cameraRoutes.post("/:id/test", requirePermission("cameras:update"), async (c) => {
    const camera = await db.query.cameras.findFirst({
        where: eq(cameras.id, c.req.param("id")),
    });

    if (!camera) {
        return c.json({ error: "Camera not found" }, 404);
    }

    // Simulate test result
    return c.json({
        success: true,
        rtspUrl: camera.rtspUrl,
        latency: Math.floor(Math.random() * 100) + 50,
        resolution: "1920x1080",
        fps: 25,
    });
});

// Receive heartbeat from AI node (no auth - uses API key)
cameraRoutes.post("/:id/heartbeat", async (c) => {
    const id = c.req.param("id");
    const { fps, status, errorMsg } = await c.req.json();

    await db
        .update(cameras)
        .set({
            status: status || "online",
            lastHeartbeat: new Date(),
        })
        .where(eq(cameras.id, id));

    await db.insert(deviceStatuses).values({
        cameraId: id,
        status: status || "online",
        fps,
        errorMsg,
    });

    // Broadcast status update
    try {
        broadcast("camera:status", {
            cameraId: id,
            status: status || "online",
            fps,
            timestamp: new Date(),
        });
    } catch (e) {
        // WebSocket broadcast may fail if no clients connected
    }

    return c.json({ received: true });
});
