import express from "express";
import UserController from "../controllers/user.controller";
import { useAuth, useCreateUserLimiter } from "../middlewares";


const userRouter = express.Router();

userRouter.post("/", [useCreateUserLimiter], UserController.createUser);
userRouter.put("/",[useAuth], UserController.updateUser);
userRouter.get("/",[useAuth], UserController.getAllUsers);
userRouter.get("/:id",[useAuth], UserController.getUserById);
userRouter.delete("/:id",[useAuth], UserController.deleteUser);

export default userRouter;
