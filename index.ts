import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "express-async-errors";
import morgan from "morgan";
import path from "path";
import { errorHandler, notFound, rateLimiter } from "./middlewares/";

import { connectToDb } from "./utils";

const PORT = process.env.PORT || 2800;

const app = express();

//middlewares
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
