"use strict";
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
const joi_1 = __importDefault(require("joi"));
const livekit_server_sdk_1 = require("livekit-server-sdk");
const models_1 = require("../models");
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const socket_server_1 = require("../sockets/socket.server");
const utils_1 = require("../utils");
const utils_2 = require("./../utils");
class AppointmentController {
    static createAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationSchema = joi_1.default.object({
                title: joi_1.default.string().required().max(50),
                description: joi_1.default.string().required().max(1000),
                hospitalId: joi_1.default.string().required(),
                userId: joi_1.default.string().required(),
                startDate: joi_1.default.date().iso().required(),
                endDate: joi_1.default.date().iso().required(),
            });
            const { error, value } = validationSchema.validate(req.body);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            try {
                // Check if the user and hospital exist in the database
                const user = yield models_1.User.findById(value.userId);
                const hospital = yield models_1.Hospital.findById(value.hospitalId);
                if (!user) {
                    return (0, utils_2.response)(res, 400, "User not found");
                }
                if (!hospital) {
                    return (0, utils_2.response)(res, 400, "Hospital not found");
                }
                // Check for conflicts with existing appointments for the same hospital and time range
                const existingAppointment = yield appointment_model_1.default.findOne({
                    hospitalId: value.hospitalId,
                    startDate: { $lt: value.endDate },
                    endDate: { $gt: value.startDate },
                });
                if (existingAppointment) {
                    return (0, utils_2.response)(res, 409, "Appointment time range conflicts with an existing appointment.");
                }
                const appointment = yield appointment_model_1.default.create(value);
                // Update User's Appointments
                yield models_1.User.findByIdAndUpdate(value.userId, { $push: { appointments: appointment._id } }, { new: true });
                // Update Hospital's Appointments
                yield models_1.Hospital.findByIdAndUpdate(value.hospitalId, { $push: { appointments: appointment._id } }, { new: true });
                //emit a newAppointment event
                socket_server_1.io.emit("newAppointment", appointment);
                return (0, utils_2.response)(res, 201, "Appointment created successfully", appointment);
            }
            catch (error) {
                console.error(error);
                return (0, utils_2.response)(res, 500, `An error occurred while creating the appointment ${error}`);
            }
        });
    }
    static getAllAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allAppointments = yield appointment_model_1.default.find();
            return (0, utils_2.response)(res, 200, "Appointments fetched successfully", allAppointments);
        });
    }
    static getAppointmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            const appointment = yield appointment_model_1.default.findById(value.id).sort({
                updatedAt: -1,
            });
            if (!appointment)
                return (0, utils_2.response)(res, 404, "Appointment with given id not found");
            return (0, utils_2.response)(res, 200, "Appointment fetched successfully", appointment);
        });
    }
    static getAppointmentByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            const { id: userId } = value;
            const appointments = yield appointment_model_1.default.find({ userId })
                .sort({ createdAt: -1 })
                .exec();
            if (!appointments)
                return (0, utils_2.response)(res, 404, "No appointments found");
            return (0, utils_2.response)(res, 200, "Appointments fetched successfully", appointments);
        });
    }
    static getAppointmentByHospitalId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            const { id: hospitalId } = value;
            const appointments = yield appointment_model_1.default.find({ hospitalId })
                .sort({ createdAt: -1 })
                .exec();
            if (!appointments)
                return (0, utils_2.response)(res, 404, "No appointments found");
            return (0, utils_2.response)(res, 200, "Appointments fetched successfully", appointments);
        });
    }
    static getLatestAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema2 = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error: error2, value: value2 } = requestSchema2.validate(req.params);
            if (error2)
                return (0, utils_2.response)(res, 400, error2.details[0].message);
            const requestSchema = joi_1.default.object({
                limit: joi_1.default.number().min(1),
                userType: joi_1.default.string().valid("user", "hospital").required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            // Get the appointments
            const { limit, userType } = value;
            const { id } = value2;
            const filter = userType === "user" ? { userId: id } : { hospitalId: id };
            const latestAppointments = yield appointment_model_1.default.find(filter)
                .sort({ startDate: -1, updatedAt: -1 })
                .limit(limit);
            if (!latestAppointments.length) {
                return (0, utils_2.response)(res, 200, "No latest appointments found!", []);
            }
            return (0, utils_2.response)(res, 200, "Latest appointments fetched successfully", latestAppointments);
        });
    }
    static generateAppointmentToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                participantName: joi_1.default.string().required(),
                roomName: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            const { participantName, roomName } = value;
            const API_KEY = process.env.LK_API_KEY;
            const SECRET_KEY = process.env.LK_API_SECRET;
            const at = new livekit_server_sdk_1.AccessToken(API_KEY, SECRET_KEY, {
                identity: participantName,
            });
            at.addGrant({ roomJoin: true, room: roomName });
            return (0, utils_2.response)(res, 200, "Appointment token generated successfully", at.toJwt());
        });
    }
    static updateAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                title: joi_1.default.string().max(50),
                description: joi_1.default.string().max(1000),
                status: joi_1.default.string().required(),
                startDate: joi_1.default.date().iso(),
                endDate: joi_1.default.date().iso(),
            });
            const { error: requestBodyError, value: requestBodyValue } = requestSchema.validate(req.body);
            if (requestBodyError)
                return (0, utils_2.response)(res, 400, requestBodyError.details[0].message);
            const requestIdSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error: requestParamsError, value: requestParamsValue } = requestIdSchema.validate(req.params);
            if (requestParamsError)
                return (0, utils_2.response)(res, 400, requestParamsError.details[0].message);
            // Check if appointment with the given id exists
            const { id } = requestParamsValue;
            const existingAppointment = yield appointment_model_1.default.findById(id);
            if (!existingAppointment)
                return (0, utils_2.response)(res, 404, "Appointment with given id not found");
            //check the status of the appointment
            if (existingAppointment.status === "failed") {
                return (0, utils_2.response)(res, 400, "You cannot update an appointment that has already been cancelled!");
            }
            // Check for conflicts with existing appointments for the same hospital and time range
            if (requestBodyValue.startDate &&
                requestBodyValue.endDate &&
                requestBodyValue.startDate > requestBodyValue.endDate) {
                return (0, utils_2.response)(res, 400, "End date cannot be earlier than the start date");
            }
            const options = { new: true, runValidators: true };
            const updatedAppointment = yield appointment_model_1.default.findByIdAndUpdate(id, requestBodyValue, options);
            //emit an updateAppointment event
            socket_server_1.io.emit("updateAppointment", updatedAppointment);
            return (0, utils_2.response)(res, 200, "Appointment updated successfully", updatedAppointment);
        });
    }
    static cancelAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            const appointment = yield appointment_model_1.default.findById(value.id);
            if (!appointment)
                return (0, utils_2.response)(res, 404, "Appointment with given id not found!");
            if (appointment.status === "failed")
                return (0, utils_2.response)(res, 400, "Appointment is already cancelled!");
            if (appointment.status === "success")
                return (0, utils_2.response)(res, 400, "Cannot cancel an alrady approved appointment.");
            appointment.status = "failed";
            const cancelledAppointment = yield appointment.save();
            //emit an event to cancel the appointment
            socket_server_1.io.emit("cancelAppointment", cancelledAppointment);
            return (0, utils_2.response)(res, 200, "Appointment cancelled successfully", cancelledAppointment);
        });
    }
    static approveAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_2.response)(res, 400, error.details[0].message);
            //check if the appointment exists
            const appointment = yield appointment_model_1.default.findById(value.id);
            if (!appointment)
                return (0, utils_2.response)(res, 404, "Appointment with given id not found!");
            if (appointment.status === "failed")
                return (0, utils_2.response)(res, 400, "Appointment is already cancelled");
            const currentTime = new Date();
            const appointmentStartDate = (0, utils_1.toJavaScriptDate)(appointment.startDate);
            //if appointment start date and time has passed,
            if (appointmentStartDate < currentTime) {
                return (0, utils_2.response)(res, 400, "Appointment has expired!");
            }
            const hospital = yield models_1.Hospital.findById(appointment.hospitalId);
            const user = yield models_1.User.findById(appointment.userId);
            //check if the user and the hospital exists
            if (user && hospital) {
                const userEmail = user.email;
                const hospitalEmail = hospital.email;
                const startFormattedTime = (0, utils_1.formatDateTime)(appointment.startDate);
                const endFormattedTime = (0, utils_1.formatDateTime)(appointment.endDate);
                const meetingLink = process.env.NODE_ENV === "development"
                    ? `http://localhost:3000/user/appointments/${appointment._id}/start`
                    : `https://getcaresync.vercel.app/user/appointments/${appointment._id}/start`;
                const rescheduleLink = process.env.NODE_ENV === "development"
                    ? `http://localhost:3000/user/appointments/${appointment._id}`
                    : `https://getcaresync.vercel.app/user/appointments/${appointment._id}`;
                const hospitalMeetingLink = process.env.NODE_ENV === "development"
                    ? `http://localhost:3000/hospital/appointments/${appointment._id}/start`
                    : `https://getcaresync.vercel.app/hospital/appointments/${appointment._id}/start`;
                const hospitalRescheduleLink = process.env.NODE_ENV === "development"
                    ? `http://localhost:3000/hospital/appointments/${appointment._id}`
                    : `https://getcaresync.vercel.app/hospital/appointments/${appointment._id}`;
                const userEmailContent = (0, utils_1.parseUserEmailData)(user.name, hospital.clinicName, appointment.title, appointment.description, startFormattedTime, endFormattedTime, meetingLink, rescheduleLink);
                const hospitalEmailContent = (0, utils_1.parseHospitalEmailData)(user.name, hospital.clinicName, appointment.title, appointment.description, startFormattedTime, endFormattedTime, hospitalMeetingLink, hospitalRescheduleLink);
                const hospitalMailResponse = yield (0, utils_1.sendEmail)("Appointment Approved", hospitalEmailContent, hospitalEmail);
                const userMailResponse = yield (0, utils_1.sendEmail)("Appointment Approved", userEmailContent, userEmail);
                if (!hospitalMailResponse || !userMailResponse) {
                    // a very bad error occured probably SMTP issues
                    appointment.status = "failed";
                    yield appointment.save();
                    return (0, utils_2.response)(res, 400, "An error occured while sending email");
                }
                else {
                    //everything is fine
                    appointment.status = "success";
                    const approvedAppointment = yield appointment.save();
                    socket_server_1.io.emit("approveAppointment", approvedAppointment);
                    return (0, utils_2.response)(res, 200, "Appointment approved successfully", approvedAppointment);
                }
            }
            else {
                appointment.status = "failed";
                yield appointment.save();
                return (0, utils_2.response)(res, 404, "Appointment failed, user or hospital not found!");
            }
        });
    }
    static getEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const API_KEY = process.env.LK_API_KEY;
            const SECRET_KEY = process.env.LK_API_SECRET;
            const receiver = new livekit_server_sdk_1.WebhookReceiver(API_KEY, SECRET_KEY);
            const event = receiver.receive(req.body, req.get("Authorization"));
            console.log(event);
            return (0, utils_2.response)(res, 200, "Appointment web hook received successfully", event);
        });
    }
    static deleteAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_2.response)(res, 200, error.details[0].message);
            //delete the appointment from the user and hospital document
            const deletedAppointment = yield appointment_model_1.default.findByIdAndDelete(value.id);
            if (!deletedAppointment)
                return (0, utils_2.response)(res, 404, "Appointment with given id not found!");
            try {
                yield models_1.User.findByIdAndUpdate(deletedAppointment.userId, {
                    $pull: { appointments: deletedAppointment._id },
                });
                yield models_1.Hospital.findByIdAndUpdate(deletedAppointment.hospitalId, {
                    $pull: { appointments: deletedAppointment._id },
                });
                //emit a delete event
                socket_server_1.io.emit("deleteAppointment", deletedAppointment);
                return (0, utils_2.response)(res, 200, "Appointment deleted successfully");
            }
            catch (error) {
                return (0, utils_2.response)(res, 400, "An error occured while deleting the appointment!");
            }
        });
    }
}
exports.default = AppointmentController;
