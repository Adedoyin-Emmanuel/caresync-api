"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = exports.ReviewController = exports.AppointmentController = exports.HospitalController = exports.UserController = exports.AuthController = void 0;
const auth_controller_1 = __importDefault(require("./auth.controller"));
exports.AuthController = auth_controller_1.default;
const user_controller_1 = __importDefault(require("./user.controller"));
exports.UserController = user_controller_1.default;
const hospital_controller_1 = __importDefault(require("./hospital.controller"));
exports.HospitalController = hospital_controller_1.default;
const appointment_controller_1 = __importDefault(require("./appointment.controller"));
exports.AppointmentController = appointment_controller_1.default;
const review_controller_1 = __importDefault(require("./review.controller"));
exports.ReviewController = review_controller_1.default;
const room_controller_1 = __importDefault(require("./room.controller"));
exports.RoomController = room_controller_1.default;
