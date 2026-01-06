import { Hono } from "hono";
import { db } from "../db";
import { persons, faceProfiles, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";

export const personRoutes = new Hono();

personRoutes.use("*", authMiddleware);

// Get all persons
personRoutes.get("/", requirePermission("persons:read"), async (c) => {
    const unitId = c.req.query("unitId");
    const status = c.req.query("status");
    const search = c.req.query("search");
    const hasEnrollment = c.req.query("hasEnrollment");

    const allPersons = await db.query.persons.findMany({
        with: {
            unit: true,
            faceProfiles: true,
        },
        orderBy: (person, { asc }) => [asc(person.fullName)],
    });

    let filtered = allPersons;
    if (unitId) filtered = filtered.filter(p => p.unitId === unitId);
    if (status) filtered = filtered.filter(p => p.status === status);
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p =>
            p.fullName.toLowerCase().includes(s) ||
            p.employeeId?.toLowerCase().includes(s) ||
            p.email?.toLowerCase().includes(s)
        );
    }
    if (hasEnrollment === "true") {
        filtered = filtered.filter(p => p.faceProfiles.length > 0);
    } else if (hasEnrollment === "false") {
        filtered = filtered.filter(p => p.faceProfiles.length === 0);
    }

    return c.json(filtered.map(p => ({
        ...p,
        enrollmentStatus: p.faceProfiles.length > 0 ? "enrolled" : "not_enrolled",
    })));
});

// Get single person
personRoutes.get("/:id", requirePermission("persons:read"), async (c) => {
    const person = await db.query.persons.findFirst({
        where: eq(persons.id, c.req.param("id")),
        with: {
            unit: {
                with: { organization: true },
            },
            faceProfiles: true,
            attendanceRecords: {
                limit: 10,
                orderBy: (rec, { desc }) => [desc(rec.createdAt)],
                with: { session: true },
            },
        },
    });

    if (!person) {
        return c.json({ error: "Person not found" }, 404);
    }

    return c.json(person);
});

// Create person
personRoutes.post("/", requirePermission("persons:create"), async (c) => {
    const user = c.get("user");
    const { fullName, employeeId, email, phone, unitId } = await c.req.json();

    const [person] = await db
        .insert(persons)
        .values({ fullName, employeeId, email, phone, unitId })
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "create",
        entityType: "person",
        entityId: person.id,
        newValue: person,
    });

    return c.json(person, 201);
});

// Bulk import persons
personRoutes.post("/import", requirePermission("persons:create"), async (c) => {
    const user = c.get("user");
    const { persons: personList, unitId } = await c.req.json();

    const toInsert = personList.map((p: any) => ({
        fullName: p.fullName,
        employeeId: p.employeeId,
        email: p.email,
        phone: p.phone,
        unitId: p.unitId || unitId,
    }));

    const inserted = await db.insert(persons).values(toInsert).returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "bulk_import",
        entityType: "person",
        newValue: { count: inserted.length },
    });

    return c.json({ imported: inserted.length }, 201);
});

// Update person
personRoutes.put("/:id", requirePermission("persons:update"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { fullName, employeeId, email, phone, unitId, status } = await c.req.json();

    const [person] = await db
        .update(persons)
        .set({ fullName, employeeId, email, phone, unitId, status, updatedAt: new Date() })
        .where(eq(persons.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "update",
        entityType: "person",
        entityId: id,
        newValue: person,
    });

    return c.json(person);
});

// Delete person
personRoutes.delete("/:id", requirePermission("persons:delete"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    await db.delete(persons).where(eq(persons.id, id));

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "delete",
        entityType: "person",
        entityId: id,
    });

    return c.json({ message: "Person deleted" });
});

// ============== FACE ENROLLMENT ==============

// Upload face for enrollment (simplified - would connect to AI in real impl)
personRoutes.post("/:id/faces", requirePermission("persons:update"), async (c) => {
    const user = c.get("user");
    const personId = c.req.param("id");
    const { imageUrl, embeddingRef } = await c.req.json();

    const [faceProfile] = await db
        .insert(faceProfiles)
        .values({
            personId,
            imageUrl,
            embeddingRef: embeddingRef || `embeddings/${personId}/${Date.now()}.bin`,
            qualityScore: 0.95,
            isPrimary: true,
        })
        .returning();

    // Set others as non-primary
    await db
        .update(faceProfiles)
        .set({ isPrimary: false })
        .where(eq(faceProfiles.personId, personId));

    await db
        .update(faceProfiles)
        .set({ isPrimary: true })
        .where(eq(faceProfiles.id, faceProfile.id));

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "face_enrollment",
        entityType: "person",
        entityId: personId,
        newValue: { faceProfileId: faceProfile.id },
    });

    return c.json(faceProfile, 201);
});

// Delete face profile
personRoutes.delete("/:id/faces/:faceId", requirePermission("persons:update"), async (c) => {
    const faceId = c.req.param("faceId");

    await db.delete(faceProfiles).where(eq(faceProfiles.id, faceId));

    return c.json({ message: "Face profile deleted" });
});
