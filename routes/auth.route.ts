import express from "express";
import AuthController from "../controllers/auth.controller";
import { useLoginRateLimiter } from "../middlewares/rateLimiter";
import { useLoginSlowDown } from "../middlewares/rateSlowDown";
const authRouter = express.Router();

authRouter.post(
  "/login",
  [useLoginRateLimiter, useLoginSlowDown],
  AuthController.login
);
authRouter.post("/refresh-token", AuthController.generateRefreshToken);

export default authRouter;
