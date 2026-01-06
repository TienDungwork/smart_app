import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function testDb() {
    try {
        console.log("Testing database connection...");
        
        // Test query
        const user = await db.query.users.findFirst({
            where: eq(users.email, "admin@demo.com"),
        });
        
        console.log("User found:", user ? {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            status: user.status,
        } : "NOT FOUND");
        
    } catch (error) {
        console.error("Database error:", error);
    }
}

testDb();
