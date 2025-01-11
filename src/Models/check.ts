import db from '../migration';
import { v4 as uuidv4 } from 'uuid';

interface I_Checks {
    id?: string;
}

export class Checks implements I_Checks {
    id?: string;

    constructor (id?: string) {
        this.id = id;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);

            const post: I_Checks = {
                id,
            };
            const errorReturn = {
                status: false,
                message: '簽到表開放失敗',
            };
            const successReturn = {
                status: true,
                message: '簽到表開放成功',
            };
            const SQL = 'INSERT INTO Checks SET ?';
            db.query(SQL, post, (err, _result) => {
                if(err) reject(errorReturn);
                else resolve(successReturn);
            })
        })
    }
}