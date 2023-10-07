import express from "express";
import { HospitalController } from "../controllers";
import { useAuth, useCheckRole } from "../middlewares";
const hospitalRouter = express.Router();

hospitalRouter.post("/", [useAuth], HospitalController.createHospital);
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

export default hospitalRouter;
