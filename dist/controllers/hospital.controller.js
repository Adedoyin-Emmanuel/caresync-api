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
const models_1 = require("../models");
const hospital_model_1 = __importDefault(require("../models/hospital.model"));
const utils_1 = require("./../utils");
const socket_server_1 = require("../sockets/socket.server");
class HospitalController {
    static createHospital(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationSchema = joi_1.default.object({
                clinicName: joi_1.default.string().required().max(50),
                username: joi_1.default.string().required().max(20),
                email: joi_1.default.string().required().email(),
                password: joi_1.default.string().required().min(6).max(30),
            });
            const { error, value } = validationSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            //check if email has been taken by another hospital
            const { email: emailTaken, username: usernameTaken } = value;
            const existingEmailUser = yield hospital_model_1.default.findOne({ email: emailTaken });
            if (existingEmailUser)
                return (0, utils_1.response)(res, 400, "Email already taken");
            const existingUsernameUser = yield hospital_model_1.default.findOne({
                username: usernameTaken,
            });
            if (existingUsernameUser)
                return (0, utils_1.response)(res, 400, "Username already taken");
            const salt = yield bcryptjs_1.default.genSalt(10);
            const password = yield bcryptjs_1.default.hash(value.password, salt);
            const { clinicName, username, email } = value;
            const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${username || clinicName}`;
            const valuesToStore = {
                clinicName,
                username,
                email,
                password,
                profilePicture,
            };
            const hospital = yield hospital_model_1.default.create(valuesToStore);
            const filteredHospital = _.pick(hospital, [
                "clinicName",
                "username",
                "email",
                "profilePicture",
                "createdAt",
                "updatedAt",
            ]);
            return (0, utils_1.response)(res, 201, "Hospital created successfully", filteredHospital);
        });
    }
    static getAllHospitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allHospitals = yield hospital_model_1.default.find();
            return (0, utils_1.response)(res, 200, "Hospitals fetched successfully", allHospitals);
        });
    }
    static searchHospital(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                searchTerm: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { searchTerm } = value;
            const hospitals = yield hospital_model_1.default.find({
                $or: [
                    { clinicName: { $regex: searchTerm, $options: "i" } },
                    { username: { $regex: searchTerm, $options: "i" } },
                ],
            });
            if (hospitals.length == 0)
                return (0, utils_1.response)(res, 404, "No hospitals found", []);
            if (!hospitals)
                return (0, utils_1.response)(res, 400, "Couldn't get hospitals");
            return (0, utils_1.response)(res, 200, "Hospital fetched successfully", hospitals);
        });
    }
    static getMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const hospital = yield hospital_model_1.default.findById(req.hospital._id);
            if (!hospital)
                return (0, utils_1.response)(res, 404, "Hospital with given id not found");
            return (0, utils_1.response)(res, 200, "Hospital info fetched successfully", hospital);
        });
    }
    static getOnlineHospitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineHosptials = yield hospital_model_1.default.find({ online: true });
            if (!onlineHosptials) {
                socket_server_1.io.emit("onlineHospitals", []);
                return (0, utils_1.response)(res, 404, "No hospital online", []);
            }
            socket_server_1.io.emit("onlineHospitals", onlineHosptials);
            return (0, utils_1.response)(res, 200, "Online hospitals fetched successfully", onlineHosptials);
        });
    }
    static returnOnlineHospitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineHosptials = yield hospital_model_1.default.find({ online: true });
            if (!onlineHosptials) {
                return [];
            }
            return onlineHosptials;
        });
    }
    static getHospitalById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const hospital = yield hospital_model_1.default.findById(value.id);
            if (!hospital)
                return (0, utils_1.response)(res, 404, "Hospital with given id not found");
            return (0, utils_1.response)(res, 200, "Hospital fetched successfully", hospital);
        });
    }
    static getHospitalAverageRating(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { id: hospitalId } = value;
            const reviews = yield models_1.Review.find({ hospitalId });
            if (reviews.length == 0)
                return (0, utils_1.response)(res, 404, "No reviews found for this hospital", []);
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const rating = totalRating / reviews.length;
            return (0, utils_1.response)(res, 200, "Average rating fetched successfully", rating);
        });
    }
    static updateHospital(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                clinicName: joi_1.default.string().required().max(50),
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
            //check if hospital with id exist
            const { id } = requestParamsValue;
            const existingUser = yield hospital_model_1.default.findById(id);
            if (!existingUser)
                return (0, utils_1.response)(res, 404, "Hospital with given id not found");
            //check if email has been taken by another hospital
            const { username, email } = requestBodyValue;
            if (email && email !== existingUser.email) {
                const existingEmailUser = yield hospital_model_1.default.findOne({ email });
                if (existingEmailUser)
                    return (0, utils_1.response)(res, 400, "Email already taken");
            }
            // Check if username has been taken by another hospital
            if (username && username !== existingUser.username) {
                const existingUsernameUser = yield hospital_model_1.default.findOne({ username });
                if (existingUsernameUser) {
                    return (0, utils_1.response)(res, 400, "Username has already been taken by another hospital");
                }
            }
            const options = { new: true, runValidators: true };
            const updatedHospital = yield hospital_model_1.default.findByIdAndUpdate(id, requestBodyValue, options);
            return (0, utils_1.response)(res, 200, "Hospital updated successfully", updatedHospital);
        });
    }
    static deleteHospital(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 200, error.details[0].message);
            const deletedHospital = yield hospital_model_1.default.findByIdAndDelete(value.id);
            if (!deletedHospital)
                return (0, utils_1.response)(res, 404, "Hospital with given id not found!");
            return (0, utils_1.response)(res, 200, "Hospital deleted successfully");
        });
    }
}
exports.default = HospitalController;
