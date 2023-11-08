import express from "express";
import { RoomController } from "../controllers";
import { useAuth } from "../middlewares";

const roomRouter = express.Router();

roomRouter.get("/get-token", [useAuth], RoomController.getRoomToken);

export default roomRouter;
