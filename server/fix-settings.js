import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function fixSettingsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_NAME || "ims_v2",
    });

    console.log("Dropping and recreating settings table...");
    await connection.query("DROP TABLE IF EXISTS settings");
    await connection.query(`
    CREATE TABLE settings (
      id INT PRIMARY KEY DEFAULT 1,
      shop_name VARCHAR(255) DEFAULT 'IMS Store',
      shop_email VARCHAR(255) DEFAULT 'contact@ims.com',
      shop_phone VARCHAR(50) DEFAULT '0123456789',
      shop_address TEXT,
      currency_symbol VARCHAR(10) DEFAULT '৳',
      footer_text TEXT,
      low_stock_threshold INT DEFAULT 10,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT single_row CHECK (id = 1)
    )
  `);

    await connection.query(`
    INSERT INTO settings (id, shop_name, shop_email, shop_phone, shop_address, currency_symbol, footer_text, low_stock_threshold)
    VALUES (1, 'IMS Store', 'contact@ims.com', '0123456789', 'Main Dhaka, Bangladesh', '৳', 'Thank you for shopping with us!', 10)
  `);

    console.log("Settings table fixed.");
    await connection.end();
}

fixSettingsTable().catch(console.error);
