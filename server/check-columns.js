import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function checkColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_NAME || "ims_v2",
    });

    const [rows] = await connection.query("SHOW COLUMNS FROM audit_logs");
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}

checkColumns().catch(console.error);
