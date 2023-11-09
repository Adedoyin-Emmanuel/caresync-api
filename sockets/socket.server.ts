import http from "http";
import { Server } from "socket.io";
import { Message } from "../models";
import { SocketMessage, GlobalUser } from "../types/types";

let io: Server;

const allowedOrigins = ["https://caresync.vercel.app", "http://localhost:3000"];

const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket: any) => {
    // get the user or hospital details
    const user: GlobalUser = socket.handshake.query;
    console.log(`${user?.username} connected`);

    /* Appointment events */
    socket.on("newAppointment", (data: any) => {
      io.emit("newAppointment", data);
    });

    socket.on("updateAppointment", (data: any) => {
      io.emit("updateAppointment", data);
    });

    socket.on("cancelAppointment", (data: any) => {
      io.emit("canceAppointment", data);
    });

    socket.on("deleteAppointment", (data: any) => {
      io.emit("deleteAppointment", data);
    });

    socket.on("approveAppointment", (data: any) => {
      io.emit("approveAppointment", data);
    });

    /* User Login Events*/

    socket.on("userLogin", (data: any) => {
      io.emit("userLogin", data);
    });

    socket.on("userLogout", (data: any) => {
      io.emit("userLogout", data);
    });

    /* User or Hospital online activity */
    socket.on("onlineUsers", (data: any) => {
      io.emit("onlineUsers", data);
    });

    socket.on("onlineHospitals", (data: any) => {
      io.emit("onlineHospitals", data);
    });

    /* User or Hospital Chats */

  socket.on("joinRoom", async (data: any) => {
    try {
      const messages = await Message.find({ roomId: data }).sort({
        createdAt: 1,
      });

      if (messages.length === 0) {
        io.emit("chatHistory", []);
      } else {
        io.emit("chatHistory", messages);
      }
    } catch (error) {
      console.error(error);
    }
  });

    socket.on("sendMessage", async (data: SocketMessage) => {
      /*
       I'm expecting the following properties
       message: string, sender: Id, receiver: Id, roomId: string
      */
      const { roomId } = data;
      const savedMessage = await Message.create(data);

      io.to(roomId).emit("newMessage", data);
    });

    socket.on("typing", (data: SocketMessage) => {
      io.to(data.roomId).emit("typing", {
        sender: data.sender,
        receiver: data.receiver,
        message: `${user?.username} is typing...`,
      });
    });

    socket.on("disconnect", () => {
     console.log(`${user?.username} disconnected`);
    });
  });
};

export { initSocket, io };
