import express from "express";
import { AppointmentController } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";

const appointmentRouter = express.Router();

appointmentRouter.post(
  "/",
  [useAuth, useCheckRole("user")],
  AppointmentController.createAppointment
);
appointmentRouter.get("/", [useAuth], AppointmentController.getAllAppointments);
appointmentRouter.get(
  "/user/:id",
  [useAuth, useCheckRole("user")],
  AppointmentController.getAppointmentByUserId
);

appointmentRouter.get(
  "/hospital/:id",
  [useAuth, useCheckRole("hospital")],
  AppointmentController.getAppointmentByHospitalId
);
appointmentRouter.get(
  "/:id",
  [useAuth],
  AppointmentController.getAppointmentById
);
appointmentRouter.put(
  "/:id",
  [useAuth],
  AppointmentController.updateAppointment
);
appointmentRouter.delete(
  "/:id",
  [useAuth],
  AppointmentController.deleteAppointment
);

export default appointmentRouter;
