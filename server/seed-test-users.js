import pool from "./src/config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

async function createTestUsers() {
    const connection = await pool.getConnection();

    try {
        console.log("Creating test users...");

        const testUsers = [
            {
                id: uuidv4(),
                username: "Super Admin",
                email: "superadmin@gmail.com",
                password: "12345678",
                role: "SUPER_ADMIN",
            },
            {
                id: uuidv4(),
                username: "Admin User",
                email: "admin@gmail.com",
                password: "12345678",
                role: "ADMIN",
            },
            {
                id: uuidv4(),
                username: "Staff User",
                email: "staff@gmail.com",
                password: "12345678",
                role: "STAFF",
            },
        ];

        for (const user of testUsers) {
            // Check if user already exists
            const [existing] = await connection.query(
                "SELECT id FROM users WHERE email = ?",
                [user.email]
            );

            if (existing.length > 0) {
                console.log(`User ${user.email} already exists, skipping...`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Insert user
            await connection.query(
                `INSERT INTO users (id, username, email, password, role, permissions) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    user.username,
                    user.email,
                    hashedPassword,
                    user.role,
                    JSON.stringify({}),
                ]
            );

            console.log(`✓ Created user: ${user.email} (${user.role})`);
        }

        console.log("\n✅ Test users created successfully!");
        console.log("\nLogin Credentials:");
        console.log("==================");
        testUsers.forEach((user) => {
            console.log(`${user.role}:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${user.password}`);
            console.log("");
        });
    } catch (error) {
        console.error("Error creating test users:", error);
    } finally {
        connection.release();
        process.exit(0);
    }
}

createTestUsers();
