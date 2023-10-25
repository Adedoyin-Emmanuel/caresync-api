import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import Joi from "joi";
import * as _ from "lodash";
import { Review } from "../models";
import Hospital from "../models/hospital.model";
import { AuthRequest } from "../types/types";
import { response } from "./../utils";

class HospitalController {
  static async createHospital(req: Request, res: Response) {
    const validationSchema = Joi.object({
      clinicName: Joi.string().required().max(50),
      username: Joi.string().required().max(20),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6).max(30),
    });

    const { error, value } = validationSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    //check if email has been taken by another hospital
    const { email: emailTaken, username: usernameTaken } = value;
    const existingEmailUser = await Hospital.findOne({ email: emailTaken });
    if (existingEmailUser) return response(res, 400, "Email already taken");

    const existingUsernameUser = await Hospital.findOne({
      username: usernameTaken,
    });
    if (existingUsernameUser)
      return response(res, 400, "Username already taken");

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(value.password, salt);
    const { clinicName, username, email } = value;
    const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${
      username || clinicName
    }`;
    const valuesToStore = {
      clinicName,
      username,
      email,
      password,
      profilePicture,
    };

    const hospital = await Hospital.create(valuesToStore);
    const filteredHospital = _.pick(hospital, [
      "clinicName",
      "username",
      "email",
      "profilePicture",
      "createdAt",
      "updatedAt",
    ]);

    return response(
      res,
      201,
      "Hospital created successfully",
      filteredHospital
    );
  }

  static async getAllHospitals(req: Request, res: Response) {
    const allHospitals = await Hospital.find();

    return response(res, 200, "Hospitals fetched successfully", allHospitals);
  }

  static async searchHospital(req: Request, res: Response) {
    const requestSchema = Joi.object({
      searchTerm: Joi.string().required(),
    });
    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    const { searchTerm } = value;

    const hospitals = await Hospital.find({
      $or: [
        { clinicName: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
      ],
    });

    if (hospitals.length == 0)
      return response(res, 404, "No hospitals found", []);

    if (!hospitals) return response(res, 400, "Couldn't get hospitals");

    return response(res, 200, "Hospital fetched successfully", hospitals);
  }

  static async getMe(req: AuthRequest | any, res: Response) {
    console.log(req.hospital);
    const hospital = await Hospital.findById(req.hospital._id);
    if (!hospital)
      return response(res, 404, "Hospital with given id not found");
    return response(res, 200, "Hospital info fetched successfully", hospital);
  }

  static async getHospitalById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const hospital = await Hospital.findById(value.id);
    if (!hospital)
      return response(res, 404, "Hospital with given id not found");

    return response(res, 200, "Hospital fetched successfully", hospital);
  }

  static async getHospitalAverageRating(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const { id:hospitalId } = value;
    const reviews = await Review.find({ hospitalId });

    if (reviews.length == 0)
      return response(res, 404, "No reviews found for this hospital", []);
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const rating = totalRating / reviews.length;

    return response(
      res,
      200,
      "Average rating fetched successfully",
      rating
    );
  }

  static async updateHospital(req: Request, res: Response) {
    const requestSchema = Joi.object({
      clinicName: Joi.string().required().max(50),
      username: Joi.string().required().max(20),
      email: Joi.string().required().email(),
      location: Joi.string().required().max(50)
    });

    const { error: requestBodyError, value: requestBodyValue } =
      requestSchema.validate(req.body);
    if (requestBodyError)
      return response(res, 400, requestBodyError.details[0].message);

    const requestIdSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error: requestParamsError, value: requestParamsValue } =
      requestIdSchema.validate(req.params);
    if (requestParamsError)
      return response(res, 400, requestParamsError.details[0].message);

    //check if hospital with id exist
    const { id } = requestParamsValue;
    const existingUser = await Hospital.findById(id);
    if (!existingUser)
      return response(res, 404, "Hospital with given id not found");

    //check if email has been taken by another hospital
    const { username, email } = requestBodyValue;
    if (email && email !== existingUser.email) {
      const existingEmailUser = await Hospital.findOne({ email });
      if (existingEmailUser) return response(res, 400, "Email already taken");
    }

    // Check if username has been taken by another hospital
    if (username && username !== existingUser.username) {
      const existingUsernameUser = await Hospital.findOne({ username });
      if (existingUsernameUser) {
        return response(
          res,
          400,
          "Username has already been taken by another hospital"
        );
      }
    }

    const options = { new: true, runValidators: true };
    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      requestBodyValue,
      options
    );

    return response(res, 200, "Hospital updated successfully", updatedHospital);
  }

  static async deleteHospital(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 200, error.details[0].message);

    const deletedHospital = await Hospital.findByIdAndDelete(value.id);
    if (!deletedHospital)
      return response(res, 404, "Hospital with given id not found!");

    return response(res, 200, "Hospital deleted successfully");
  }
}

export default HospitalController;
