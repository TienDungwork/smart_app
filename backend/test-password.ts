import { compare } from "bcrypt";
import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function testPassword() {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, "admin@demo.com"),
        });
        
        if (!user) {
            console.log("User not found");
            return;
        }
        
        console.log("User found:", user.email);
        console.log("Password hash:", user.passwordHash);
        
        const isValid = await compare("admin123", user.passwordHash);
        console.log("Password valid:", isValid);
        
    } catch (error) {
        console.error("Error:", error);
    }
}

testPassword();
