import { v4 as uuidv4 } from 'uuid';
import { QueryError, RowDataPacket } from 'mysql2';
import db from '../migration';

export interface I_Redemptions {
    id?: string;
    user_id?: string;
    item_id?: string;
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

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;

export class Redemption implements I_Redemptions {
    id?: string;
    user_id?: string;
    item_id?: string;
    amount?: number;
    created_at?: string;

    constructor (
        id?: string,
        user_id?: string,
        item_id?: string,
        amount?: number,
        created_at?: string,

    ) {
        this.id = id;
        this.user_id = user_id;
        this.item_id = item_id;
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

    getRedemptions(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            let SQL = 'SELECT * FROM Redemptions WHERE user_id = ? ORDER BY created_at DESC';
            if (!this.user_id) {
                SQL = 'SELECT * FROM Redemptions ORDER BY created_at DESC';
            }

            const errorReturn: GetAllErrorResponse = {
                status: false,
                message: '取得兌換道具失敗',
            };

            db.query(SQL, [this.user_id], (err, result) => {
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
}