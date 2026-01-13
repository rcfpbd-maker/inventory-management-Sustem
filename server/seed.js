import pool from "./src/config/db.js";
import { getSeedData } from "./src/utils/seedData.js";

async function seedDatabase() {
    const connection = await pool.getConnection();

    try {
        console.log("🌱 Starting database seeding...\n");

        const data = await getSeedData();

        // 1. Seed Users
        console.log("Creating users...");
        for (const user of data.users) {
            const [existing] = await connection.query(
                "SELECT id FROM users WHERE email = ?",
                [user.email]
            );

            if (existing.length > 0) {
                console.log(`  ⚠️  User ${user.email} already exists, skipping...`);
                continue;
            }

            await connection.query(
                `INSERT INTO users (id, username, email, password, role, permissions) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    user.username,
                    user.email,
                    user.password,
                    user.role,
                    user.permissions,
                ]
            );
            console.log(`  ✓ Created user: ${user.email} (${user.role})`);
        }

        // 2. Seed Categories
        console.log("\nCreating categories...");
        for (const category of data.categories) {
            const [existing] = await connection.query(
                "SELECT id FROM categories WHERE name = ?",
                [category.name]
            );

            if (existing.length === 0) {
                await connection.query(
                    "INSERT INTO categories (id, name) VALUES (?, ?)",
                    [category.id, category.name]
                );
                console.log(`  ✓ Created category: ${category.name}`);
            }
        }

        // 3. Seed Products
        console.log("\nCreating products...");
        for (const product of data.products) {
            const [existing] = await connection.query(
                "SELECT id FROM products WHERE name = ?",
                [product.name]
            );

            if (existing.length === 0) {
                await connection.query(
                    `INSERT INTO products (id, name, category_id, purchase_price, sale_price, stock_quantity) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        product.id,
                        product.name,
                        product.category_id,
                        product.purchase_price,
                        product.sale_price,
                        product.stock_quantity,
                    ]
                );
                console.log(`  ✓ Created product: ${product.name}`);
            }
        }

        // 4. Seed Customers
        console.log("\nCreating customers...");
        for (const customer of data.customers) {
            const [existing] = await connection.query(
                "SELECT id FROM customers WHERE email = ?",
                [customer.email]
            );

            if (existing.length === 0) {
                await connection.query(
                    "INSERT INTO customers (id, name, phone, email) VALUES (?, ?, ?, ?)",
                    [customer.id, customer.name, customer.phone, customer.email]
                );
                console.log(`  ✓ Created customer: ${customer.name}`);
            }
        }

        // 5. Seed Suppliers
        console.log("\nCreating suppliers...");
        for (const supplier of data.suppliers) {
            const [existing] = await connection.query(
                "SELECT id FROM suppliers WHERE email = ?",
                [supplier.email]
            );

            if (existing.length === 0) {
                await connection.query(
                    "INSERT INTO suppliers (id, name, phone, email) VALUES (?, ?, ?, ?)",
                    [supplier.id, supplier.name, supplier.phone, supplier.email]
                );
                console.log(`  ✓ Created supplier: ${supplier.name}`);
            }
        }

        console.log("\n✅ Database seeding completed successfully!");
        console.log("\n📝 Test Login Credentials:");
        console.log("==========================");
        console.log("Super Admin:");
        console.log("  Email: superadmin@gmail.com");
        console.log("  Password: 12345678\n");
        console.log("Admin:");
        console.log("  Email: admin@gmail.com");
        console.log("  Password: 12345678\n");
        console.log("Staff:");
        console.log("  Email: staff@gmail.com");
        console.log("  Password: 12345678\n");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        connection.release();
        await pool.end();
        process.exit(0);
    }
}

seedDatabase();
