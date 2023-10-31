import http from "http";
import { Server } from "socket.io";

let io: Server;

const allowedOrigins = ["https://caresync.vercel.app", "http://localhost:3000"];

const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected!");

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
    


    socket.on("disconnect", () => {
      console.log("A user disconnected");
    }); 


  });
};

export { initSocket, io };
