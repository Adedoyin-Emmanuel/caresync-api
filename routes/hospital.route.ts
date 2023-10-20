import express from "express";
import { HospitalController } from "../controllers";
import { useAuth, useCheckRole } from "../middlewares";
import { useCreateUserLimiter } from "../middlewares";
const hospitalRouter = express.Router();

hospitalRouter.post(
  "/",
  [useCreateUserLimiter],
  HospitalController.createHospital
);
hospitalRouter.get("/", [useAuth], HospitalController.getAllHospitals);
hospitalRouter.get("/:id", [useAuth], HospitalController.getHospitalById);
hospitalRouter.put(
  "/",
  [useAuth, useCheckRole("hospital")],
  HospitalController.updateHospital
);
hospitalRouter.delete(
  "/:id",
  [useAuth, useCheckRole("hospital")],
  HospitalController.deleteHospital
);

hospitalRouter.get("/me", [useAuth, useCheckRole("hospital")], HospitalController.getMe);

export default hospitalRouter;
