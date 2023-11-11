"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const roomRouter = express_1.default.Router();
roomRouter.get("/get-token", middlewares_1.useAuth, controllers_1.RoomController.getRoomToken);
exports.default = roomRouter;
