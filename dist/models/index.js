"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.User = exports.Review = exports.Hospital = exports.Appointment = void 0;
const appointment_model_1 = __importDefault(require("./appointment.model"));
exports.Appointment = appointment_model_1.default;
const hospital_model_1 = __importDefault(require("./hospital.model"));
exports.Hospital = hospital_model_1.default;
const message_model_1 = __importDefault(require("./message.model"));
exports.Message = message_model_1.default;
const review_model_1 = __importDefault(require("./review.model"));
exports.Review = review_model_1.default;
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
