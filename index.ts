import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import morgan from "morgan";
import { useErrorHandler, useNotFound, useRateLimiter } from "./middlewares/";
import {
  appointmentRouter,
  authRouter,
  hospitalRouter,
  reviewRouter,
  userRouter,
} from "./routes";
import { connectToDb } from "./utils";
import http from 'http';
import { initSocket } from "./sockets/socket.server";
dotenv.config();

const allowedOrigins = [
  "https://caresync.vercel.app",
  "http://localhost:3000",
  
];

const PORT = process.env.PORT || 2800;
const app = express();
const server = http.createServer(app);
initSocket(server);

//middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(useRateLimiter);

//endpoints
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/hospital", hospitalRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/review", reviewRouter);

app.use(useNotFound);
app.use(useErrorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDb();
});
