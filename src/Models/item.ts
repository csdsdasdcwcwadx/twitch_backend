import db from '../migration';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

export interface I_Items {
    id?: string;
    name?: string;
    image?: string;
    description?: string;
    type?: string;
    amount?: number;
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

interface GetPages {
    status: true;
    message: string;
    pages: number;
}

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;
export class Items implements I_Items {
    id?: string;
    name?: string;
    image?: string;
    description?: string;
    type?: string;
    amount?: number;

    constructor (
        id?: string,
        name?: string,
        image?: string,
        description?: string,
        type?: string,
        amount?: number,

    ) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.description = description;
        this.type = type;
        this.amount = amount;
    }

    registry () {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);

            const post: I_Items = {
                id,
                name: this.name,
                image: this.image,
                description: this.description,
                type: this.type,
                amount: this.amount,
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

    getItems (all = true, page = 1, pageSize = 10, desc = true): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * pageSize; // 計算偏移量
            let SQL = "SELECT * FROM Items ORDER BY created_at DESC LIMIT ? OFFSET ?";
            let params: (number | string)[] = [pageSize, offset];
            if (!desc) {
                SQL = "SELECT * FROM Items ORDER BY created_at ASC LIMIT ? OFFSET ?";
            }
    
            if (!all) {
                SQL = "SELECT * FROM Items WHERE id = ?";
                params = [this.id!];
            }

            const errorReturn = {
                status: false,
                message: "取得道具失敗",
            };

            db.query(SQL, params, (err, result) => {
                if (err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: "取得道具成功",
                        iteminfo: result as I_Items[],
                    };
                    resolve(successReturn);
                }
            });
        })
    }

    updateItem () {
        return new Promise((resolve, reject) => {

            const post: I_Items = {
                name: this.name,
                image: this.image,
                description: this.description,
                type: this.type,
                amount: this.amount,
            };
            const errorReturn = {
                status: false,
                message: '物品更新失敗',
            };
            const SQL = `
                UPDATE Items SET ? WHERE id = ?; 
                SELECT * FROM Items WHERE id = ?;
            `;
            db.query(SQL, [post, this.id, this.id], (err, result) => {
                if(err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: '物品更新成功',
                        iteminfo: result,
                    };
                    resolve(successReturn);
                }
            })
        })
    }

    deleteItem () {
        return new Promise((resolve, reject) => {
            const SQL = 'DELETE FROM Items WHERE id = ?';

            db.query(SQL, this.id, (err, result) => {
                const errorReturn = {
                    status: false,
                    message: '物品刪除失敗',
                }
                const successReturn = {
                    status: true,
                    message: '物品刪除成功',
                }

                if(err) reject(errorReturn);
                else resolve(successReturn);
            })
        })
    }

    getPages (all = true, pageSize = 10): Promise<GetAllErrorResponse | GetPages> {
        return new Promise((resolve, reject) => {

            let SQL = "SELECT CEIL(COUNT(*) / ?) AS total FROM Items ORDER BY created_at DESC";
            if (!all) {
                SQL = "SELECT CEIL(COUNT(*) / ?) AS total FROM Items WHERE id = ? ORDER BY created_at DESC";
            }

            const errorReturn = {
                status: false,
                message: "取得頁數失敗",
            };

            db.query(SQL, [pageSize, this.id], (err, result: RowDataPacket[]) => {
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