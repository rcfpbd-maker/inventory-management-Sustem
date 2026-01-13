import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const migrationQueries = [
    `ALTER TABLE expenses ADD COLUMN vendor VARCHAR(255) AFTER amount`,
    `ALTER TABLE expenses ADD COLUMN notes TEXT AFTER vendor`
];

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_NAME || "ims_v2",
    });

    console.log('Starting Expenses table migration...');

    for (const query of migrationQueries) {
        try {
            await connection.query(query);
            console.log(`Executed: ${query}`);
        } catch (error) {
            if (error.code === 'ER_DUP_COLUMN_NAME' || error.message.includes('Duplicate column name')) {
                console.log(`Column already exists, skipping.`);
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
