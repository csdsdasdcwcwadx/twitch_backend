import mysql, { ConnectionOptions } from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export const options: ConnectionOptions = {
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