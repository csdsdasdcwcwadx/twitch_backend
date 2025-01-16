import { QueryError, RowDataPacket } from 'mysql2';
import db from '../migration';
import { v4 as uuidv4 } from 'uuid';
export interface I_Checks {
    id?: string;
    passcode?: string;
    streaming?: boolean;
    created_at?: string;
}
interface GetAllSuccessResponse {
    status: true;
    message: string;
    checkinfo: I_Checks[];
}

interface GetAllErrorResponse {
    status: false;
    message: string;
}

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;

export class Checks implements I_Checks {
    id?: string;
    passcode?: string;
    streaming?: boolean;
    created_at?: string;

    constructor (id?: string, passcode?: string, streaming?: boolean, created_at?: string,) {
        this.id = id;
        this.passcode = passcode;
        this.streaming = streaming;
        this.created_at = created_at;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);
            const checkSQL = 'SELECT COUNT(*) AS count FROM Checks WHERE streaming = true';
            const insertSQL = 'INSERT INTO Checks SET ?';

            const post: I_Checks = {
                id,
                passcode: this.passcode,
                streaming: true,
            };
            const errorReturn = {
                status: false,
                message: '簽到表開放失敗',
            };
            const successReturn = {
                status: true,
                message: '簽到表開放成功',
                checkinfo: [post]
            };
            db.query(checkSQL, (checkErr, result: RowDataPacket[]) => {
                const { count } = result[0];
                if (checkErr) reject(errorReturn);
                if (count) {
                    errorReturn.message = "已有簽到表開放，無法新增簽到表";
                    reject(errorReturn);
                } else {
                    db.query(insertSQL, post, (insertErr, _result) => {
                        if(insertErr) reject(errorReturn);
                        else resolve(successReturn);
                    })
                }
            })
        })
    }

    getall(currentYear?: number, currentMonth?: number): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            let SQL = 'SELECT * FROM Checks';
            if (currentMonth && currentYear) {
                SQL = `SELECT * FROM Checks WHERE YEAR(created_at) = ${currentYear} AND MONTH(created_at) = ${currentMonth}`;
            }
            const errorReturn: GetAllErrorResponse = {
                status: false,
                message: '簽到表取得失敗',
            };

            db.query(SQL, (err: QueryError, result: I_Checks[]) => {
                if (err) reject(errorReturn);
                else {
                    const successReturn: GetAllSuccessResponse = {
                        status: true,
                        message: "取得簽到表成功",
                        checkinfo: result,
                    }
                    resolve(successReturn);
                }
            })
        })
    }

    getSingleCheck(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const SQL = 'SELECT * FROM Checks WHERE id = ? AND passcode = ?';
            const errorReturn: GetAllErrorResponse = {
                status: false,
                message: '簽到表取得失敗',
            };

            db.query(SQL, [this.id, this.passcode], (err, result: RowDataPacket[]) => {
                if (err) reject(errorReturn);
                else if (!result.length) {
                    errorReturn.message = "簽到驗證錯誤，請重新輸入";
                    reject(errorReturn);
                } else {
                    const successReturn: GetAllSuccessResponse = {
                        status: true,
                        message: "取得簽到表成功",
                        checkinfo: result as I_Checks[],
                    }
                    resolve(successReturn);
                }
            })
        })
    }

    updateStreaming() {
        return new Promise((resolve, reject) => {
            const SQL = 'UPDATE checks SET streaming = ? WHERE id = ?';
            const errorReturn: GetAllErrorResponse = {
                status: false,
                message: '更新簽到表狀態失敗',
            };

            db.query(SQL, [this.streaming, this.id], (err, result) => {
                if (err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: "更新簽到表狀態成功",
                    }
                    resolve(successReturn);
                }
            })
        })
    }
}