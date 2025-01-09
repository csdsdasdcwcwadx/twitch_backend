import db from '../migration';
import { v4 as uuidv4 } from 'uuid';

export class Users {
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
            const post = {
                id,
                twitch_id: this.twitch_id,
                login: this.login,
                name: this.name,
                email: this.email,
                profile_image: this.profile_image,
            };
            const CompareSQL = 'SELECT * FROM USERS WHERE twitch_id = ?';
            const SQL = 'INSERT INTO Users SET ?';
            
            const errorReturn = {
                status: false,
                message: '會員註冊失敗',
            };
            const successReturn = {
                status: true,
                message: '會員註冊成功',
                memberinfo: [post]
            }
            db.query(CompareSQL, this.twitch_id, (err, result) => {
                if (err) reject(errorReturn);
                else {
                    if (result.length) {
                        successReturn.message = "會員已經註冊";
                        resolve(successReturn);
                    } else {
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