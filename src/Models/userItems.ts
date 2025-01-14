import db from '../migration';
import { v4 as uuidv4 } from 'uuid';

interface I_UserItems {
    user_id?: string;
    item_id?: string;
    amount?: number;
}

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
            const id = uuidv4().substring(0, 12);

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
            const SQL = 'INSERT INTO UserChecks SET ?';
            db.query(SQL, post, (err, _result) => {
                if(err) reject(errorReturn);
                else resolve(successReturn);
            })
        })
    }
}