"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    message: {
        type: String,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        role: String,
        required: true,
    },
    receiver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        role: String,
        required: true,
    },
}, { timestamps: true, versionKey: false });
const Message = mongoose_1.default.model("Message", MessageSchema);
exports.default = Message;
