import express from "express";
import { useCheckRole, useAuth } from "../middlewares";
import { MedicalRecordController } from "../controllers";

const medicalRecordRouter = express.Router();

medicalRecordRouter.post(
  "/",
  [useAuth, useCheckRole("user")],
  MedicalRecordController.createMedicalRecord
);
medicalRecordRouter.get(
  "/",
  [useAuth],
  MedicalRecordController.getAllMedicalRecords
);

medicalRecordRouter.get(
  "/me",
  [useAuth],
  MedicalRecordController.getCurrentUserMedicalRecords
);

medicalRecordRouter.get(
  "/:id",
  [useAuth],
  MedicalRecordController.getMedicalRecordById
);

medicalRecordRouter.put(
  "/:id",
  [useAuth, useCheckRole("user")],
  MedicalRecordController.updateMedicalRecord
);

medicalRecordRouter.delete(
  "/hospital-access",
  MedicalRecordController.deleteMedicalRecordAccessByHospitalId
);

medicalRecordRouter.delete(
  "/:id",
  [useAuth, useCheckRole("user")],
  MedicalRecordController.deleteMedicalRecord
);

export default medicalRecordRouter;
