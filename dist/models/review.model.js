"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewSchema = new mongoose_1.default.Schema({
    message: {
        type: String,
        required: true,
        max: 1000,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    hospitalId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Hospital" },
}, { timestamps: true, versionKey: false });
const Review = mongoose_1.default.model("Review", ReviewSchema);
exports.default = Review;
