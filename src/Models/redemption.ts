import { v4 as uuidv4 } from 'uuid';
import { QueryError, RowDataPacket } from 'mysql2';
import db from '../migration';

export interface I_Redemptions {
    id?: string;
    user_id?: string;
    item_id?: string;
    status?: boolean;
    amount?: number;
    created_at?: string;
}

interface GetAllSuccessResponse {
    status: true;
    message: string;
    redemptioninfo: I_Redemptions[];
}

interface GetAllErrorResponse {
    status: false;
    message: string;
}

interface GetPages {
    status: true;
    message: string;
    pages: number;
}

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;

export class Redemption implements I_Redemptions {
    id?: string;
    user_id?: string;
    item_id?: string;
    status?: boolean;
    amount?: number;
    created_at?: string;

    constructor (
        id?: string,
        user_id?: string,
        item_id?: string,
        status?: boolean,
        amount?: number,
        created_at?: string,

    ) {
        this.id = id;
        this.user_id = user_id;
        this.item_id = item_id;
        this.status = status;
        this.amount = amount;
        this.created_at = created_at;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);
            const SQL = 'INSERT INTO Redemptions SET ?';

            const post = {
                id,
                user_id: this.user_id,
                item_id: this.item_id,
                status: false,
                amount: this.amount,
            }

            const errorReturn = {
                status: false,
                message: '物品兌換失敗',
            };
            const successReturn: GetAllSuccessResponse = {
                status: true,
                message: '物品兌換成功',
                redemptioninfo: [post],
            };
            db.query(SQL, [post], (err, result) => {
                if(err) reject(errorReturn);
                else resolve(successReturn);
            })
        })
    }

    getRedemptions(page = 1, pageSize = 10): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * pageSize; // 計算偏移量
            let SQL = 'SELECT * FROM Redemptions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
            let params: (number | string)[] = [this.user_id!, pageSize, offset];

            if (!this.user_id) {
                SQL = 'SELECT * FROM Redemptions ORDER BY created_at DESC LIMIT ? OFFSET ?';
                params = [pageSize, offset];
            }

            const errorReturn: GetAllErrorResponse = {
                status: false,
                message: '取得兌換道具失敗',
            };

            db.query(SQL, params, (err, result) => {
                if (err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: "取得兌換道具成功",
                        redemptioninfo: result as I_Redemptions[],
                    }
                    resolve(successReturn);
                }
            })
        })
    }

    update() {
        return new Promise((resolve, reject) => {
            const SQL = "UPDATE Redemptions SET status = ? WHERE id = ?";

            const errReturn = {
                status: false,
                message: "兌換處理失敗",
            };

            const successReturn = {
                status: true,
                message: "兌換處理完成",
            };

            db.query(SQL, [this.status, this.id], (err, result) => {
                if (err) reject(errReturn);
                else resolve(successReturn);
            })
        })
    }

    getPages(pageSize = 10): Promise<GetAllErrorResponse | GetPages> {
        return new Promise((resolve, reject) => {
            let SQL = 'SELECT CEIL(COUNT(*) / ?) AS total FROM Redemptions WHERE user_id = ? ORDER BY created_at DESC';
            if (!this.user_id) {
                SQL = 'SELECT CEIL(COUNT(*) / ?) AS total FROM Redemptions ORDER BY created_at DESC';
            }

            const errorReturn = {
                status: false,
                message: "取得頁數失敗",
            };

            db.query(SQL, [pageSize, this.user_id], (err, result: RowDataPacket[]) => {
                if (err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: "取得頁數成功",
                        pages: result[0] ? result[0].total : 0,
                    }
                    resolve(successReturn);
                }
            })
        })
    }
}