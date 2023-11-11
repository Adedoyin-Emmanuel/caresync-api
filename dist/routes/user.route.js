"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const middlewares_1 = require("../middlewares");
const userRouter = express_1.default.Router();
userRouter.post("/", [middlewares_1.useCreateUserLimiter], user_controller_1.default.createUser);
userRouter.get("/search", user_controller_1.default.searchUser);
userRouter.get("/online", user_controller_1.default.getOnlineUsers);
userRouter.put("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("user")], user_controller_1.default.updateUser);
userRouter.get('/me', [middlewares_1.useAuth], user_controller_1.default.getMe);
userRouter.get("/", [middlewares_1.useAuth], user_controller_1.default.getAllUsers);
userRouter.get("/:id", [middlewares_1.useAuth], user_controller_1.default.getUserById);
userRouter.delete("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("user")], user_controller_1.default.deleteUser);
exports.default = userRouter;
