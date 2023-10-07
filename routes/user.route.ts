import express from "express";
import UserController from "../controllers/user.controller";
import { useAuth, useCheckRole, useCreateUserLimiter } from "../middlewares";

const userRouter = express.Router();

userRouter.post("/", [useCreateUserLimiter], UserController.createUser);
userRouter.put("/", [useAuth, useCheckRole("user")], UserController.updateUser);
userRouter.get("/", [useAuth], UserController.getAllUsers);
userRouter.get("/:id", [useAuth], UserController.getUserById);
userRouter.delete(
  "/:id",
  [useAuth, useCheckRole("user")],
  UserController.deleteUser
);

export default userRouter;
