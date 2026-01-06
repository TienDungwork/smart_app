import { Hono } from "hono";
import { db } from "../db";
import { attendanceRecords, auditLogs } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";

export const attendanceRoutes = new Hono();

attendanceRoutes.use("*", authMiddleware);

// Get attendance for session
attendanceRoutes.get("/session/:sessionId", requirePermission("attendance:read"), async (c) => {
    const sessionId = c.req.param("sessionId");

    const records = await db.query.attendanceRecords.findMany({
        where: eq(attendanceRecords.sessionId, sessionId),
        with: {
            person: {
                with: { faceProfiles: true },
            },
        },
        orderBy: (r, { asc }) => [asc(r.createdAt)],
    });

    const summary = {
        total: records.length,
        present: records.filter(r => r.status === "present").length,
        late: records.filter(r => r.status === "late").length,
        absent: records.filter(r => r.status === "absent").length,
    };

    return c.json({ records, summary });
});

// Get attendance for person
attendanceRoutes.get("/person/:personId", requirePermission("attendance:read"), async (c) => {
    const personId = c.req.param("personId");
    const from = c.req.query("from");
    const to = c.req.query("to");

    const records = await db.query.attendanceRecords.findMany({
        where: eq(attendanceRecords.personId, personId),
        with: {
            session: {
                with: { room: true },
            },
        },
        orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    let filtered = records;
    if (from) {
        const fromDate = new Date(from);
        filtered = filtered.filter(r => new Date(r.createdAt) >= fromDate);
    }
    if (to) {
        const toDate = new Date(to);
        filtered = filtered.filter(r => new Date(r.createdAt) <= toDate);
    }

    const summary = {
        total: filtered.length,
        present: filtered.filter(r => r.status === "present").length,
        late: filtered.filter(r => r.status === "late").length,
        absent: filtered.filter(r => r.status === "absent").length,
        attendanceRate: filtered.length > 0
            ? ((filtered.filter(r => r.status !== "absent").length / filtered.length) * 100).toFixed(1)
            : 0,
    };

    return c.json({ records: filtered, summary });
});

// Manual check-in
attendanceRoutes.post("/checkin", requirePermission("attendance:update"), async (c) => {
    const user = c.get("user");
    const { sessionId, personId, notes } = await c.req.json();

    // Get session to check grace period
    const session = await db.query.sessions.findFirst({
        where: eq(attendanceRecords.sessionId, sessionId),
    });

    const now = new Date();
    const startTime = session?.startTime ? new Date(session.startTime) : now;
    const gracePeriodMs = (session?.gracePeriod || 15) * 60 * 1000;
    const isLate = now.getTime() > startTime.getTime() + gracePeriodMs;

    const [record] = await db
        .update(attendanceRecords)
        .set({
            status: isLate ? "late" : "present",
            checkinTime: now,
            isManual: true,
            notes,
            updatedAt: now,
        })
        .where(
            and(
                eq(attendanceRecords.sessionId, sessionId),
                eq(attendanceRecords.personId, personId)
            )
        )
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "manual_checkin",
        entityType: "attendance",
        entityId: record?.id,
        newValue: { sessionId, personId, status: record?.status },
    });

    return c.json(record);
});

// Manual check-out
attendanceRoutes.post("/checkout", requirePermission("attendance:update"), async (c) => {
    const user = c.get("user");
    const { sessionId, personId, notes } = await c.req.json();

    const [record] = await db
        .update(attendanceRecords)
        .set({
            checkoutTime: new Date(),
            notes,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(attendanceRecords.sessionId, sessionId),
                eq(attendanceRecords.personId, personId)
            )
        )
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "manual_checkout",
        entityType: "attendance",
        entityId: record?.id,
    });

    return c.json(record);
});

// Update attendance status (admin override)
attendanceRoutes.put("/:id", requirePermission("attendance:update"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { status, notes } = await c.req.json();

    const oldRecord = await db.query.attendanceRecords.findFirst({
        where: eq(attendanceRecords.id, id),
    });

    const [record] = await db
        .update(attendanceRecords)
        .set({
            status,
            notes,
            isManual: true,
            updatedAt: new Date(),
        })
        .where(eq(attendanceRecords.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "update",
        entityType: "attendance",
        entityId: id,
        oldValue: { status: oldRecord?.status },
        newValue: { status: record.status },
    });

    return c.json(record);
});
