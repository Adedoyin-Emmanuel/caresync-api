import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import morgan from "morgan";
import { errorHandler, notFound, rateLimiter } from "./middlewares/";
import { authRouter, userRouter } from "./routes";
import { connectToDb } from "./utils";
dotenv.config();

const PORT = process.env.PORT || 2800;
const app = express();

//middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimiter);

//default
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDb();
});
