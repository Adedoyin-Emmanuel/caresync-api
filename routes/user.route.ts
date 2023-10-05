import express from "express";
import UserController from "../controllers/user.controller";


const userRouter = express.Router();


userRouter.post("/", UserController.createUser);
userRouter.put("/", UserController.updateUser);
userRouter.get("/", UserController.getAllUsers);
userRouter.get("/:id", UserController.getUserById);
userRouter.delete("/:id", UserController.deleteUser);


export default userRouter;
