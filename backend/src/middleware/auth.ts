import { Context, Next } from "hono";
import { sign, verify } from "jsonwebtoken";
import { db } from "../db";
import { users, userRoles, roles, rolePermissions, permissions } from "../db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    unitId: string | null;
    roles: string[];
    permissions: string[];
}

declare module "hono" {
    interface ContextVariableMap {
        user: AuthUser;
    }
}

export const generateToken = (userId: string, email: string): string => {
    return sign({ userId, email }, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Access token required" }, 401);
    }

    const token = authHeader.slice(7);

    try {
        const decoded = verify(token, JWT_SECRET) as { userId: string; email: string };

        // Get user with roles and permissions
        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId),
            with: {
                unit: true,
                userRoles: {
                    with: {
                        role: {
                            with: {
                                permissions: {
                                    with: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user || user.status !== "active") {
            return c.json({ error: "User not found or inactive" }, 401);
        }

        // Extract permissions
        const permissionSet = new Set<string>();
        const roleNames: string[] = [];

        user.userRoles.forEach((ur: any) => {
            roleNames.push(ur.role.name);
            ur.role.permissions.forEach((rp: any) => {
                permissionSet.add(`${rp.permission.resource}:${rp.permission.action}`);
            });
        });

        c.set("user", {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            unitId: user.unitId,
            roles: roleNames,
            permissions: Array.from(permissionSet),
        });

        await next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return c.json({ error: "Token expired" }, 401);
        }
        return c.json({ error: "Invalid token" }, 403);
    }
};

export const requirePermission = (...requiredPermissions: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const hasPermission = requiredPermissions.some(
            (perm) =>
                user.permissions.includes(perm) ||
                user.permissions.includes(`${perm.split(":")[0]}:manage`)
        );

        if (!hasPermission && !user.roles.includes("super_admin")) {
            return c.json({ error: "Insufficient permissions" }, 403);
        }

        await next();
    };
};
