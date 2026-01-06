import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function testLoginQuery() {
    try {
        console.log("Testing login query with relations...");
        
        const user = await db.query.users.findFirst({
            where: eq(users.email, "admin@demo.com"),
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
            console.log("User NOT FOUND");
            return;
        }
        
        console.log("User found:", {
            id: user.id,
            email: user.email,
            unit: user.unit ? {
                id: user.unit.id,
                name: user.unit.name,
            } : null,
            roles: user.userRoles.map((ur: any) => ur.role?.name || "NO ROLE"),
        });
        
    } catch (error) {
        console.error("Query error:", error);
    }
}

testLoginQuery();
