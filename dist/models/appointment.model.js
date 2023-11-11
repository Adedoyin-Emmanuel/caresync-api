"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AppointmentModel = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        max: 50,
    },
    description: {
        type: String,
        required: true,
        max: 1000,
    },
    hospitalId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        required: false,
        default: "pending",
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    reviews: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Review" }],
}, { timestamps: true, versionKey: false });
const Appointment = mongoose_1.default.model("Appointment", AppointmentModel);
exports.default = Appointment;
