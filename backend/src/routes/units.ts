import { Hono } from "hono";
import { db } from "../db";
import { units, auditLogs } from "../db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";

export const unitRoutes = new Hono();

unitRoutes.use("*", authMiddleware);

// Get all units
unitRoutes.get("/", requirePermission("units:read"), async (c) => {
    const organizationId = c.req.query("organizationId");
    const parentId = c.req.query("parentId");

    let query = db.query.units.findMany({
        with: {
            organization: true,
            parent: true,
            children: true,
        },
        orderBy: (unit, { asc }) => [asc(unit.name)],
    });

    const allUnits = await query;

    let filtered = allUnits;
    if (organizationId) {
        filtered = filtered.filter(u => u.organizationId === organizationId);
    }
    if (parentId === "null") {
        filtered = filtered.filter(u => u.parentId === null);
    } else if (parentId) {
        filtered = filtered.filter(u => u.parentId === parentId);
    }

    return c.json(filtered);
});

// Get unit tree
unitRoutes.get("/tree/:organizationId", requirePermission("units:read"), async (c) => {
    const organizationId = c.req.param("organizationId");

    const allUnits = await db.query.units.findMany({
        where: eq(units.organizationId, organizationId),
        with: {
            children: {
                with: {
                    children: {
                        with: {
                            children: true,
                        },
                    },
                },
            },
        },
    });

    // Filter to root units only
    const rootUnits = allUnits.filter(u => u.parentId === null);

    return c.json(rootUnits);
});

// Get single unit
unitRoutes.get("/:id", requirePermission("units:read"), async (c) => {
    const unit = await db.query.units.findFirst({
        where: eq(units.id, c.req.param("id")),
        with: {
            organization: true,
            parent: true,
            children: true,
            users: { limit: 10 },
            persons: { limit: 10 },
            rooms: true,
        },
    });

    if (!unit) {
        return c.json({ error: "Unit not found" }, 404);
    }

    return c.json(unit);
});

// Create unit
unitRoutes.post("/", requirePermission("units:create"), async (c) => {
    const user = c.get("user");
    const { name, organizationId, parentId, level } = await c.req.json();

    const [unit] = await db
        .insert(units)
        .values({
            name,
            organizationId,
            parentId,
            level: level || 1,
        })
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "create",
        entityType: "unit",
        entityId: unit.id,
        newValue: unit,
    });

    return c.json(unit, 201);
});

// Update unit
unitRoutes.put("/:id", requirePermission("units:update"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { name, parentId, level } = await c.req.json();

    const oldUnit = await db.query.units.findFirst({
        where: eq(units.id, id),
    });

    const [unit] = await db
        .update(units)
        .set({ name, parentId, level, updatedAt: new Date() })
        .where(eq(units.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "update",
        entityType: "unit",
        entityId: id,
        oldValue: oldUnit,
        newValue: unit,
    });

    return c.json(unit);
});

// Delete unit
unitRoutes.delete("/:id", requirePermission("units:delete"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const [unit] = await db
        .delete(units)
        .where(eq(units.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "delete",
        entityType: "unit",
        entityId: id,
        oldValue: unit,
    });

    return c.json({ message: "Unit deleted" });
});
