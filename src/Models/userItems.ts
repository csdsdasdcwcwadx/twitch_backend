import db from '../migration';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

export interface I_UserItems {
    user_id?: string;
    item_id?: string;
    amount?: number;
}

interface GetAllSuccessResponse {
    status: true;
    message: string;
    useriteminfo: I_UserItems[];
}

interface GetAllErrorResponse {
    status: false;
    message: string;
}

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;

export class UserItems implements I_UserItems {
    user_id?: string;
    item_id?: string;
    amount?: number;

    constructor (
        user_id?: string,
        item_id?: string,
        amount?: number,
    ) {
        this.user_id = user_id;
        this.item_id = item_id;
        this.amount = amount;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const post: I_UserItems = {
                user_id: this.user_id,
                item_id: this.item_id,
                amount: this.amount,
            };
            const errorReturn = {
                status: false,
                message: '物品領取失敗',
            };
            const successReturn = {
                status: true,
                message: '物品領取成功',
            };
            const SQL = 'SELECT * FROM UserItems WHERE user_id = ? AND item_id = ?';
            db.query(SQL, [this.user_id, this.item_id], (err, result: RowDataPacket[]) => {
                if(err) reject(errorReturn);
                else {
                    if (result.length) {
                        const SQL = 'UPDATE UserItems SET ? WHERE user_id = ? AND item_id = ?';
                        db.query(SQL, [post, this.user_id, this.item_id], (err, result) => {
                            if(err) reject(errorReturn);
                            else resolve(successReturn);
                        })
                    } else {
                        const SQL = 'INSERT INTO UserItems SET ?';
                        db.query(SQL, post, (err, result) => {
                            if(err) reject(errorReturn);
                            else resolve(successReturn);
                        })
                    }
                }
            })
        })
    }

    getUserItems(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            let SQL = 'SELECT * FROM UserItems WHERE item_id = ? AND user_id = ? ORDER BY created_at DESC';
            if (!this.user_id) {
                SQL = 'SELECT * FROM UserItems WHERE item_id = ? ORDER BY created_at DESC';
            }

            const errorReturn: GetAllErrorResponse = {
                status: false,
                message: '取得用戶道具失敗',
            };

            db.query(SQL, [this.item_id, this.user_id], (err, result: RowDataPacket[]) => {
                if (err) {
                    reject(errorReturn);
                } else {
                    const successReturn: GetAllSuccessResponse = {
                        status: true,
                        message: "取得用戶道具成功",
                        useriteminfo: result as I_UserItems[], // 将结果断言为 I_UserChecks[]
                    };
                    resolve(successReturn);
                }
            });
        })
    }

    updateUserItems() {
        return new Promise((resolve, reject) => {
            const SQL = 'UPDATE UserItems SET amount = ? WHERE user_id = ? AND item_id = ?';
            const errReturn = {
                status: false,
                message: "更新用戶道具失敗",
            }

            const successReturn = {
                status: true,
                message: "更新用戶道具成功",
            }

            db.query(SQL, [this.amount, this.user_id, this.item_id], (err, result) => {
                if (err) reject(errReturn);
                else resolve(successReturn);
            })
        })
    }
}