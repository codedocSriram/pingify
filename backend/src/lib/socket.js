import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

const userSocketMap = {}; //{userId: socketId}

export const getRecieverSocketId = (userId) => {
    return userSocketMap[userId];
};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id; //{userId: socketId}
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // used to send events to all the connected clients/users

    socket.on("disconnect", () => {
        delete userSocketMap[userId]; //deleting the logged out user from the map using userId as key
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };
