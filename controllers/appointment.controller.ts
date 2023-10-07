import { Request, Response } from "express";
import Joi from "joi";
import { response } from "./../utils";
import Appointment from "../models/appointment.model";

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

    const appointment = await Appointment.create(value);

    return response(res, 201, "Appointment created successfully", appointment);
  }

  static async getAllAppointments(req: Request | any, res: Response) {
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

  static async updateAppointment(req: Request, res: Response) {
    const requestSchema = Joi.object({
      title: Joi.string().required().max(50),
      description: Joi.string().required().max(1000),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),
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
    const existingUser = await Appointment.findById(id);
    if (!existingUser)
      return response(res, 404, "Appointment with given id not found");

    const options = { new: true, runValidators: true };
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      requestBodyValue,
      options
    );

    return response(res, 200, "Appointment updated successfully", updatedAppointment);
  }

  static async deleteAppointment(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 200, error.details[0].message);

    const deletedAppointment = await Appointment.findByIdAndDelete(value.id);
    if (!deletedAppointment)
      return response(res, 404, "Appointment with given id not found!");

    return response(res, 200, "Hospital deleted successfully");
  }
}

export default AppointmentController;
