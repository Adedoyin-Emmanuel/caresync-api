import express from "express";
import { AppointmentController } from "../controllers";
import { useAuth } from "./../middlewares";

const appointmentRouter = express.Router();

appointmentRouter.post("/", [useAuth], AppointmentController.createAppointment);
appointmentRouter.get("/", [useAuth], AppointmentController.getAllAppointments);
appointmentRouter.get("/:id", [useAuth], AppointmentController.getAppointmentById);
appointmentRouter.put("/", [useAuth], AppointmentController.updateAppointment);
appointmentRouter.delete("/", [useAuth], AppointmentController.deleteAppointment);

export default appointmentRouter;
