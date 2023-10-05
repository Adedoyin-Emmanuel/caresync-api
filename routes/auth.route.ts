import express from "express";
import AuthController from "../controllers/auth.controller";
import { loginRateLimiter } from "../middlewares/rateLimiter";
import { loginSlowDown } from "../middlewares/rateSlowDown";
const authRouter = express.Router();

authRouter.post("/login", [loginRateLimiter, loginSlowDown], AuthController.login);
authRouter.post("/refresh-token", AuthController.generateRefreshToken);

export default authRouter;
