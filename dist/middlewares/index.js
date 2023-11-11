"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCheckRole = exports.useAuth = exports.useCreateUserLimiter = exports.useRateLimiter = exports.useNotFound = exports.useLoginSlowDown = exports.useLoginRateLimiter = exports.useErrorHandler = void 0;
const auth_1 = __importDefault(require("./auth"));
exports.useAuth = auth_1.default;
const error_1 = __importDefault(require("./error"));
exports.useErrorHandler = error_1.default;
const notFound_1 = __importDefault(require("./notFound"));
exports.useNotFound = notFound_1.default;
const rateLimiter_1 = __importStar(require("./rateLimiter"));
exports.useRateLimiter = rateLimiter_1.default;
Object.defineProperty(exports, "useLoginRateLimiter", { enumerable: true, get: function () { return rateLimiter_1.useLoginRateLimiter; } });
Object.defineProperty(exports, "useCreateUserLimiter", { enumerable: true, get: function () { return rateLimiter_1.useCreateUserLimiter; } });
const rateSlowDown_1 = require("./rateSlowDown");
Object.defineProperty(exports, "useLoginSlowDown", { enumerable: true, get: function () { return rateSlowDown_1.useLoginSlowDown; } });
const checkRole_1 = __importDefault(require("./checkRole"));
exports.useCheckRole = checkRole_1.default;
