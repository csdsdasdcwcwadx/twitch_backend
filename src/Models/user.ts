import db from '../migration';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

export interface I_Users {
    id?: string;
    twitch_id?: string;
    login?: string;
    name?: string;
    email?: string;
    profile_image?: string;
    isAdmin?: boolean;
}

interface GetAllSuccessResponse {
    status: true;
    message: string;
    userinfo: I_Users[];
}

interface GetAllErrorResponse {
    status: false;
    message: string;
}

type GetAllResponse = GetAllSuccessResponse | GetAllErrorResponse;

export class Users implements I_Users {
    id?: string;
    twitch_id?: string;
    login?: string;
    name?: string;
    email?: string;
    profile_image?: string;
    isAdmin?: boolean;

    constructor(
        id?: string,
        twitch_id?: string,
        login?: string,
        name?: string,
        email?: string,
        profile_image?: string,
        isAdmin?: boolean,
    ) {
        this.id = id;
        this.twitch_id = twitch_id;
        this.login = login;
        this.name = name;
        this.email = email;
        this.profile_image = profile_image;
        this.isAdmin = isAdmin;
    }

    registry(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);
            const post: I_Users = {
                id,
                twitch_id: this.twitch_id,
                login: this.login,
                name: this.name,
                email: this.email,
                profile_image: this.profile_image,
                isAdmin: false,
            };
            const errorReturn = {
                status: false,
                message: '會員註冊失敗',
            };
            const successReturn = {
                status: true,
                message: '會員註冊成功',
                userinfo: [post],
            };
            const SQL = 'SELECT * FROM USERS WHERE twitch_id = ?';
            db.query(SQL, this.twitch_id, (err, result: RowDataPacket[]) => {
                if (err) {
                    console.log("@@@1")
                    reject(errorReturn);
                }
                else {
                    if (result.length) {
                        // 既有 user 更新他的資料
                        const SQL = 'UPDATE Users SET ? WHERE id = ?';
                        
                        delete post.id;
                        delete post.isAdmin;

                        db.query(SQL, [post, result[0].id], (err, _result) => {
                            post.id = result[0].id;
                            post.isAdmin = result[0].isAdmin;

                            if(err) {
                                console.log("@@@2")
                                reject(errorReturn);
                            }
                            else resolve(successReturn);
                        })
                    } else {
                        // 尚未使用過的 user 儲存他的欄位
                        const SQL = 'INSERT INTO Users SET ?';
                        post.id = id;
                        db.query(SQL, post, (err, _result) => {
                            if(err) {
                                console.log("@@@3")
                                reject(errorReturn);
                            }
                            else resolve(successReturn);
                        })
                    }
                }
            })
        })
    }

    getUsers(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const SQL = 'SELECT * FROM users WHERE id = ?';
            const errorReturn = {
                status: false,
                message: '取得用戶失敗',
            };

            db.query(SQL, [this.id], (err, result) => {
                if(err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: '取得用戶成功',
                        userinfo: result as I_Users[],
                    };
                    resolve(successReturn);
                }
            })
        })
    }

    getAllUsers(): Promise<GetAllResponse> {
        return new Promise((resolve, reject) => {
            const SQL = 'SELECT * FROM users WHERE isAdmin = 0';
            const errorReturn = {
                status: false,
                message: '取得用戶失敗',
            };

            db.query(SQL, (err, result) => {
                if (err) reject(errorReturn);
                else {
                    const successReturn = {
                        status: true,
                        message: '取得用戶成功',
                        userinfo: result as I_Users[],
                    }
                    resolve(successReturn);
                }
            })
        })
    }
}