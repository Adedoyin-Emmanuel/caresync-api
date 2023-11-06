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

    const userId:any = socket.handshake.query.userId;

    /* Appointment events */

    socket.on("newAppointment", (data) => {
      io.emit("newAppointment", data);
      console.log(userId);
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



    /* Message Events*/

    socket.on("userLogin", (data)=>{
      io.emit("userLogin", data);
    });

    socket.on(
      "userLogout",
      (data) => {
        io.emit("userLogout", data);
      }
    );

    socket.on("onlineUsers", (data)=>{
      io.emit("onlineUsers", data);
    });

    socket.on("onlineHospitals", (data)=>{
      io.emit("onlineHospitals", data);
    })


    socket.on("newMessage", (data) => {
      io.emit("newMessage", data);
    });




    socket.on("joinRoom", (data)=>{

      const user:any = "";
      console.log(data);


  socket.broadcast.to(user.room).emit("message", "A user has joined the chat");



      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        // users: getRoomUsers(user.room),
      });
    });


    socket.on("chatMessage", (data)=>{
      // const user = getCurrentUser(socket.id);

      console.log(data);

      //io.to(user.room).emit("message", formatMessage(user.username, msg));
    })


    


    socket.on("disconnect", () => {
      console.log("A user disconnected");
    }); 


  });
};

export { initSocket, io };
