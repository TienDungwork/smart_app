import { Hono } from "hono";
import { hash, compare } from "bcrypt";
import { db } from "../db";
import { users, userRoles, roles, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateToken, authMiddleware } from "../middleware/auth";
import { z } from "zod";

export const authRoutes = new Hono();

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    unitId: z.string().uuid().optional(),
});

// Login
authRoutes.post("/login", async (c) => {
    try {
        const body = await c.req.json();
        const { email, password } = loginSchema.parse(body);

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            with: {
                unit: {
                    with: {
                        organization: true,
                    },
                },
                userRoles: {
                    with: {
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        if (user.status !== "active") {
            return c.json({ error: "Account is not active" }, 401);
        }

        const validPassword = await compare(password, user.passwordHash);
        if (!validPassword) {
            return c.json({ error: "Invalid credentials" }, 401);
        }

        const token = generateToken(user.id, user.email);

        // Log login
        await db.insert(auditLogs).values({
            userId: user.id,
            action: "login",
            entityType: "user",
            entityId: user.id,
            ipAddress: c.req.header("x-forwarded-for") || "unknown",
            userAgent: c.req.header("user-agent"),
        });

        return c.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                unit: user.unit,
                organization: (user.unit as any)?.organization,
                roles: user.userRoles.map((ur: any) => ur.role.name),
            },
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json({ error: "Validation failed", details: error.errors }, 400);
        }
        return c.json({ error: error.message }, 500);
    }
});

// Register
authRoutes.post("/register", async (c) => {
    try {
        const body = await c.req.json();
        const { email, password, fullName, unitId } = registerSchema.parse(body);

        // Check if email exists
        const existing = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existing) {
            return c.json({ error: "Email already registered" }, 409);
        }

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

        // Assign default role
        const defaultRole = await db.query.roles.findFirst({
            where: eq(roles.name, "user"),
        });

        if (defaultRole) {
            await db.insert(userRoles).values({
                userId: user.id,
                roleId: defaultRole.id,
            });
        }

        return c.json(
            {
                message: "User registered successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                },
            },
            201
        );
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json({ error: "Validation failed", details: error.errors }, 400);
        }
        return c.json({ error: error.message }, 500);
    }
});

// Get current user
authRoutes.get("/me", authMiddleware, async (c) => {
    const user = c.get("user");

    const fullUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        with: {
            unit: {
                with: {
                    organization: true,
                },
            },
        },
    });

    return c.json({
        ...user,
        avatarUrl: fullUser?.avatarUrl,
        unit: fullUser?.unit,
        organization: (fullUser?.unit as any)?.organization,
    });
});

// Change password
authRoutes.post("/change-password", authMiddleware, async (c) => {
    try {
        const user = c.get("user");
        const { currentPassword, newPassword } = await c.req.json();

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser) {
            return c.json({ error: "User not found" }, 404);
        }

        const validPassword = await compare(currentPassword, dbUser.passwordHash);
        if (!validPassword) {
            return c.json({ error: "Current password is incorrect" }, 400);
        }

        const newPasswordHash = await hash(newPassword, 10);

        await db
            .update(users)
            .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
            .where(eq(users.id, user.id));

        return c.json({ message: "Password changed successfully" });
    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});
