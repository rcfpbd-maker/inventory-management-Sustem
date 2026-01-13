import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const migrationQueries = [
    // 1. Create couriers table
    `CREATE TABLE IF NOT EXISTS couriers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 2. Add columns to orders table
    `ALTER TABLE orders 
        ADD COLUMN platform VARCHAR(50) DEFAULT 'Direct',
        ADD COLUMN status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED') DEFAULT 'PENDING',
        ADD COLUMN delivery_type VARCHAR(50) DEFAULT 'Standard',
        ADD COLUMN confirmed_by VARCHAR(36),
        ADD COLUMN confirmation_status ENUM('UNCONFIRMED', 'CONFIRMED') DEFAULT 'UNCONFIRMED',
        ADD COLUMN courier_id VARCHAR(36),
        ADD COLUMN tracking_id VARCHAR(100),
        ADD COLUMN payment_status ENUM('UNPAID', 'PARTIAL', 'PAID', 'DUE') DEFAULT 'UNPAID',
        ADD CONSTRAINT fk_confirmed_by FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
        ADD CONSTRAINT fk_courier_id FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE SET NULL`,

    // 3. Create payments table
    `CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('CASH', 'BKASH', 'NAGAD', 'ROCKET', 'CARD', 'BANK_TRANSFER') NOT NULL,
        payment_channel VARCHAR(50),
        transaction_id VARCHAR(100),
        status ENUM('COMPLETED', 'PENDING', 'FAILED') DEFAULT 'COMPLETED',
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`,

    // 4. Create returns_refunds table
    `CREATE TABLE IF NOT EXISTS returns_refunds (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        type ENUM('RETURN', 'REFUND') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        reason TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`,

    // 5. Update expenses table
    `ALTER TABLE expenses
        ADD COLUMN order_id VARCHAR(36),
        ADD COLUMN product_cost DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN packaging_cost DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN courier_cost DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN ad_cost DECIMAL(10, 2) DEFAULT 0,
        ADD COLUMN total_expense DECIMAL(10, 2) DEFAULT 0,
        ADD CONSTRAINT fk_expense_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL`
];

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_NAME || "ims_v2",
    });

    console.log('Starting migration...');

    for (const query of migrationQueries) {
        try {
            await connection.query(query);
            console.log(`Executed: ${query.substring(0, 50)}...`);
        } catch (error) {
            if (error.code === 'ER_DUP_COLUMN_NAME' || error.code === 'ER_FK_DUP_NAME' || error.code === 'ER_TABLE_EXISTS_ERROR' || error.message.includes('Multiple primary key defined')) {
                console.log(`Skipping: ${error.message}`);
            } else {
                console.error(`Error executing query: ${query}`);
                console.error(error);
            }
        }
    }

    console.log('Migration completed!');
    await connection.end();
}

migrate().catch(err => {
    console.error('Migration failed:');
    console.error(err);
    process.exit(1);
});
