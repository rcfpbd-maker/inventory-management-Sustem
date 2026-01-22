import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function checkTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_NAME || "ims_v2",
    });

    const [tables] = await connection.query("SHOW TABLES LIKE 'settings'");
    if (tables.length === 0) {
        console.log("Table 'settings' does NOT exist.");
    } else {
        const [rows] = await connection.query("SHOW COLUMNS FROM settings");
        console.log(JSON.stringify(rows, null, 2));
    }
    await connection.end();
}

checkTable().catch(console.error);
