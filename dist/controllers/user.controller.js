"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const joi_1 = __importDefault(require("joi"));
const _ = __importStar(require("lodash"));
const user_model_1 = __importDefault(require("../models/user.model"));
const utils_1 = require("./../utils");
const socket_server_1 = require("../sockets/socket.server");
class UserController {
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationSchema = joi_1.default.object({
                name: joi_1.default.string().required().max(50),
                username: joi_1.default.string().required().max(20),
                email: joi_1.default.string().required().email(),
                password: joi_1.default.string().required().min(6).max(30),
            });
            const { error, value } = validationSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            //check if email has been taken by another user
            const { email: emailTaken, username: usernameTaken } = value;
            const existingEmailUser = yield user_model_1.default.findOne({ email: emailTaken });
            if (existingEmailUser)
                return (0, utils_1.response)(res, 400, "Email already taken");
            const existingUsernameUser = yield user_model_1.default.findOne({
                username: usernameTaken,
            });
            if (existingUsernameUser)
                return (0, utils_1.response)(res, 400, "Username already taken");
            const salt = yield bcryptjs_1.default.genSalt(10);
            const password = yield bcryptjs_1.default.hash(value.password, salt);
            const { name, username, email } = value;
            const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${username || name}`;
            const valuesToStore = {
                name,
                username,
                email,
                password,
                profilePicture,
            };
            const user = yield user_model_1.default.create(valuesToStore);
            const filteredUser = _.pick(user, [
                "name",
                "username",
                "email",
                "createdAt",
                "updatedAt",
                "profilePicture",
            ]);
            return (0, utils_1.response)(res, 201, "User created successfully", filteredUser);
        });
    }
    static getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = yield user_model_1.default.find();
            return (0, utils_1.response)(res, 200, "Users fetched successfully", allUsers);
        });
    }
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const user = yield user_model_1.default.findById(value.id);
            if (!user)
                return (0, utils_1.response)(res, 404, "User with given id not found");
            return (0, utils_1.response)(res, 200, "User fetched successfully", user);
        });
    }
    static getMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(req.user._id);
            if (!user)
                return (0, utils_1.response)(res, 404, "User with given id not found");
            return (0, utils_1.response)(res, 200, "User info fetched successfully", user);
        });
    }
    static getOnlineUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineUsers = yield user_model_1.default.find({ online: true });
            if (!onlineUsers) {
                socket_server_1.io.emit("onlineUsers", []);
                return (0, utils_1.response)(res, 404, "No user online", []);
            }
            socket_server_1.io.emit("onlineUsers", onlineUsers);
            return (0, utils_1.response)(res, 200, "Online users fetched successfully", onlineUsers);
        });
    }
    static returnOnlineUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineUsers = yield user_model_1.default.find({ online: true });
            if (!onlineUsers) {
                return [];
            }
            return onlineUsers;
        });
    }
    static searchUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                searchTerm: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { searchTerm } = value;
            const user = yield user_model_1.default.find({
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { username: { $regex: searchTerm, $options: "i" } },
                ],
            });
            if (user.length == 0)
                return (0, utils_1.response)(res, 404, "No users found", []);
            if (!user)
                return (0, utils_1.response)(res, 400, "Couldn't get user");
            return (0, utils_1.response)(res, 200, "User fetched successfully", user);
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                name: joi_1.default.string().required().max(50),
                username: joi_1.default.string().required().max(20),
                bio: joi_1.default.string().required().max(500),
                email: joi_1.default.string().required().email(),
                location: joi_1.default.string().required().max(50),
            });
            const { error: requestBodyError, value: requestBodyValue } = requestSchema.validate(req.body);
            if (requestBodyError)
                return (0, utils_1.response)(res, 400, requestBodyError.details[0].message);
            const requestIdSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error: requestParamsError, value: requestParamsValue } = requestIdSchema.validate(req.params);
            if (requestParamsError)
                return (0, utils_1.response)(res, 400, requestParamsError.details[0].message);
            //check if user with id exist
            const { id } = requestParamsValue;
            const existingUser = yield user_model_1.default.findById(id);
            if (!existingUser)
                return (0, utils_1.response)(res, 404, "User with given id not found");
            //check if email has been taken by another user
            const { username, email } = requestBodyValue;
            if (email && email !== existingUser.email) {
                const existingEmailUser = yield user_model_1.default.findOne({ email });
                if (existingEmailUser)
                    return (0, utils_1.response)(res, 400, "Email already taken");
            }
            // Check if username has been taken by another user
            if (username && username !== existingUser.username) {
                const existingUsernameUser = yield user_model_1.default.findOne({ username });
                if (existingUsernameUser) {
                    return (0, utils_1.response)(res, 400, "Username has already been taken by another user");
                }
            }
            //update the user
            const options = { new: true, runValidators: true };
            const updatedUser = yield user_model_1.default.findByIdAndUpdate(id, requestBodyValue, options);
            return (0, utils_1.response)(res, 200, "User details updated successfully", updatedUser);
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 200, error.details[0].message);
            const deletedUser = yield user_model_1.default.findByIdAndDelete(value.id);
            if (!deletedUser)
                return (0, utils_1.response)(res, 404, "User with given id not found!");
            return (0, utils_1.response)(res, 200, "User deleted successfully");
        });
    }
}
exports.default = UserController;
