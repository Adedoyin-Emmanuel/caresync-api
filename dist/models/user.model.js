"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        max: 50,
    },
    username: {
        type: String,
        required: true,
        max: 20,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        min: 6,
        max: 30,
        required: true,
        select: false,
    },
    profilePicture: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: false,
        default: "Bridging health with technology",
        max: 500,
    },
    token: {
        type: String,
        select: false,
        required: false,
    },
    isVerified: {
        type: Boolean,
        required: false,
        default: false,
    },
    location: {
        type: String,
        required: false,
        max: 50,
        default: ""
    },
    allTotalAppointments: {
        type: Number,
        required: false,
        default: 0,
    },
    verifyEmailToken: {
        type: String,
        required: false,
        select: false,
    },
    online: {
        type: Boolean,
        required: false,
        default: false
    },
    verifyEmailTokenExpire: {
        type: Date,
        required: false,
        select: false,
    },
    resetPasswordToken: {
        type: String,
        required: false,
        select: false,
    },
    resetPasswordTokenExpire: {
        type: Date,
        required: false,
        select: false,
    },
    appointments: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Appointments",
        },
    ],
    healthCareHistory: [
        { type: mongoose_1.default.Schema.Types.ObjectId, ref: "HealthcareHistory" },
    ],
    messages: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Messages",
        },
    ],
    reviews: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Reviews",
        },
    ],
}, { timestamps: true, versionKey: false });
UserSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
        username: this.username,
        name: this.name,
        role: "user",
    };
    const JWT_SECRET = process.env.JWT_PRIVATE_KEY;
    const tokenExpiration = config_1.default.get("App.tokenExpiration");
    const options = {
        expiresIn: tokenExpiration,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    return token;
};
UserSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
        username: this.username,
        name: this.name,
        role: "user",
    };
    const JWT_SECRET = process.env.JWT_PRIVATE_KEY;
    const options = {
        expiresIn: config_1.default.get("App.refreshTokenExpiration"),
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    return token;
};
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
