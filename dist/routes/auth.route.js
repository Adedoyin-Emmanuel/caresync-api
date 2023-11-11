"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const middlewares_1 = require("../middlewares");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const rateSlowDown_1 = require("../middlewares/rateSlowDown");
const authRouter = express_1.default.Router();
authRouter.post("/login", [rateLimiter_1.useLoginRateLimiter, rateSlowDown_1.useLoginSlowDown], auth_controller_1.default.login);
authRouter.post("/logout", [middlewares_1.useAuth], auth_controller_1.default.logout);
authRouter.post("/refresh-token", auth_controller_1.default.generateRefreshToken);
//MISC
authRouter.get("/verify-email", [middlewares_1.useAuth, rateLimiter_1.useVerifyLimiter, rateSlowDown_1.useVerifySlowDown], auth_controller_1.default.sendEmailToken);
authRouter.get("/confirm-email", [rateLimiter_1.useVerifyLimiter, rateSlowDown_1.useVerifySlowDown], auth_controller_1.default.verifyEmailToken);
authRouter.post("/forgot-password", [rateLimiter_1.useVerifyLimiter, rateSlowDown_1.useVerifySlowDown], auth_controller_1.default.forgotPassword);
authRouter.post("/reset-password", [rateLimiter_1.useVerifyLimiter, rateSlowDown_1.useVerifySlowDown], auth_controller_1.default.resetPassword);
exports.default = authRouter;
