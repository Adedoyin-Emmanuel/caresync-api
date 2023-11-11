"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const models_1 = require("../models");
let io;
const allowedOrigins = ["https://caresync.vercel.app", "http://localhost:3000"];
const initSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        // get the user or hospital details
        const user = socket === null || socket === void 0 ? void 0 : socket.handshake.query;
        console.log(`${user === null || user === void 0 ? void 0 : user.username} connected`);
        /* Appointment events */
        socket.on("newAppointment", (data) => {
            io.emit("newAppointment", data);
        });
        socket.on("updateAppointment", (data) => {
            io.emit("updateAppointment", data);
        });
        socket.on("cancelAppointment", (data) => {
            io.emit("canceAppointment", data);
        });
        socket.on("deleteAppointment", (data) => {
            io.emit("deleteAppointment", data);
        });
        socket.on("approveAppointment", (data) => {
            io.emit("approveAppointment", data);
        });
        /* User Login Events*/
        socket.on("userLogin", (data) => {
            io.emit("userLogin", data);
        });
        socket.on("userLogout", (data) => {
            io.emit("userLogout", data);
        });
        /* User or Hospital online activity */
        socket.on("onlineUsers", (data) => {
            io.emit("onlineUsers", data);
        });
        socket.on("onlineHospitals", (data) => {
            io.emit("onlineHospitals", data);
        });
        /* User or Hospital Chats */
        socket.on("joinRoom", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const messages = yield models_1.Message.find({ roomId: data }).sort({
                    createdAt: 1,
                });
                if (messages.length === 0) {
                    io.emit("chatHistory", []);
                }
                else {
                    io.emit("chatHistory", messages);
                }
                //join the room
                console.log(`${data} has been created`);
                socket.join(data);
            }
            catch (error) {
                console.error(error);
            }
        }));
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            /*
             I'm expecting the following properties
             message: string, sender: Id, receiver: Id, roomId: string
            */
            const { roomId } = data;
            //console.log(data);
            const savedMessage = yield models_1.Message.create(data);
            io.to(roomId).emit("newMessage", data);
        }));
        socket.on("typing", (data) => {
            const roomId = data.roomId;
            socket.broadcast.to(roomId).emit("responseTyping", {
                sender: data.sender,
                receiver: data.receiver,
                message: `${user === null || user === void 0 ? void 0 : user.username} is typing...`,
            });
        });
        socket.on("disconnect", () => {
            console.log(`${user === null || user === void 0 ? void 0 : user.username} disconnected`);
        });
    });
};
exports.initSocket = initSocket;
