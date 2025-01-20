import db from '../migration';
import { RowDataPacket } from 'mysql2';

export interface I_UserChecks {
    user_id?: string;
    check_id?: string;
    checked?: boolean;
}

interface GetAllSuccessResponse {
    status: true;
    message: string;
    usercheckinfo: I_UserChecks[];
}

interface GetAllErrorResponse {
    status: false;
    message: string;
}

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;

export class UserChecks implements I_UserChecks {
    user_id?: string;
    check_id?: string;
    checked?: boolean;

    constructor (
        user_id?: string,
        check_id?: string,
        checked?: boolean,
    ) {
        this.user_id = user_id;
        this.check_id = check_id;
        this.checked = checked;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const post: I_UserChecks = {
                user_id: this.user_id,
                check_id: this.check_id,
                checked: this.checked,
            };
            const errorReturn = {
                status: false,
                message: '簽到失敗',
            };
            const successReturn = {
                status: true,
                message: '簽到成功',
            };
            const SQL = 'INSERT INTO UserChecks SET ?';
            db.query(SQL, post, (err, _result) => {
                if(err) reject(errorReturn);
                else resolve(successReturn);
            })
        })
    }

    getUserChecks(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            let SQL = 'SELECT * FROM UserChecks WHERE check_id = ? AND user_id = ?';
            if (!this.user_id) {
                SQL = 'SELECT * FROM UserChecks WHERE check_id = ?';
            }

            const errorReturn: GetAllErrorResponse = {
                status: false,
                message: '取得用戶簽到表失敗',
            };
        
            db.query(SQL, [this.check_id, this.user_id], (err, result: RowDataPacket[]) => {
                if (err) {
                    reject(errorReturn);
                } else {
                    const successReturn: GetAllSuccessResponse = {
                        status: true,
                        message: "取得用戶簽到表成功",
                        usercheckinfo: result as I_UserChecks[], // 将结果断言为 I_UserChecks[]
                    };
                    resolve(successReturn);
                }
            });
        });
    }
}