import express from "express";
import UserController from "../controllers/user.controller";
import { useAuth, useCheckRole, useCreateUserLimiter } from "../middlewares";

const userRouter = express.Router();

userRouter.post("/", [useCreateUserLimiter], UserController.createUser);
userRouter.get("/search", UserController.searchUser);
userRouter.put("/:id", [useAuth, useCheckRole("user")], UserController.updateUser);
userRouter.get('/me', [useAuth], UserController.getMe);
userRouter.get("/", [useAuth], UserController.getAllUsers);
userRouter.get("/:id", [useAuth], UserController.getUserById);
userRouter.delete(
  "/:id",
  [useAuth, useCheckRole("user")],
  UserController.deleteUser
);

export default userRouter;
