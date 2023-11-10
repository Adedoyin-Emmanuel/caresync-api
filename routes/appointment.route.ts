import express from "express";
import { AppointmentController } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";

const appointmentRouter = express.Router();
const rawWebhookMiddleware = express.raw({ type: "application/webhook+json" });

appointmentRouter.post(
  "/",
  [useAuth, useCheckRole("user")],
  AppointmentController.createAppointment
);
appointmentRouter.get("/", [useAuth], AppointmentController.getAllAppointments);
appointmentRouter.get(
  "/latest/:id",
  [useAuth],
  AppointmentController.getLatestAppointments
);
appointmentRouter.get(
  "/user/:id",
  AppointmentController.getAppointmentByUserId
);

//get the appointment token
appointmentRouter.get(
  "/generate-token",
  [useAuth],
  AppointmentController.generateAppointmentToken
);

appointmentRouter.get(
  "/hospital/:id",
  AppointmentController.getAppointmentByHospitalId
);
appointmentRouter.get(
  "/:id",
  [useAuth],
  AppointmentController.getAppointmentById
);

//only a user should be able to update an appointment
appointmentRouter.put(
  "/:id",
  [useAuth, useCheckRole("user")],
  AppointmentController.updateAppointment
);

//a user and an hospital should be able to cancel appointments
appointmentRouter.put(
  "/cancel/:id",
  [useAuth],
  AppointmentController.cancelAppointment
);

//only an hospital should be able to approve user appointments
appointmentRouter.put(
  "/approve/:id",
  [useAuth, useCheckRole("hospital")],
  AppointmentController.approveAppointment
);

//web hooks

appointmentRouter.post(
  "/webhook",
  [rawWebhookMiddleware],
  AppointmentController.getEvents
);

//a user and an hospital should be able to delete appointments
appointmentRouter.delete(
  "/:id",
  [useAuth],
  AppointmentController.deleteAppointment
);

export default appointmentRouter;
