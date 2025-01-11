import db from '../migration';
import { v4 as uuidv4 } from 'uuid';

export interface I_Users {
    id?: string;
    twitch_id?: string;
    login?: string;
    name?: string;
    email?: string;
    profile_image?: string;
}

export class Users implements I_Users {
    id?: string;
    twitch_id?: string;
    login?: string;
    name?: string;
    email?: string;
    profile_image?: string;

    constructor(
        id?: string,
        twitch_id?: string,
        login?: string,
        name?: string,
        email?: string,
        profile_image?: string,
    ) {
        this.id = id;
        this.twitch_id = twitch_id;
        this.login = login;
        this.name = name;
        this.email = email;
        this.profile_image = profile_image;
    }

    registry() {
        return new Promise((resolve, reject) => {
            const id = uuidv4().substring(0, 12);
            const post: I_Users = {
                id,
                twitch_id: this.twitch_id,
                login: this.login,
                name: this.name,
                email: this.email,
                profile_image: this.profile_image,
            };
            const errorReturn = {
                status: false,
                message: '會員註冊失敗',
            };
            const successReturn = {
                status: true,
                message: '會員註冊成功',
                memberinfo: [post],
            };
            const SQL = 'SELECT * FROM USERS WHERE twitch_id = ?';
            db.query(SQL, this.twitch_id, (err, result) => {
                if (err) reject(errorReturn);
                else {
                    if (result.length) {
                        // 既有 user 更新他的資料
                        const SQL = 'UPDATE Users SET ? WHERE id = ?';
                        delete post.id;
                        db.query(SQL, [post, result[0].id], (err, _result) => {
                            post.id = result[0].id;
                            if(err) reject(errorReturn);
                            else resolve(successReturn);
                        })
                    } else {
                        // 尚未使用過的 user 儲存他的欄位
                        const SQL = 'INSERT INTO Users SET ?';
                        post.id = id;
                        db.query(SQL, post, (err, _result) => {
                            if(err) reject(errorReturn);
                            else resolve(successReturn);
                        })
                    }
                }
            })
        })
    }
}