import express from "express";
import { HospitalController } from "../controllers";

const hospitalRouter = express.Router();

hospitalRouter.post("/", HospitalController.createHospital);
hospitalRouter.get("/", HospitalController.getAllHospitals);
hospitalRouter.get("/:id", HospitalController.getHospitalById);
hospitalRouter.put("/", HospitalController.updateHospital);
hospitalRouter.delete("/", HospitalController.deleteHospital);


export default hospitalRouter;
