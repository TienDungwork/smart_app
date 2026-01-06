import { Hono } from "hono";
import { db } from "../db";
import { sessions, sessionRosters, attendanceRecords, auditLogs } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";
import { broadcast } from "../index";

export const sessionRoutes = new Hono();

sessionRoutes.use("*", authMiddleware);

// Get all sessions
sessionRoutes.get("/", requirePermission("sessions:read"), async (c) => {
    const roomId = c.req.query("roomId");
    const status = c.req.query("status");
    const hostId = c.req.query("hostId");
    const date = c.req.query("date"); // YYYY-MM-DD

    const allSessions = await db.query.sessions.findMany({
        with: {
            room: {
                with: { unit: true },
            },
            host: {
                columns: { id: true, fullName: true, email: true },
            },
            rosters: true,
            attendanceRecords: true,
        },
        orderBy: (s, { desc }) => [desc(s.startTime)],
    });

    let filtered = allSessions;
    if (roomId) filtered = filtered.filter(s => s.roomId === roomId);
    if (status) filtered = filtered.filter(s => s.status === status);
    if (hostId) filtered = filtered.filter(s => s.hostId === hostId);
    if (date) {
        const targetDate = new Date(date);
        filtered = filtered.filter(s => {
            const sessionDate = new Date(s.startTime);
            return sessionDate.toDateString() === targetDate.toDateString();
        });
    }

    return c.json(filtered.map(s => ({
        ...s,
        _count: {
            roster: s.rosters.length,
            present: s.attendanceRecords.filter(a => a.status === "present").length,
            late: s.attendanceRecords.filter(a => a.status === "late").length,
            absent: s.attendanceRecords.filter(a => a.status === "absent").length,
        },
    })));
});

// Get today's sessions
sessionRoutes.get("/today", requirePermission("sessions:read"), async (c) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const allSessions = await db.query.sessions.findMany({
        with: {
            room: true,
            host: {
                columns: { id: true, fullName: true },
            },
            rosters: true,
            attendanceRecords: true,
        },
        orderBy: (s, { asc }) => [asc(s.startTime)],
    });

    const todaySessions = allSessions.filter(s => {
        const startTime = new Date(s.startTime);
        return startTime >= today && startTime < tomorrow;
    });

    return c.json(todaySessions.map(s => ({
        ...s,
        _count: {
            roster: s.rosters.length,
            present: s.attendanceRecords.filter(a => a.status === "present" || a.status === "late").length,
        },
    })));
});

// Get single session
sessionRoutes.get("/:id", requirePermission("sessions:read"), async (c) => {
    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, c.req.param("id")),
        with: {
            room: {
                with: {
                    unit: true,
                    cameras: true,
                },
            },
            host: {
                columns: { id: true, fullName: true, email: true },
            },
            rosters: {
                with: {
                    person: {
                        with: { faceProfiles: true },
                    },
                },
            },
            attendanceRecords: {
                with: { person: true },
            },
            recognitionEvents: {
                orderBy: (e, { desc }) => [desc(e.timestamp)],
                limit: 100,
            },
            unknownFaces: {
                orderBy: (u, { desc }) => [desc(u.timestamp)],
            },
        },
    });

    if (!session) {
        return c.json({ error: "Session not found" }, 404);
    }

    return c.json(session);
});

// Create session
sessionRoutes.post("/", requirePermission("sessions:create"), async (c) => {
    const user = c.get("user");
    const { title, description, roomId, startTime, endTime, gracePeriod, rosterPersonIds } = await c.req.json();

    const [session] = await db
        .insert(sessions)
        .values({
            title,
            description,
            roomId,
            hostId: user.id,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            gracePeriod: gracePeriod || 15,
        })
        .returning();

    // Create roster entries
    if (rosterPersonIds && rosterPersonIds.length > 0) {
        await db.insert(sessionRosters).values(
            rosterPersonIds.map((personId: string) => ({
                sessionId: session.id,
                personId,
            }))
        );

        // Create initial attendance records (absent by default)
        await db.insert(attendanceRecords).values(
            rosterPersonIds.map((personId: string) => ({
                sessionId: session.id,
                personId,
                status: "absent" as const,
            }))
        );
    }

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "create",
        entityType: "session",
        entityId: session.id,
        newValue: session,
    });

    return c.json(session, 201);
});

// Update session
sessionRoutes.put("/:id", requirePermission("sessions:update"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { title, description, startTime, endTime, gracePeriod } = await c.req.json();

    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, id),
    });

    if (session?.status === "locked") {
        return c.json({ error: "Session is locked" }, 400);
    }

    const [updated] = await db
        .update(sessions)
        .set({
            title,
            description,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
            gracePeriod,
            updatedAt: new Date(),
        })
        .where(eq(sessions.id, id))
        .returning();

    return c.json(updated);
});

// Start session
sessionRoutes.post("/:id/start", requirePermission("sessions:update"), async (c) => {
    const id = c.req.param("id");

    const [session] = await db
        .update(sessions)
        .set({ status: "running", updatedAt: new Date() })
        .where(eq(sessions.id, id))
        .returning();

    // Broadcast session start
    try {
        broadcast(`session:${id}`, { type: "session:started", sessionId: id });
    } catch (e) { }

    return c.json(session);
});

// End session
sessionRoutes.post("/:id/end", requirePermission("sessions:update"), async (c) => {
    const id = c.req.param("id");

    const [session] = await db
        .update(sessions)
        .set({ status: "ended", updatedAt: new Date() })
        .where(eq(sessions.id, id))
        .returning();

    try {
        broadcast(`session:${id}`, { type: "session:ended", sessionId: id });
    } catch (e) { }

    return c.json(session);
});

// Lock session
sessionRoutes.post("/:id/lock", requirePermission("sessions:update"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const [session] = await db
        .update(sessions)
        .set({ status: "locked", lockedAt: new Date(), updatedAt: new Date() })
        .where(eq(sessions.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "lock",
        entityType: "session",
        entityId: id,
    });

    return c.json(session);
});

// Delete session
sessionRoutes.delete("/:id", requirePermission("sessions:delete"), async (c) => {
    const id = c.req.param("id");

    await db.delete(sessions).where(eq(sessions.id, id));

    return c.json({ message: "Session deleted" });
});

// ============== ROSTER MANAGEMENT ==============

// Add person to roster
sessionRoutes.post("/:id/roster", requirePermission("sessions:update"), async (c) => {
    const sessionId = c.req.param("id");
    const { personId } = await c.req.json();

    await db.insert(sessionRosters).values({ sessionId, personId });
    await db.insert(attendanceRecords).values({
        sessionId,
        personId,
        status: "absent",
    });

    return c.json({ message: "Person added to roster" }, 201);
});

// Remove person from roster
sessionRoutes.delete("/:id/roster/:personId", requirePermission("sessions:update"), async (c) => {
    const sessionId = c.req.param("id");
    const personId = c.req.param("personId");

    await db.delete(sessionRosters).where(
        and(
            eq(sessionRosters.sessionId, sessionId),
            eq(sessionRosters.personId, personId)
        )
    );

    return c.json({ message: "Person removed from roster" });
});
