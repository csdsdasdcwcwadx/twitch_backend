import mysql, { PoolConfig } from 'mysql';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export const options: PoolConfig = {
    host: process.env.HOST,
    user: process.env.ROOT_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    // connectionLimit: 5,
    multipleStatements: true,
    // timezone: 'local',
    // ...(process.env.ENV === "prod" && {
    //     ssl: {
    //         rejectUnauthorized: true,
    //         ca: fs.readFileSync('certificate/global-bundle.pem'),
    //     }
    // })
};

const db = mysql.createPool(options);
export default db;

// CREATE TABLE IF NOT EXISTS Items (
//     id VARCHAR(12) PRIMARY KEY,
//     name VARCHAR(20) NOT NULL,
//     image VARCHAR(100),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// CREATE TABLE IF NOT EXISTS Checks (
//     id VARCHAR(12) PRIMARY KEY,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// CREATE TABLE IF NOT EXISTS UserChecks (
//     user_id VARCHAR(12),
//     check_id VARCHAR(12),
//     checked TINYINT(1) DEFAULT 1
//     PRIMARY KEY (user_id, check_id),
//     FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
//     FOREIGN KEY (check_id) REFERENCES Checks(id) ON DELETE CASCADE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// CREATE TABLE IF NOT EXISTS UserItems (
//     user_id VARCHAR(12),
//     item_id VARCHAR(12),
//     amount INT,
//     PRIMARY KEY (user_id, item_id),
//     FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
//     FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );