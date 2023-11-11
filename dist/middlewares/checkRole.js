"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const useCheckRole = (role) => {
    return (req, res, next) => {
        const isHospital = req.hospital;
        const isUser = req.user;
        if (isHospital && role === "hospital") {
            next();
        }
        else if (isUser && role === "user") {
            next();
        }
        else {
            return (0, utils_1.response)(res, 403, "Access denied. Insufficient permissions.");
        }
    };
};
exports.default = useCheckRole;
