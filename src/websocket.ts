import { Server as SocketIOServer, Socket } from "socket.io";
import { Server } from 'http';
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { ACCESS_SECRET_KEY, I_AlertMessage } from "./util";

let io: SocketIOServer | null = null;
export const initSocketIO = (server: Server) => {
    if (io) return io;
    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.APP_HOST || "*",
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    const gameNamespace = io.of("/socket/game");
    const alertNamespace = io.of("/socket/alert");
    gameNamespace.on("connection", (socket: Socket) => {
        try {
            // 驗證處理 start
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) throw new Error("Missing cookies");
            const cookies = cookie.parse(cookieHeader);

            const accessToken: string = cookies.access || "";
            const refreshToken: string = cookies.refresh || "";
            if (!accessToken || !refreshToken) throw new Error("Missing token");

            const userinfo = jwt.verify(accessToken, ACCESS_SECRET_KEY) as any;
            if (!userinfo.isAdmin) {
                if (gameNamespace.sockets.size > 1) throw new Error("WebSocket already occupied");
                if (!userinfo.isGaming) throw new Error("No gaming request");
            }
            // 驗證處理 end
            socket.emit("message", "connected successfully");
            (socket as any).userinfo = userinfo;
            socket.on("message", (msg: string) => {
                for (const [id, soc] of gameNamespace.sockets) {
                    if ((soc as any).userinfo?.isAdmin) {
                        soc.emit("action", msg);
                    }
                }
            });
            socket.on("disconnect", () => {
                console.log("Game socket disconnected:", socket.id);
            });

        } catch (e) {
            socket.emit("message", "fail to connect");
            socket.disconnect();
        }
    })
    alertNamespace.on("connection", (socket: Socket) => {
        console.log("有人連上 /socket/alert");

        socket.on("disconnect", () => {
            console.log("Alert socket disconnected:", socket.id);
        });
    });
    return io;
}

export function getIO() {
    if (!io) throw new Error("❌ Socket.io has not been initialized. Call initSocketIO first.");
    return io;
}

export const broadcastAlert = (donateValue: I_AlertMessage) => {
    if (!io) throw new Error("❌ Socket.io has not been initialized. Call initSocketIO first.");
    io.of("/socket/alert").emit("notify", { donateValue });
}