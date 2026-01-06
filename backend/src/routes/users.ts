import { Hono } from "hono";
import { hash } from "bcrypt";
import { db } from "../db";
import { users, userRoles, roles, auditLogs } from "../db/schema";
import { eq, like, or, and } from "drizzle-orm";
import { authMiddleware, requirePermission } from "../middleware/auth";

export const userRoutes = new Hono();

userRoutes.use("*", authMiddleware);

// Get all users
userRoutes.get("/", requirePermission("users:read"), async (c) => {
    const unitId = c.req.query("unitId");
    const status = c.req.query("status");
    const search = c.req.query("search");

    const allUsers = await db.query.users.findMany({
        columns: {
            passwordHash: false,
        },
        with: {
            unit: true,
            userRoles: {
                with: { role: true },
            },
        },
        orderBy: (user, { asc }) => [asc(user.fullName)],
    });

    let filtered = allUsers;
    if (unitId) filtered = filtered.filter(u => u.unitId === unitId);
    if (status) filtered = filtered.filter(u => u.status === status);
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(u =>
            u.email.toLowerCase().includes(s) ||
            u.fullName.toLowerCase().includes(s)
        );
    }

    return c.json(filtered);
});

// Get single user
userRoutes.get("/:id", requirePermission("users:read"), async (c) => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, c.req.param("id")),
        columns: { passwordHash: false },
        with: {
            unit: {
                with: { organization: true },
            },
            userRoles: {
                with: {
                    role: {
                        with: {
                            permissions: {
                                with: { permission: true },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
});

// Create user
userRoutes.post("/", requirePermission("users:create"), async (c) => {
    const currentUser = c.get("user");
    const { email, password, fullName, unitId, roleIds } = await c.req.json();

    const passwordHash = await hash(password, 10);

    const [user] = await db
        .insert(users)
        .values({
            email,
            passwordHash,
            fullName,
            unitId,
        })
        .returning();

    // Assign roles
    if (roleIds && roleIds.length > 0) {
        await db.insert(userRoles).values(
            roleIds.map((roleId: string) => ({
                userId: user.id,
                roleId,
            }))
        );
    }

    await db.insert(auditLogs).values({
        userId: currentUser.id,
        action: "create",
        entityType: "user",
        entityId: user.id,
        newValue: { id: user.id, email: user.email, fullName: user.fullName },
    });

    return c.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
    }, 201);
});

// Update user
userRoutes.put("/:id", requirePermission("users:update"), async (c) => {
    const currentUser = c.get("user");
    const id = c.req.param("id");
    const { fullName, unitId, status, avatarUrl, roleIds } = await c.req.json();

    const oldUser = await db.query.users.findFirst({
        where: eq(users.id, id),
    });

    const [user] = await db
        .update(users)
        .set({ fullName, unitId, status, avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

    // Update roles if provided
    if (roleIds) {
        await db.delete(userRoles).where(eq(userRoles.userId, id));
        if (roleIds.length > 0) {
            await db.insert(userRoles).values(
                roleIds.map((roleId: string) => ({
                    userId: id,
                    roleId,
                }))
            );
        }
    }

    await db.insert(auditLogs).values({
        userId: currentUser.id,
        action: "update",
        entityType: "user",
        entityId: id,
        oldValue: { fullName: oldUser?.fullName, status: oldUser?.status },
        newValue: { fullName: user.fullName, status: user.status },
    });

    return c.json(user);
});

// Delete user
userRoutes.delete("/:id", requirePermission("users:delete"), async (c) => {
    const currentUser = c.get("user");
    const id = c.req.param("id");

    await db.delete(users).where(eq(users.id, id));

    await db.insert(auditLogs).values({
        userId: currentUser.id,
        action: "delete",
        entityType: "user",
        entityId: id,
    });

    return c.json({ message: "User deleted" });
});

// Get all roles
userRoutes.get("/roles/list", requirePermission("users:read"), async (c) => {
    const allRoles = await db.query.roles.findMany({
        with: {
            permissions: {
                with: { permission: true },
            },
        },
    });

    return c.json(allRoles);
});
