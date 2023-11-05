import express from "express";
import { HospitalController } from "../controllers";
import { useAuth, useCheckRole, useCreateUserLimiter } from "../middlewares";
const hospitalRouter = express.Router();

hospitalRouter.post(
  "/",
  [useCreateUserLimiter],
  HospitalController.createHospital
);
hospitalRouter.get("/me", [useAuth], HospitalController.getMe);
hospitalRouter.get("/search", HospitalController.searchHospital);
hospitalRouter.get("/online", HospitalController.getOnlineHospitals);
hospitalRouter.get("/", [useAuth], HospitalController.getAllHospitals);
hospitalRouter.get("/:id", [useAuth], HospitalController.getHospitalById);
hospitalRouter.get("/rating/:id", HospitalController.getHospitalAverageRating);
hospitalRouter.put(
  "/:id",
  [useAuth, useCheckRole("hospital")],
  HospitalController.updateHospital
);
hospitalRouter.delete(
  "/:id",
  [useAuth, useCheckRole("hospital")],
  HospitalController.deleteHospital
);

export default hospitalRouter;
