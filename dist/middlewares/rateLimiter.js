"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVerifyLimiter = exports.useCreateUserLimiter = exports.useLoginRateLimiter = void 0;
const config_1 = __importDefault(require("config"));
const express_rate_limit_1 = require("express-rate-limit");
const defaultMessage = {
    code: 429,
    status: "Too many requests",
    message: "Too many requests chief, try again later",
    data: {},
};
const useRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: config_1.default.get("App.request-limit"),
    message: defaultMessage,
});
exports.useLoginRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: config_1.default.get("App.login-request-limit"),
    message: defaultMessage,
});
exports.useCreateUserLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: config_1.default.get("App.login-request-limit"),
    message: defaultMessage,
});
exports.useVerifyLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: config_1.default.get("App.verify-user-request-limit"),
    message: defaultMessage,
});
exports.default = useRateLimiter;
