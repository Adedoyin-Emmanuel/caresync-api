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
const config_1 = __importDefault(require("config"));
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const _ = __importStar(require("lodash"));
const hospital_model_1 = __importDefault(require("../models/hospital.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const utils_1 = require("./../utils");
const socket_server_1 = require("../sockets/socket.server");
const hospital_controller_1 = __importDefault(require("./hospital.controller"));
const user_controller_1 = __importDefault(require("./user.controller"));
class AuthController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                email: joi_1.default.string().required().email(),
                password: joi_1.default.string().required(),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { email, password, userType } = value;
            if (userType !== "user" && userType !== "hospital")
                return (0, utils_1.response)(res, 400, "Invalid user type");
            if (userType == "user") {
                let user = yield user_model_1.default.findOne({ email }).select("+password");
                /*The email doesn't exist but we confuse the user to think it is an invalid,
                just in case of an hacker trying to exploit 😂*/
                if (!user)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const validPassword = yield bcryptjs_1.default.compare(password, user.password);
                if (!validPassword)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const accessToken = user.generateAccessToken();
                const refreshToken = user.generateRefreshToken();
                const options = { new: true, runValidators: true };
                user = yield user_model_1.default.findOneAndUpdate({ email }, { token: refreshToken, online: true }, options);
                yield user.save();
                //update the headers
                res.header("X-Auth-Access-Token", accessToken);
                res.header("X-Auth-Refresh-Token", refreshToken);
                // Set HTTP-only cookies for access token and refresh token
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                    path: "/",
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieRefreshTokenExpiration"),
                    path: "/",
                });
                const filteredUser = _.pick(user, [
                    "_id",
                    "name",
                    "email",
                    "username",
                    "profilePicture",
                    "createdAt",
                    "updatedAt",
                    "online"
                ]);
                const dataToClient = Object.assign({ accessToken }, filteredUser);
                //actually we want to emit all online hospitals
                const onlineUsers = yield user_controller_1.default.returnOnlineUsers(req, res);
                socket_server_1.io.emit("userLogin", filteredUser);
                if (onlineUsers.length === 0) {
                    socket_server_1.io.emit("onlineUsers", []);
                }
                socket_server_1.io.emit("onlineUsers", onlineUsers);
                return (0, utils_1.response)(res, 200, "Login successful", dataToClient);
            }
            else {
                let hospital = yield hospital_model_1.default.findOne({
                    email,
                }).select("+password");
                if (!hospital)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const validPassword = yield bcryptjs_1.default.compare(password, hospital.password);
                if (!validPassword)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const accessToken = hospital.generateAccessToken();
                const refreshToken = hospital.generateRefreshToken();
                const options = { new: true, runValidators: true };
                hospital = yield hospital_model_1.default.findOneAndUpdate({ email }, { token: refreshToken, online: true }, options);
                yield hospital.save();
                res.header("X-Auth-Access-Token", accessToken);
                res.header("X-Auth-Refresh-Token", refreshToken);
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                    path: "/",
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieRefreshTokenExpiration"),
                    path: "/",
                });
                const filteredHospital = _.pick(hospital, [
                    "_id",
                    "clinicName",
                    "username",
                    "email",
                    "profilePicture",
                    "createdAt",
                    "updatedAt",
                    "online"
                ]);
                const dataToClient = Object.assign({ accessToken }, filteredHospital);
                //actually we want to emit all online hospitals
                const onlineHospitals = yield hospital_controller_1.default.returnOnlineHospitals(req, res);
                socket_server_1.io.emit("userLogin", filteredHospital);
                if (onlineHospitals.length === 0) {
                    socket_server_1.io.emit("onlineHospitals", []);
                }
                socket_server_1.io.emit("onlineHospitals", onlineHospitals);
                return (0, utils_1.response)(res, 200, "Login successful", dataToClient);
            }
        });
    }
    static generateRefreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                return AuthController.logout(req, res);
            const privateKey = process.env.JWT_PRIVATE_KEY;
            const decoded = jsonwebtoken_1.default.verify(refreshToken, privateKey);
            if (!decoded)
                return (0, utils_1.response)(res, 401, "You're not authorized, Invalid token");
            const userRole = "user";
            const hospitalRole = "hospital";
            if (decoded.role === userRole) {
                //that's a user
                const user = yield user_model_1.default.findById(decoded._id).select("+token");
                if (!user || !user.token)
                    return (0, utils_1.response)(res, 401, "You're not authorized, invalid token!");
                if (refreshToken === user.token) {
                    const newAccessToken = user.generateAccessToken();
                    res.header("X-Auth-Access-Token", newAccessToken);
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                        path: "/",
                    });
                    return (0, utils_1.response)(res, 200, "Access token generated successfully", newAccessToken);
                }
                else {
                    // the token is no longer valid, so the user has to login.
                    AuthController.logout(req, res);
                }
            }
            else if (decoded.role === hospitalRole) {
                //that's an hospital
                const hospital = yield hospital_model_1.default.findById(decoded._id).select("+token");
                if (!hospital || !hospital.token)
                    return (0, utils_1.response)(res, 401, "You're not authorized, invalid token!");
                if (refreshToken === hospital.token) {
                    const newAccessToken = hospital.generateAccessToken();
                    res.header("X-Auth-Access-Token", newAccessToken);
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                        path: "/",
                    });
                    return (0, utils_1.response)(res, 200, "Access token generated successfully", newAccessToken);
                }
                else {
                    //nobody
                    AuthController.logout(req, res);
                    // return response(
                    //   res,
                    //   403,
                    //   "You can't perform this action, no role found"
                    // );
                }
            }
        });
    }
    static sendEmailToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userType = req.userType;
            let defaultName = "Caresync";
            switch (userType) {
                case "user":
                    defaultName = req.user.name;
                    break;
                case "hospital":
                    defaultName = req.hospital.clinicName;
                    break;
            }
            const requestSchema = joi_1.default.object({
                email: joi_1.default.string().required().email(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { email } = value;
            if (userType == "user") {
                const user = yield user_model_1.default.findOne({ email }).select("+verifyEmailToken +verifyEmailTokenExpire");
                if (!user)
                    return (0, utils_1.response)(res, 404, "User with given email not found");
                const verifyEmailToken = (0, utils_1.generateLongToken)();
                //update the verifyEmailToken
                user.verifyEmailToken = verifyEmailToken;
                user.verifyEmailTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
                yield user.save();
                const serverURL = process.env.NODE_ENV === "development"
                    ? "http://localhost:2800"
                    : req.hostname;
                const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;
                const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1; font-weight:bold;">Caresync</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${req.user.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync</p>
      
                </div>
      
          `;
                const result = yield (0, utils_1.sendEmail)("Verify Account", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Verification mail sent successfully");
            }
            else if (userType == "hospital") {
                const hospital = yield hospital_model_1.default.findOne({ email }).select("+verifyEmailToken +verifyEmailTokenExpire");
                if (!hospital)
                    return (0, utils_1.response)(res, 404, "Hospital with given email not found");
                const verifyEmailToken = (0, utils_1.generateLongToken)();
                //update the verifyEmailToken
                hospital.verifyEmailToken = verifyEmailToken;
                hospital.verifyEmailTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
                yield hospital.save();
                const serverURL = process.env.NODE_ENV === "development"
                    ? "http://localhost:2800"
                    : req.hostname;
                const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;
                console.log(req.hospital);
                const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1; font-weight:bold;">Caresync</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${hospital.clinicName},</p>
      
                    <p style="color: #333;">Thank you for creating an hospital account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync</p>
      
                </div>
      
          `;
                const result = yield (0, utils_1.sendEmail)("Verify Account", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Verification mail sent successfully");
            }
        });
    }
    static verifyEmailToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                token: joi_1.default.string().required(),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const redirectURL = process.env.NODE_ENV === "development"
                ? `http://localhost:3000/auth/verified`
                : `https://getcaresync.vercel.app/auth/verified`;
            const { token, userType } = value;
            const verifyEmailToken = token;
            if (userType == "user") {
                const user = yield user_model_1.default.findOne({
                    verifyEmailToken,
                    verifyEmailTokenExpire: { $gt: Date.now() },
                });
                if (!user) {
                    console.log(user);
                    return res
                        .status(400)
                        .redirect(redirectURL +
                        "?success=false&message=Invalid or expired token!&userType=user");
                }
                user.verifyEmailToken = undefined;
                user.verifyEmailTokenExpire = undefined;
                user.isVerified = true;
                yield user.save();
                return res
                    .status(200)
                    .redirect(redirectURL +
                    "?success=true&message=User email verified successfully&userType=user");
            }
            else if (userType == "hospital") {
                const hospital = yield hospital_model_1.default.findOne({
                    verifyEmailToken,
                    verifyEmailTokenExpire: { $gt: Date.now() },
                });
                if (!hospital) {
                    return res
                        .status(400)
                        .redirect(redirectURL +
                        "?success=false&message=Invalid or expired token!&userType=hospital");
                }
                hospital.verifyEmailToken = undefined;
                hospital.verifyEmailTokenExpire = undefined;
                hospital.isVerified = true;
                yield hospital.save();
                return res
                    .status(200)
                    .redirect(redirectURL +
                    "?success=true&message=Hospital email verified successfully&userType=hospital");
            }
            else {
                return res
                    .status(400)
                    .redirect(redirectURL +
                    "?success=false&message=No valid user type, please login!");
            }
        });
    }
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                email: joi_1.default.string().required().email(),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { email, userType: clientUserType } = value;
            const userType = clientUserType;
            if (userType == "user") {
                const user = yield user_model_1.default.findOne({ email }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!user) {
                    return (0, utils_1.response)(res, 400, "Invalid or expired token!");
                }
                const resetToken = (0, utils_1.generateLongToken)();
                // 1 hour
                const tokenExpireDate = new Date(Date.now() + 3600000);
                user.resetPasswordToken = resetToken;
                user.resetPasswordTokenExpire = tokenExpireDate;
                yield user.save();
                const clientDomain = process.env.NODE_ENV === "development"
                    ? `http://localhost:3000/auth/reset-password?token=${resetToken}&userType=${userType}`
                    : `https://getcaresync.vercel.app/auth/reset-password?token=${resetToken}&userType=${userType}`;
                const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1;">Change Password</h1>
      
                    <p style="color: #333;">Dear ${user.name},</p>
      
                    <p style="color: #333;">We received a request to reset your password for your caresync account. To proceed with resetting your password, please click the button below. 
                    Please note that this link is temporary and will expire in an hour, so make sure to reset your password as soon as possible.
                    </p>
      
                    <a href=${clientDomain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Change my password</a>
                    <br/>
                    <span>Or copy this link ${clientDomain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't initiate a password reset, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>
          `;
                const result = yield (0, utils_1.sendEmail)("Change Password", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Password reset link sent to mail successfully");
            }
            else if (userType == "hospital") {
                const hospital = yield hospital_model_1.default.findOne({ email }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!hospital) {
                    return (0, utils_1.response)(res, 404, "Hospital not found!");
                }
                const resetToken = (0, utils_1.generateLongToken)();
                // 1 hour
                const tokenExpireDate = new Date(Date.now() + 3600000);
                hospital.resetPasswordToken = resetToken;
                hospital.resetPasswordTokenExpire = tokenExpireDate;
                yield hospital.save();
                const clientDomain = process.env.NODE_ENV === "development"
                    ? `http://localhost:3000/auth/reset-password?token=${resetToken}&userType=${userType}`
                    : `https://getcaresync.vercel.app/auth/reset-password?token=${resetToken}&userType=${userType}`;
                const data = `
                  <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1;">Change Password</h1>
      
                    <p style="color: #333;">Dear ${hospital.clinicName},</p>
      
                    <p style="color: #333;">We received a request to reset your password for your caresync hospital account. To proceed with resetting your password, please click the button below. 
                    Please note that this link is temporary and will expire in an hour, so make sure to reset your password as soon as possible.
                    </p>
      
                    <a href=${clientDomain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Change my password</a>
                    <br/>
                    <span>Or copy this link ${clientDomain} and paste it to your browser </span>
      
                    <p style="color: #333;">If your hospital didn't initiate a password reset, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>

          `;
                const result = yield (0, utils_1.sendEmail)("Change Password", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Password reset link sent to mail successfully");
            }
            else {
                return (0, utils_1.response)(res, 400, "Invalid user type, valid userTypes include a user or an hospital!");
            }
        });
    }
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                token: joi_1.default.string().required(),
                password: joi_1.default.string().required().min(6).max(30),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { token, password, userType: clientUserType } = value;
            const resetPasswordToken = token;
            const userType = clientUserType;
            if (userType == "user") {
                const user = yield user_model_1.default.findOne({
                    resetPasswordToken,
                    resetPasswordTokenExpire: { $gt: Date.now() },
                }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!user)
                    return (0, utils_1.response)(res, 400, "Invalid or expired token!");
                // Hash and set the new password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                user.password = hashedPassword;
                user.resetPasswordToken = undefined;
                user.resetPasswordTokenExpire = undefined;
                yield user.save();
                return (0, utils_1.response)(res, 200, "Password reset successful");
            }
            else if (userType == "hospital") {
                const hospital = yield hospital_model_1.default.findOne({
                    resetPasswordToken,
                    resetPasswordTokenExpire: { $gt: Date.now() },
                }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!hospital)
                    return (0, utils_1.response)(res, 400, "Invalid or expired token!");
                // Hash and set the new password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                hospital.password = hashedPassword;
                hospital.resetPasswordToken = undefined;
                hospital.resetPasswordTokenExpire = undefined;
                yield hospital.save();
                return (0, utils_1.response)(res, 200, "Password reset successful");
            }
            else {
                return (0, utils_1.response)(res, 404, "No valid user type, please login");
            }
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (req.userType) {
                case "user":
                    const userId = req.user._id;
                    const user = yield user_model_1.default.findByIdAndUpdate({ _id: userId }, { online: false });
                    yield user.save();
                    socket_server_1.io.emit("onlineUsers", []);
                    break;
                case "hospital":
                    const hospitalId = req.hospital._id;
                    const hospital = yield hospital_model_1.default.findByIdAndUpdate({ _id: hospitalId }, { online: false });
                    yield hospital.save();
                    socket_server_1.io.emit("onlineHospitals", []);
                    break;
            }
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            socket_server_1.io.emit("userLogout", {});
            return (0, utils_1.response)(res, 200, "Logout successful!");
        });
    }
}
exports.default = AuthController;
