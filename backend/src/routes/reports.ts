import { Hono } from "hono";
import { db } from "../db";
import { attendanceRecords, sessions, persons, units, unknownFaces } from "../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";

export const reportRoutes = new Hono();

reportRoutes.use("*", authMiddleware);

// Dashboard stats
reportRoutes.get("/dashboard", requirePermission("reports:read"), async (c) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sessions
    const allSessions = await db.query.sessions.findMany({
        with: {
            attendanceRecords: true,
            rosters: true,
        },
    });

    const todaySessions = allSessions.filter(s => {
        const startTime = new Date(s.startTime);
        return startTime >= today && startTime < tomorrow;
    });

    // Camera status
    const allCameras = await db.query.cameras.findMany();
    const camerasOnline = allCameras.filter(c => c.status === "online").length;

    // Attendance rate
    let totalRoster = 0;
    let totalPresent = 0;
    todaySessions.forEach(s => {
        totalRoster += s.rosters.length;
        totalPresent += s.attendanceRecords.filter(a => a.status !== "absent").length;
    });

    // Unknown faces pending
    const unknownFacesList = await db.query.unknownFaces.findMany({
        where: eq(unknownFaces.reviewStatus, "pending"),
    });

    return c.json({
        todaySessions: {
            total: todaySessions.length,
            running: todaySessions.filter(s => s.status === "running").length,
            scheduled: todaySessions.filter(s => s.status === "scheduled").length,
            ended: todaySessions.filter(s => s.status === "ended" || s.status === "locked").length,
        },
        cameras: {
            total: allCameras.length,
            online: camerasOnline,
            offline: allCameras.length - camerasOnline,
        },
        attendance: {
            rate: totalRoster > 0 ? ((totalPresent / totalRoster) * 100).toFixed(1) : 0,
            present: totalPresent,
            total: totalRoster,
        },
        unknownPending: unknownFacesList.length,
    });
});

// Attendance report by session
reportRoutes.get("/session/:sessionId", requirePermission("reports:read"), async (c) => {
    const sessionId = c.req.param("sessionId");

    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
            room: true,
            host: true,
            attendanceRecords: {
                with: {
                    person: {
                        with: { unit: true },
                    },
                },
            },
        },
    });

    if (!session) {
        return c.json({ error: "Session not found" }, 404);
    }

    const records = session.attendanceRecords;
    const summary = {
        total: records.length,
        present: records.filter(r => r.status === "present").length,
        late: records.filter(r => r.status === "late").length,
        absent: records.filter(r => r.status === "absent").length,
        rate: records.length > 0
            ? ((records.filter(r => r.status !== "absent").length / records.length) * 100).toFixed(1)
            : 0,
    };

    return c.json({
        session: {
            id: session.id,
            title: session.title,
            room: (session.room as { name: string } | null)?.name,
            host: (session.host as { fullName: string } | null)?.fullName,
            startTime: session.startTime,
            endTime: session.endTime,
            status: session.status,
        },
        summary,
        records: records.map(r => ({
            personId: r.personId,
            personName: r.person?.fullName,
            employeeId: r.person?.employeeId,
            unit: r.person?.unit?.name,
            status: r.status,
            checkinTime: r.checkinTime,
            checkoutTime: r.checkoutTime,
        })),
    });
});

// Attendance report by person
reportRoutes.get("/person/:personId", requirePermission("reports:read"), async (c) => {
    const personId = c.req.param("personId");
    const from = c.req.query("from");
    const to = c.req.query("to");

    const person = await db.query.persons.findFirst({
        where: eq(persons.id, personId),
        with: {
            unit: true,
            attendanceRecords: {
                with: {
                    session: {
                        with: { room: true },
                    },
                },
                orderBy: (r, { desc }) => [desc(r.createdAt)],
            },
        },
    });

    if (!person) {
        return c.json({ error: "Person not found" }, 404);
    }

    let records = person.attendanceRecords;
    if (from) {
        const fromDate = new Date(from);
        records = records.filter(r => new Date(r.createdAt) >= fromDate);
    }
    if (to) {
        const toDate = new Date(to);
        records = records.filter(r => new Date(r.createdAt) <= toDate);
    }

    const summary = {
        total: records.length,
        present: records.filter(r => r.status === "present").length,
        late: records.filter(r => r.status === "late").length,
        absent: records.filter(r => r.status === "absent").length,
        rate: records.length > 0
            ? ((records.filter(r => r.status !== "absent").length / records.length) * 100).toFixed(1)
            : 0,
    };

    return c.json({
        person: {
            id: person.id,
            fullName: person.fullName,
            employeeId: person.employeeId,
            unit: (person.unit as { name: string } | null)?.name,
        },
        summary,
        records: records.map(r => ({
            sessionId: r.sessionId,
            sessionTitle: r.session?.title,
            room: r.session?.room?.name,
            date: r.session?.startTime,
            status: r.status,
            checkinTime: r.checkinTime,
            checkoutTime: r.checkoutTime,
        })),
    });
});

// Attendance report by unit
reportRoutes.get("/unit/:unitId", requirePermission("reports:read"), async (c) => {
    const unitId = c.req.param("unitId");
    const from = c.req.query("from");
    const to = c.req.query("to");

    const unit = await db.query.units.findFirst({
        where: eq(units.id, unitId),
        with: {
            persons: {
                with: {
                    attendanceRecords: {
                        with: {
                            session: true,
                        },
                    },
                },
            },
        },
    });

    if (!unit) {
        return c.json({ error: "Unit not found" }, 404);
    }

    const personStats = unit.persons.map(p => {
        let records = p.attendanceRecords;
        if (from) {
            const fromDate = new Date(from);
            records = records.filter(r => new Date(r.createdAt) >= fromDate);
        }
        if (to) {
            const toDate = new Date(to);
            records = records.filter(r => new Date(r.createdAt) <= toDate);
        }

        return {
            personId: p.id,
            fullName: p.fullName,
            employeeId: p.employeeId,
            total: records.length,
            present: records.filter(r => r.status === "present").length,
            late: records.filter(r => r.status === "late").length,
            absent: records.filter(r => r.status === "absent").length,
            rate: records.length > 0
                ? ((records.filter(r => r.status !== "absent").length / records.length) * 100).toFixed(1)
                : 0,
        };
    });

    const totalSessions = personStats.reduce((sum, p) => sum + p.total, 0);
    const totalPresent = personStats.reduce((sum, p) => sum + p.present + p.late, 0);

    return c.json({
        unit: {
            id: unit.id,
            name: unit.name,
        },
        summary: {
            totalPersons: personStats.length,
            averageRate: totalSessions > 0
                ? ((totalPresent / totalSessions) * 100).toFixed(1)
                : 0,
        },
        persons: personStats,
    });
});

// Export data (returns JSON, frontend converts to Excel)
reportRoutes.get("/export/session/:sessionId", requirePermission("reports:read"), async (c) => {
    const sessionId = c.req.param("sessionId");

    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
            room: true,
            attendanceRecords: {
                with: {
                    person: {
                        with: { unit: true },
                    },
                },
            },
        },
    });

    if (!session) {
        return c.json({ error: "Session not found" }, 404);
    }

    const exportData = session.attendanceRecords.map(r => ({
        "Họ Tên": r.person?.fullName,
        "Mã Nhân Sự": r.person?.employeeId,
        "Đơn Vị": r.person?.unit?.name,
        "Trạng Thái": r.status === "present" ? "Có mặt" : r.status === "late" ? "Đi muộn" : "Vắng",
        "Giờ Vào": r.checkinTime ? new Date(r.checkinTime).toLocaleTimeString("vi-VN") : "",
        "Giờ Ra": r.checkoutTime ? new Date(r.checkoutTime).toLocaleTimeString("vi-VN") : "",
    }));

    return c.json({
        filename: `attendance_${session.title}_${new Date().toISOString().split("T")[0]}.xlsx`,
        data: exportData,
    });
});
