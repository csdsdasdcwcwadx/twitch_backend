import mysql, { ConnectionOptions } from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const options: ConnectionOptions = {
    host: process.env.HOST,
    user: process.env.ROOT_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true,
};

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.ROOT_USER,
    password: process.env.PASSWORD,
});

const db = mysql.createPool(options);
export default db;

const initializeTables = () => {
    // ALTER TABLE Users
    // ADD COLUMN realname VARCHAR(20),
    // ADD COLUMN address VARCHAR(50),
    // ADD COLUMN phone VARCHAR(20);
    const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS Users (
            id VARCHAR(12) PRIMARY KEY,
            twitch_id VARCHAR(20) NOT NULL,
            login VARCHAR(20) NOT NULL,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            profile_image VARCHAR(100),
            realname VARCHAR(20),
            address VARCHAR(50),
            phone VARCHAR(20),
            isAdmin TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Items (
            id VARCHAR(12) PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            image VARCHAR(100),
            description VARCHAR(100),
            type VARCHAR(20),
            amount INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Checks (
            id VARCHAR(12) PRIMARY KEY,
            passcode VARCHAR(30),
            streaming TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS UserChecks (
            user_id VARCHAR(12),
            check_id VARCHAR(12),
            checked TINYINT(1) DEFAULT 0,
            PRIMARY KEY (user_id, check_id),
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (check_id) REFERENCES Checks(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS UserItems (
            user_id VARCHAR(12),
            item_id VARCHAR(12),
            amount INT,
            PRIMARY KEY (user_id, item_id),
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS Redemptions (
            id VARCHAR(12) PRIMARY KEY,
            user_id VARCHAR(12) NOT NULL,
            item_id VARCHAR(12) NOT NULL,
            status TINYINT(1) DEFAULT 0,
            amount INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE
        );
    `

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            throw err;
        } else {
            console.log('Connected to MySQL server.');

            connection.query(createUserTableQuery, (err) => {
                if (err) {
                    console.error('Failed to create Users table:', err);
                    throw err;
                } else {
                    console.log('tables are ready.');
                }
                connection.release(); // 釋放連接
            });
        }
    })
};

export const initializeDataBase = () => {
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\`;`, (err) => {
        if (err) {
            console.error('Database creation failed:', err);
        } else {
            console.log(`Database ${process.env.DATABASE} is created.`);
        }
        connection.end();  // 把這個 connection 關掉
        initializeTables(); // 之後再用 pool 建立 tables
      });
}