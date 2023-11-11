"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("./../middlewares");
const appointmentRouter = express_1.default.Router();
const rawWebhookMiddleware = express_1.default.raw({ type: "application/webhook+json" });
appointmentRouter.post("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("user")], controllers_1.AppointmentController.createAppointment);
appointmentRouter.get("/", [middlewares_1.useAuth], controllers_1.AppointmentController.getAllAppointments);
appointmentRouter.get("/latest/:id", [middlewares_1.useAuth], controllers_1.AppointmentController.getLatestAppointments);
appointmentRouter.get("/user/:id", controllers_1.AppointmentController.getAppointmentByUserId);
//get the appointment token
appointmentRouter.get("/generate-token", [middlewares_1.useAuth], controllers_1.AppointmentController.generateAppointmentToken);
appointmentRouter.get("/hospital/:id", controllers_1.AppointmentController.getAppointmentByHospitalId);
appointmentRouter.get("/:id", [middlewares_1.useAuth], controllers_1.AppointmentController.getAppointmentById);
//only a user should be able to update an appointment
appointmentRouter.put("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("user")], controllers_1.AppointmentController.updateAppointment);
//a user and an hospital should be able to cancel appointments
appointmentRouter.put("/cancel/:id", [middlewares_1.useAuth], controllers_1.AppointmentController.cancelAppointment);
//only an hospital should be able to approve user appointments
appointmentRouter.put("/approve/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("hospital")], controllers_1.AppointmentController.approveAppointment);
//web hooks
appointmentRouter.post("/webhook", [rawWebhookMiddleware], controllers_1.AppointmentController.getEvents);
//a user and an hospital should be able to delete appointments
appointmentRouter.delete("/:id", [middlewares_1.useAuth], controllers_1.AppointmentController.deleteAppointment);
exports.default = appointmentRouter;
