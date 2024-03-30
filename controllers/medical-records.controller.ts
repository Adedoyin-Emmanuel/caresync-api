import { Request, Response } from "express";
import Joi from "joi";
import { AuthRequest } from "../types/types";
import { response } from "./../utils";
import { Hospital, MedicalRecord, User } from "../models";
import { IUser } from "../models/user.model";

class MedicalRecordController {
  static async createMedicalRecord(req: Request, res: Response) {
    const requestSchema = Joi.object({
      userId: Joi.string().required(),
      symptoms: Joi.string().required().max(2500),
      diagnosis: Joi.string().max(25000).required(),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    const user = await User.findOne({ _id: value?.userId });

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
    const hospitalId = req.query?.hospitalId;
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);

    if (error) return response(res, 400, error.details[0].message);

    if (!hospitalId) return response(res, 400, "Hospital id is required");

    const medicalRecord = await MedicalRecord.findById(value?.id);

    if (!medicalRecord)
      return response(res, 404, "Medical record with given if not found");

    const user = await User.findById(medicalRecord?.userId);

    if (!user) return response(res, 404, "User with given id not found");

    const hasAccess = user.medicalRecordsAccess.some((access: any) => {
      //console.log(`access id is ${access?._id} hospital id is ${hospitalId}`);

      return access._id.toString() === hospitalId;
    });

    // check if the hospital has access to user medical record
    if (!hasAccess)
      return response(
        res,
        403,
        "Hospital doesn't have access to view user medical record"
      );

    return response(
      res,
      200,
      "Medical record retrived successfully",
      medicalRecord
    );
  }

  static async getAllMedicalRecords(req: Request, res: Response) {
    const userId = req.query.userId as string | undefined;
    const hospitalId = req.query.hospitalId as string | undefined;

    if (!userId) return response(res, 400, "User id is required");
    if (!hospitalId) return response(res, 400, "Hospital id is required");

    const user = await User.findById(userId);

    if (!user) return response(res, 404, "User with given id not found");

    const hasAccess = user.medicalRecordsAccess.some((access: any) => {
      //console.log(`access id is ${access?._id} hospital id is ${hospitalId}`);

      return access._id.toString() === hospitalId;
    });

    // check if an hopsital has access to view the user medical record

    console.log(hasAccess);
    if (!hasAccess)
      return response(
        res,
        403,
        "Hospital doesn't have access to view user medical records"
      );

    const queryConditions = userId ? { userId: userId } : {};
    const medicalRecords = await MedicalRecord.find(queryConditions)
      .sort({ createdAt: -1 })
      .exec();

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

    console.log(userId);

    const currentUserMedicalRecords = await MedicalRecord.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .exec();

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
      diagnosis: Joi.string().max(25000).required(),
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

  static async deleteMedicalRecordAccessByHospitalId(
    req: Request,
    res: Response
  ) {
    const requestSchema = Joi.object({
      hospitalId: Joi.string().required(),
      userId: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.query);

    if (error) return response(res, 400, error.details[0].message);

    const { hospitalId, userId } = value;
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital)
      return response(res, 404, "Hospital with given id not found");

    const user = await User.findById(userId);

    if (!user) return response(res, 404, "User with given id not found");

    await User.findByIdAndUpdate(userId, {
      $pull: { medicalRecordsAccess: hospitalId },
    });

    return response(
      res,
      200,
      `${hospital.clinicName} has been removed from your medical record access`
    );
  }
}

export default MedicalRecordController;
