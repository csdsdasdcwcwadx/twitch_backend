import db from '../migration';
import { v4 as uuidv4 } from 'uuid';

export interface I_Items {
    id?: string;
    name?: string;
    image?: string;
}

interface GetAllSuccessResponse {
    status: true;
    message: string;
    iteminfo: I_Items[];
}

interface GetAllErrorResponse {
    status: false;
    message: string;
}

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;
export class Items implements I_Items {
    id?: string;
    name?: string;
    image?: string;

    constructor (
        id?: string,
        name?: string,
        image?: string,

    ) {
        this.id = id;
        this.name = name;
        this.image = image;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);

            const post: I_Items = {
                id,
                name: this.name,
                image: this.image,
            };
            const errorReturn = {
                status: false,
                message: '物品註冊失敗',
            };
            const successReturn = {
                status: true,
                message: '物品註冊成功',
                iteminfo: [post],
            };
            const SQL = 'INSERT INTO Items SET ?';
            db.query(SQL, post, (err, _result) => {
                if(err) reject(errorReturn);
                else resolve(successReturn);
            })
        })
    }

    getAll(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const SQL = "SELECT * from Items";

            const errorReturn = {
                status: false,
                message: "取得道具失敗",
            };

            db.query(SQL, (err, result) => {
                if (err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: "取得道具成功",
                        iteminfo: result as I_Items[],
                    }
                    resolve(successReturn);
                }
            })
        })
    }
}