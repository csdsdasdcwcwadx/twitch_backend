import { QueryError } from 'mysql2';
import db from '../migration';
import { v4 as uuidv4 } from 'uuid';

interface I_Checks {
    id?: string;
    passcode?: string;
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

    constructor (id?: string, passcode?: string) {
        this.id = id;
        this.passcode = passcode;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);

            const post: I_Checks = {
                id,
                passcode: this.passcode
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

    getall(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const SQL = 'SELECT * FROM Checks';
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
}