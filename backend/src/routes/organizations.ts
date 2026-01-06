import { Hono } from "hono";
import { db } from "../db";
import { organizations, units, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";

export const organizationRoutes = new Hono();

organizationRoutes.use("*", authMiddleware);

// Get all organizations
organizationRoutes.get("/", requirePermission("organizations:read"), async (c) => {
    const orgs = await db.query.organizations.findMany({
        with: {
            units: true,
        },
        orderBy: (org, { asc }) => [asc(org.name)],
    });

    return c.json(orgs.map(org => ({
        ...org,
        _count: { units: org.units.length }
    })));
});

// Get single organization
organizationRoutes.get("/:id", requirePermission("organizations:read"), async (c) => {
    const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, c.req.param("id")),
        with: {
            units: {
                where: eq(units.parentId, null as any),
                with: {
                    children: true,
                },
            },
        },
    });

    if (!org) {
        return c.json({ error: "Organization not found" }, 404);
    }

    return c.json(org);
});

// Create organization
organizationRoutes.post("/", requirePermission("organizations:create"), async (c) => {
    const user = c.get("user");
    const { name, code, settings } = await c.req.json();

    const [org] = await db
        .insert(organizations)
        .values({ name, code, settings })
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "create",
        entityType: "organization",
        entityId: org.id,
        newValue: org,
    });

    return c.json(org, 201);
});

// Update organization
organizationRoutes.put("/:id", requirePermission("organizations:update"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { name, code, settings } = await c.req.json();

    const oldOrg = await db.query.organizations.findFirst({
        where: eq(organizations.id, id),
    });

    const [org] = await db
        .update(organizations)
        .set({ name, code, settings, updatedAt: new Date() })
        .where(eq(organizations.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "update",
        entityType: "organization",
        entityId: id,
        oldValue: oldOrg,
        newValue: org,
    });

    return c.json(org);
});

// Delete organization
organizationRoutes.delete("/:id", requirePermission("organizations:delete"), async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const [org] = await db
        .delete(organizations)
        .where(eq(organizations.id, id))
        .returning();

    await db.insert(auditLogs).values({
        userId: user.id,
        action: "delete",
        entityType: "organization",
        entityId: id,
        oldValue: org,
    });

    return c.json({ message: "Organization deleted" });
});
