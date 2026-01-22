import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function migrateAuditLogs() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "ims_v2",
    });

    console.log("Starting audit_logs migration...");

    // Check if columns already exist
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM audit_logs LIKE 'category'"
    );

    if (columns.length > 0) {
      console.log("Migration already applied. Skipping.");
      return;
    }

    // Add new columns
    console.log("Adding category and action columns...");
    await connection.query(`
      ALTER TABLE audit_logs 
      ADD COLUMN category VARCHAR(50) DEFAULT 'SYSTEM' AFTER event,
      ADD COLUMN action VARCHAR(20) DEFAULT 'OTHER' AFTER category,
      ADD INDEX idx_category (category),
      ADD INDEX idx_action (action),
      ADD INDEX idx_user_id (user_id),
      ADD INDEX idx_timestamp (timestamp)
    `);

    // Backfill existing records with intelligent defaults based on event text
    console.log("Backfilling existing records...");
    
    // Auth events
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'AUTH', action = 'LOGIN' 
      WHERE event LIKE '%logged in%' OR event LIKE '%login%'
    `);

    // Product events
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'PRODUCT', action = 'CREATE' 
      WHERE event LIKE '%Product created%'
    `);
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'PRODUCT', action = 'UPDATE' 
      WHERE event LIKE '%Product updated%'
    `);
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'PRODUCT', action = 'DELETE' 
      WHERE event LIKE '%Product deleted%'
    `);

    // Order events
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'ORDER', action = 'CREATE' 
      WHERE event LIKE '%Order created%'
    `);
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'ORDER', action = 'UPDATE' 
      WHERE event LIKE '%Order status updated%' OR event LIKE '%Courier assigned%'
    `);
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'ORDER', action = 'DELETE' 
      WHERE event LIKE '%Order deleted%'
    `);

    // Settings events
    await connection.query(`
      UPDATE audit_logs 
      SET category = 'SETTINGS', action = 'UPDATE' 
      WHERE event LIKE '%Settings updated%'
    `);

    console.log("✅ Audit logs migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

migrateAuditLogs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
