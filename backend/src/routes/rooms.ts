import { Hono } from "hono";
import { db } from "../db";
import { rooms, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";

export const roomRoutes = new Hono();

roomRoutes.use("*", authMiddleware);

// Get all rooms
roomRoutes.get("/", requirePermission("rooms:read"), async (c) => {
    const unitId = c.req.query("unitId");

    const allRooms = await db.query.rooms.findMany({
        with: {
            unit: {
                with: { organization: true },
            },
            cameras: true,
        },
        orderBy: (room, { asc }) => [asc(room.name)],
    });

    let filtered = allRooms;
    if (unitId) {
        filtered = filtered.filter(r => r.unitId === unitId);
    }

    return c.json(filtered.map(r => ({
        ...r,
        _count: {
            cameras: r.cameras.length,
            camerasOnline: r.cameras.filter(cam => cam.status === "online").length,
        },
    })));
});

// Get single room
roomRoutes.get("/:id", requirePermission("rooms:read"), async (c) => {
    const room = await db.query.rooms.findFirst({
        where: eq(rooms.id, c.req.param("id")),
        with: {
            unit: {
                with: { organization: true },
            },
            cameras: {
                with: {
                    deviceStatuses: {
                        limit: 1,
                        orderBy: (ds, { desc }) => [desc(ds.timestamp)]
                    },
                },
            },
            sessions: {
                limit: 5,
                orderBy: (s, { desc }) => [desc(s.startTime)],
            },
        },
    });

    if (!room) {
        return c.json({ error: "Room not found" }, 404);
    }

    return c.json(room);
});

// Create room
roomRoutes.post("/", requirePermission("rooms:create"), async (c) => {
    const user = c.get("user");
    const { name, location, capacity, unitId } = await c.req.json();

    const [room] = await db
        .insert(rooms)
        .values({ name, location, capacity, unitId })
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "create",
        entityType: "room",
        entityId: room.id,
        newValue: room,
    });

    return c.json(room, 201);
});

// Update room
roomRoutes.put("/:id", requirePermission("rooms:update"), async (c) => {
    const id = c.req.param("id");
    const { name, location, capacity } = await c.req.json();

    const [room] = await db
        .update(rooms)
        .set({ name, location, capacity, updatedAt: new Date() })
        .where(eq(rooms.id, id))
        .returning();

    return c.json(room);
});

// Delete room
roomRoutes.delete("/:id", requirePermission("rooms:delete"), async (c) => {
    const id = c.req.param("id");

    await db.delete(rooms).where(eq(rooms.id, id));

    return c.json({ message: "Room deleted" });
});
