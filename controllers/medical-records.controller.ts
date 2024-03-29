import { Request, Response } from "express";
import Joi from "joi";
import { AuthRequest } from "../types/types";
import { response } from "./../utils";
import { MedicalRecord, User } from "../models";

class MedicalRecordController {
  static async createMedicalRecord(req: Request, res: Response) {
    const requestSchema = Joi.object({
      userId: Joi.string().required(),
      symptoms: Joi.string().required().max(2500),
      diagonsis: Joi.string().max(25000).required(),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    const user = await User.findOne(value?.userId);

    if (!user) return response(res, 404, "User with given id does not exist");

    const medicalRecord = await MedicalRecord.create(value);

    await User.findByIdAndUpdate(
      value.userId,
      { $push: { medicalRecords: medicalRecord.id } },
      { new: true }
    );

    return response(
      res,
      201,
      "Medical record created successfully",
      medicalRecord
    );
  }

  static async getMedicalRecordById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);

    if (error) return response(res, 400, error.details[0].message);

    const medicalRecord = await MedicalRecord.findById(value?.id);

    if (!medicalRecord)
      return response(res, 404, "Medical record with given if not found");

    return response(
      res,
      200,
      "Medical record retrived successfully",
      medicalRecord
    );
  }

  static async getAllMedicalRecords(req: Request, res: Response) {
    const medicalRecords = await MedicalRecord.find();

    if (medicalRecords.length == 0)
      return response(res, 200, "Medical records retrived successfully", []);

    return response(
      res,
      200,
      "Medical records retrived successfully",
      medicalRecords
    );
  }

  static async getCurrentUserMedicalRecords(
    req: AuthRequest | any,
    res: Response
  ) {
    const userId = req.user._id;

    const currentUserMedicalRecords = await MedicalRecord.find({ userId });

    if (!userId) return response(res, 404, "User with given id not found");

    if (!currentUserMedicalRecords)
      return response(res, 404, "No medical records found", []);

    return response(
      res,
      200,
      "Medical Response retrived successfully",
      currentUserMedicalRecords
    );
  }

  static async updateMedicalRecord(req: AuthRequest | any, res: Response) {
    const requestSchema = Joi.object({
      symptoms: Joi.string().required().max(2500),
      diagonsis: Joi.string().max(25000).required(),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);
    const id = req.params.id;

    if (!id) return response(res, 400, "Id is required");

    const updatedMedicalRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      value
    );

    return response(
      res,
      200,
      "Medical record updated successfully",
      updatedMedicalRecord
    );
  }

  static async deleteMedicalRecord(req: AuthRequest | any, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);

    if (error) return response(res, 400, error.details[0].message);

    const deletedMedicalRecord = await MedicalRecord.findByIdAndDelete(
      value?.id
    );

    if (!deletedMedicalRecord)
      return response(res, 404, "Medical record with given id not found");

    const userId = deletedMedicalRecord?.userId;

    await User.findByIdAndUpdate(userId, {
      $pull: { medicalRecords: value?.id },
    });

    return response(
      res,
      200,
      "Medical record deleted successfully",
      deletedMedicalRecord
    );
  }
}

export default MedicalRecordController;
