import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import morgan from "morgan";
import { errorHandler, notFound, rateLimiter } from "./middlewares/";
dotenv.config();
import { connectToDb } from "./utils";


const PORT = process.env.PORT || 2800;
const app = express();

//middlewares
app.use(cors());
app.set("trust proxy", true);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimiter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDb();
});
