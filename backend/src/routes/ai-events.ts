import { Hono } from "hono";
import { db } from "../db";
import { recognitionEvents, unknownFaces, attendanceRecords, sessions, cameras } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { broadcast } from "../index";

export const aiEventRoutes = new Hono();

// Middleware to verify API key from AI node
const verifyApiKey = async (c: any, next: any) => {
    const apiKey = c.req.header("X-API-Key");

    // In production, validate against stored API keys
    if (!apiKey || apiKey !== process.env.AI_API_KEY) {
        // For development, allow if no key set
        if (process.env.NODE_ENV !== "development" && process.env.AI_API_KEY) {
            return c.json({ error: "Invalid API key" }, 401);
        }
    }

    await next();
};

aiEventRoutes.use("*", verifyApiKey);

// Receive recognition event from AI node
aiEventRoutes.post("/recognition", async (c) => {
    const {
        sessionId,
        cameraId,
        personId,
        confidence,
        snapshotRef,
        direction,
        timestamp
    } = await c.req.json();

    // Get session and camera info
    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
    });

    const camera = await db.query.cameras.findFirst({
        where: eq(cameras.id, cameraId),
    });

    if (!session || session.status !== "running") {
        return c.json({ error: "Session not running" }, 400);
    }

    // Save recognition event
    const [event] = await db
        .insert(recognitionEvents)
        .values({
            sessionId,
            cameraId,
            personId,
            confidence,
            snapshotRef,
            direction: direction || camera?.type || "entry",
            timestamp: timestamp ? new Date(timestamp) : new Date(),
        })
        .returning();

    // Update attendance record if person is recognized
    if (personId) {
        const eventTime = new Date(timestamp || Date.now());
        const startTime = new Date(session.startTime);
        const gracePeriodMs = (session.gracePeriod || 15) * 60 * 1000;
        const isLate = eventTime.getTime() > startTime.getTime() + gracePeriodMs;

        const existingRecord = await db.query.attendanceRecords.findFirst({
            where: and(
                eq(attendanceRecords.sessionId, sessionId),
                eq(attendanceRecords.personId, personId)
            ),
        });

        if (existingRecord) {
            const isEntry = (direction || camera?.type) === "entry";

            if (isEntry && !existingRecord.checkinTime) {
                // First check-in
                await db
                    .update(attendanceRecords)
                    .set({
                        status: isLate ? "late" : "present",
                        checkinTime: eventTime,
                        checkinCameraId: cameraId,
                        updatedAt: new Date(),
                    })
                    .where(eq(attendanceRecords.id, existingRecord.id));
            } else if (!isEntry) {
                // Check-out
                await db
                    .update(attendanceRecords)
                    .set({
                        checkoutTime: eventTime,
                        checkoutCameraId: cameraId,
                        updatedAt: new Date(),
                    })
                    .where(eq(attendanceRecords.id, existingRecord.id));
            }
        }
    }

    // Broadcast realtime update
    try {
        broadcast(`session:${sessionId}`, {
            type: "recognition",
            event: {
                id: event.id,
                personId,
                cameraId,
                confidence,
                direction: direction || camera?.type,
                timestamp: event.timestamp,
            },
        });
    } catch (e) { }

    return c.json({ received: true, eventId: event.id });
});

// Receive unknown face event
aiEventRoutes.post("/unknown", async (c) => {
    const { sessionId, cameraId, snapshotRef, embeddingRef, timestamp } = await c.req.json();

    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
    });

    if (!session || session.status !== "running") {
        return c.json({ error: "Session not running" }, 400);
    }

    const [unknown] = await db
        .insert(unknownFaces)
        .values({
            sessionId,
            cameraId,
            snapshotRef,
            embeddingRef,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
        })
        .returning();

    // Broadcast unknown face alert
    try {
        broadcast(`session:${sessionId}`, {
            type: "unknown_face",
            unknown: {
                id: unknown.id,
                snapshotRef,
                cameraId,
                timestamp: unknown.timestamp,
            },
        });
    } catch (e) { }

    return c.json({ received: true, unknownId: unknown.id });
});

// Review unknown face - assign to person
aiEventRoutes.post("/unknown/:id/assign", async (c) => {
    const id = c.req.param("id");
    const { personId, reviewedById } = await c.req.json();

    const unknown = await db.query.unknownFaces.findFirst({
        where: eq(unknownFaces.id, id),
    });

    if (!unknown) {
        return c.json({ error: "Unknown face not found" }, 404);
    }

    // Update unknown face record
    await db
        .update(unknownFaces)
        .set({
            reviewStatus: "assigned",
            assignedToPersonId: personId,
            reviewedById,
            reviewedAt: new Date(),
        })
        .where(eq(unknownFaces.id, id));

    // Create recognition event for the assigned person
    await db.insert(recognitionEvents).values({
        sessionId: unknown.sessionId,
        cameraId: unknown.cameraId,
        personId,
        confidence: 1.0, // Manual assignment
        snapshotRef: unknown.snapshotRef,
        direction: "entry",
        timestamp: unknown.timestamp,
    });

    // Update attendance
    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, unknown.sessionId),
    });

    if (session) {
        const eventTime = new Date(unknown.timestamp);
        const startTime = new Date(session.startTime);
        const gracePeriodMs = (session.gracePeriod || 15) * 60 * 1000;
        const isLate = eventTime.getTime() > startTime.getTime() + gracePeriodMs;

        await db
            .update(attendanceRecords)
            .set({
                status: isLate ? "late" : "present",
                checkinTime: eventTime,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(attendanceRecords.sessionId, unknown.sessionId),
                    eq(attendanceRecords.personId, personId)
                )
            );
    }

    return c.json({ assigned: true });
});

// Ignore unknown face
aiEventRoutes.post("/unknown/:id/ignore", async (c) => {
    const id = c.req.param("id");
    const { reviewedById } = await c.req.json();

    await db
        .update(unknownFaces)
        .set({
            reviewStatus: "ignored",
            reviewedById,
            reviewedAt: new Date(),
        })
        .where(eq(unknownFaces.id, id));

    return c.json({ ignored: true });
});
