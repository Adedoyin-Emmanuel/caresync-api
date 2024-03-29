import express from "express";
import { useCheckRole, useAuth } from "../middlewares";
import { MedicalRecordController } from "../controllers";

const medicalRecordRouter = express.Router();

medicalRecordRouter.post("/", [useCheckRole("user"), useAuth], MedicalRecordController.createMedicalRecord);
medicalRecordRouter.get("/", [useAuth], MedicalRecordController.getAllMedicalRecords);
medicalRecordRouter.get("/:id", [useAuth], MedicalRecordController.getMedicalRecordById);
medicalRecordRouter.get("/me", [useAuth, useCheckRole("user")], MedicalRecordController.getCurrentUserMedicalRecords);

medicalRecordRouter.put("/:id", [useAuth, useCheckRole("user")], MedicalRecordController.updateMedicalRecord);

medicalRecordRouter.delete("/:id", [useAuth, useCheckRole("user")], MedicalRecordController.deleteMedicalRecord);

export default medicalRecordRouter;
