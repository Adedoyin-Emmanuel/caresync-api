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

authRouter.post("/logout", AuthController.logout);
authRouter.post("/refresh-token", AuthController.generateRefreshToken);


//MISC
authRouter.get("/verify-email", AuthController.sendEmailToken);
authRouter.post("/verify-email", AuthController.verifyEmailToken);

// authRouter.post("/forget-password",);
// authRouter.post("/reset-password",);



export default authRouter;
