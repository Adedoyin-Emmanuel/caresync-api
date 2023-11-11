"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = exports.reviewRouter = exports.appointmentRouter = exports.hospitalRouter = exports.userRouter = exports.authRouter = void 0;
const auth_route_1 = __importDefault(require("./auth.route"));
exports.authRouter = auth_route_1.default;
const user_route_1 = __importDefault(require("./user.route"));
exports.userRouter = user_route_1.default;
const hospital_route_1 = __importDefault(require("./hospital.route"));
exports.hospitalRouter = hospital_route_1.default;
const appointment_route_1 = __importDefault(require("./appointment.route"));
exports.appointmentRouter = appointment_route_1.default;
const review_route_1 = __importDefault(require("./review.route"));
exports.reviewRouter = review_route_1.default;
const room_route_1 = __importDefault(require("./room.route"));
exports.roomRouter = room_route_1.default;
