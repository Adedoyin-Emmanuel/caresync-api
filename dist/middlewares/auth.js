"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils");
const useAuth = (req, res, next) => {
    const tokenFromCookie = req.cookies.accessToken;
    const refreshTokenCookie = req.cookies.refreshToken;
    //just in case of logout  
    if (!refreshTokenCookie) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return (0, utils_1.response)(res, 401, "Access denied, no refresh token");
    }
    if (!tokenFromCookie) {
        return (0, utils_1.response)(res, 401, "You're not authorized to perform this action, no access token!");
    }
    try {
        // Extract the bearer token from the header
        const JWT_SECRET = process.env.JWT_PRIVATE_KEY;
        if (!JWT_SECRET) {
            throw new Error("JWT private key is missing.");
        }
        let decodeCookie = jsonwebtoken_1.default.verify(tokenFromCookie, JWT_SECRET);
        if (decodeCookie && decodeCookie._id) {
            const userRole = "user", hospitalRole = "hospital";
            if (decodeCookie.role === userRole) {
                req.user = decodeCookie;
                res.user = decodeCookie;
                req.userType = "user";
                next();
            }
            else if (decodeCookie.role === hospitalRole) {
                req.hospital = decodeCookie;
                res.hospital = decodeCookie;
                req.userType = "hospital";
                next();
            }
            else {
                console.log("invalid auth token!");
                return (0, utils_1.response)(res, 401, "Invalid auth token");
            }
        }
        else {
            return (0, utils_1.response)(res, 401, "Invalid auth token.");
        }
    }
    catch (error) {
        console.error(error);
        return (0, utils_1.response)(res, 401, `You're not authorized to perform this action! ${error}`);
    }
};
exports.default = useAuth;
