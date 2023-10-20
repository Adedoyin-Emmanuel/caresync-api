import { Request, Response } from "express";
import Joi from "joi";
import { Hospital, User } from "../models";
import Appointment from "../models/appointment.model";
import { response } from "./../utils";
import { AuthRequest } from "../types/types";


class AppointmentController {

static async createAppointment(req: Request, res: Response) {
  const validationSchema = Joi.object({
    title: Joi.string().required().max(50),
    description: Joi.string().required().max(1000),
    hospitalId: Joi.string().required(),
    userId: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  });

  const { error, value } = validationSchema.validate(req.body);
  if (error) return response(res, 400, error.details[0].message);

  try {
    // Check if the user and hospital exist in the database
    const user = await User.findById(value.userId);
    const hospital = await Hospital.findById(value.hospitalId);

    if (!user) {
      return response(res, 400, 'User not found');
    }

    if (!hospital) {
      return response(res, 400, 'Hospital not found');
    }

    const appointment: any = await Appointment.create(value);

    // Update User's Appointments
    await User.findByIdAndUpdate(
      value.userId,
      { $push: { appointments: appointment._id } },
      { new: true }
    );

    // Update Hospital's Appointments
    await Hospital.findByIdAndUpdate(
      value.hospitalId,
      { $push: { appointments: appointment._id } },
      { new: true }
    );

    return response(res, 201, 'Appointment created successfully', appointment);
  } catch (error) {
    console.error(error);
    return response(res, 500, `An error occurred while creating the appointment ${error}`);
  }
}

  static async getAllAppointments(req: Request, res: Response) {
    const allAppointments = await Appointment.find();

    return response(
      res,
      200,
      "Appointments fetched successfully",
      allAppointments
    );
  }

  static async getAppointmentById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const appointment = await Appointment.findById(value.id);
    if (!appointment)
      return response(res, 404, "Appointment with given id not found");

    return response(res, 200, "Appointment fetched successfully", appointment);
  }

  static async getAppointmentByUserId(req: AuthRequest | any, res: Response) {
    const userId = req.user_id;
    const appointments = await Appointment.find({ userId });
    if (!appointments) return response(res, 404, "No appointments found");
    return response(
      res,
      200,
      "Appointments fetched successfully",
      appointments
    );
  }

  static async getAppointmentByHospitalId(req: AuthRequest | any, res: Response) {
    const hospitalId = req.hospital._id;
    const appointments = await Appointment.find({ hospitalId });
    if (!appointments) return response(res, 404, "No appointments found");
    return response(
      res,
      200,
      "Appointments fetched successfully",
      appointments
    );
  }

  static async updateAppointment(req: Request, res: Response) {
    const requestSchema = Joi.object({
      title: Joi.string().max(50),
      description: Joi.string().max(1000),
      status: Joi.string().required(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
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
    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment)
      return response(res, 404, "Appointment with given id not found");

    const options = { new: true, runValidators: true };
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      requestBodyValue,
      options
    );

    return response(
      res,
      200,
      "Appointment updated successfully",
      updatedAppointment
    );
  }

  static async deleteAppointment(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 200, error.details[0].message);

    //delete the appointment from the user and hospital document
    const deletedAppointment = await Appointment.findByIdAndDelete(value.id);
    if (!deletedAppointment)
      return response(res, 404, "Appointment with given id not found!");
    try {
      await User.findByIdAndUpdate(deletedAppointment.userId, {
        $pull: { appointments: deletedAppointment._id },
      });

      await Hospital.findByIdAndUpdate(deletedAppointment.hospitalId, {
        $pull: { appointments: deletedAppointment._id },
      });

      return response(res, 200, "Hospital deleted successfully");
    } catch (error) {
      return response(
        res,
        400,
        "An error occured while deleting the appointment!"
      );
    }
  }
}

export default AppointmentController;
