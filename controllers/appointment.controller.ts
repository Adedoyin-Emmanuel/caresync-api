import { Request, Response } from "express";
import Joi from "joi";
import { AccessToken, WebhookReceiver } from "livekit-server-sdk";
import { Hospital, User } from "../models";
import Appointment from "../models/appointment.model";
import { io } from "../sockets/socket.server";
import { AuthRequest } from "../types/types";
import {
  formatDateTime,
  parseHospitalEmailData,
  parseUserEmailData,
  sendEmail,
  toJavaScriptDate,
} from "../utils";
import { response } from "./../utils";

class AppointmentController {
  static async createAppointment(req: Request, res: Response) {
    const validationSchema = Joi.object({
      title: Joi.string().required().max(50),
      description: Joi.string().required().max(1000),
      hospitalId: Joi.string().required(),
      userId: Joi.string().required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),

      medicalRecordAccess: Joi.boolean().default(false),
    });

    const { error, value } = validationSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    try {
      // Check if the user and hospital exist in the database
      const user = await User.findById(value.userId);
      const hospital = await Hospital.findById(value.hospitalId);

      if (!user) {
        return response(res, 400, "User not found");
      }

      if (!hospital) {
        return response(res, 400, "Hospital not found");
      }

      // Check for conflicts with existing appointments for the same hospital and time range
      const existingAppointment = await Appointment.findOne({
        hospitalId: value.hospitalId,
        startDate: { $lt: value.endDate },
        endDate: { $gt: value.startDate },
      });

      console.log(existingAppointment);

      if (existingAppointment) {
        return response(
          res,
          409,
          "Appointment time range conflicts with an existing appointment."
        );
      }

      const { medicalRecordAccess, ...modifiedData } = value;
      const appointment: any = await Appointment.create(modifiedData);

      // Update User's Appointments
      if (medicalRecordAccess) {
        const hospitalExists = user.medicalRecordsAccess.includes(
          value.hospitalId
        );

        // If the hospitalId is not already in the array, add it
        if (!hospitalExists) {
          await User.findByIdAndUpdate(
            value.userId,
            {
              $push: {
                appointments: appointment._id,
                medicalRecordsAccess: value.hospitalId,
              },
            },
            { new: true }
          );
        } else {
          // If the hospitalId is already in the array, do nothing
          console.log("Hospital already has access to user's medical records");
        }
      }

      // Update Hospital's Appointments
      await Hospital.findByIdAndUpdate(
        value.hospitalId,
        { $push: { appointments: appointment._id } },
        { new: true }
      );

      //emit a newAppointment event
      io.emit("newAppointment", appointment);
      return response(
        res,
        201,
        "Appointment created successfully",
        appointment
      );
    } catch (error) {
      console.error(error);
      return response(
        res,
        500,
        `An error occurred while creating the appointment ${error}`
      );
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

    const appointment = await Appointment.findById(value.id).sort({
      updatedAt: -1,
    });

    if (!appointment)
      return response(res, 404, "Appointment with given id not found");

    return response(res, 200, "Appointment fetched successfully", appointment);
  }

  static async getAppointmentByUserId(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const { id } = value;
    const appointments = await Appointment.find({ userId: id })
      .sort({ createdAt: -1 })
      .exec();
    if (!appointments) return response(res, 404, "No appointments found");
    return response(
      res,
      200,
      "Appointments fetched successfully",
      appointments
    );
  }

  static async getAppointmentByHospitalId(
    req: AuthRequest | any,
    res: Response
  ) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const { id: hospitalId } = value;
    const appointments = await Appointment.find({ hospitalId })
      .sort({ createdAt: -1 })
      .exec();
    if (!appointments) return response(res, 404, "No appointments found");
    return response(
      res,
      200,
      "Appointments fetched successfully",
      appointments
    );
  }

  static async getLatestAppointments(req: Request, res: Response) {
    const requestSchema2 = Joi.object({
      id: Joi.string().required(),
    });

    const { error: error2, value: value2 } = requestSchema2.validate(
      req.params
    );
    if (error2) return response(res, 400, error2.details[0].message);

    const requestSchema = Joi.object({
      limit: Joi.number().min(1),
      userType: Joi.string().valid("user", "hospital").required(),
    });

    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    // Get the appointments
    const { limit, userType } = value;
    const { id } = value2;

    const filter = userType === "user" ? { userId: id } : { hospitalId: id };

    const latestAppointments = await Appointment.find(filter)
      .sort({ startDate: -1, updatedAt: -1 })
      .limit(limit);

    if (!latestAppointments.length) {
      return response(res, 200, "No latest appointments found!", []);
    }

    return response(
      res,
      200,
      "Latest appointments fetched successfully",
      latestAppointments
    );
  }

  static async generateAppointmentToken(req: Request, res: Response) {
    const requestSchema = Joi.object({
      participantName: Joi.string().required(),
      roomName: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.query);

    if (error) return response(res, 400, error.details[0].message);

    const { participantName, roomName } = value;
    const API_KEY = process.env.LK_API_KEY;
    const SECRET_KEY = process.env.LK_API_SECRET;

    const at = new AccessToken(API_KEY, SECRET_KEY, {
      identity: participantName,
    });

    at.addGrant({ roomJoin: true, room: roomName });

    return response(
      res,
      200,
      "Appointment token generated successfully",
      at.toJwt()
    );
  }

  static async updateAppointment(req: Request, res: Response) {
    const requestSchema = Joi.object({
      title: Joi.string().max(50),
      description: Joi.string().max(1000),
      status: Joi.string().required(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
      medicalRecordAccess: Joi.boolean().default(false),
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

    // Check if appointment with the given id exists
    const { id } = requestParamsValue;
    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment)
      return response(res, 404, "Appointment with given id not found");

    //check the status of the appointment
    if (existingAppointment.status === "failed") {
      return response(
        res,
        400,
        "You cannot update an appointment that has already been cancelled!"
      );
    }
    // Check for conflicts with existing appointments for the same hospital and time range
    if (
      requestBodyValue.startDate &&
      requestBodyValue.endDate &&
      requestBodyValue.startDate > requestBodyValue.endDate
    ) {
      return response(
        res,
        400,
        "End date cannot be earlier than the start date"
      );
    }

    const options = { new: true, runValidators: true };
    const { medicalRecordAccess, ...modifiedData } = requestBodyValue;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      modifiedData,
      options
    );

    const user = await User.findById(updatedAppointment?.userId);

    console.log(medicalRecordAccess);
    // Update User's Appointments
    if (medicalRecordAccess) {
      const hospitalExists = user?.medicalRecordsAccess.includes(
        updatedAppointment?.hospitalId as any
      );

      // If the hospitalId is not already in the array, add it
      if (!hospitalExists) {
        await User.findByIdAndUpdate(
          updatedAppointment?.userId,
          {
            $push: {
              medicalRecordsAccess: updatedAppointment?.hospitalId,
            },
          },
          { new: true }
        );
      } else {
        // If the hospitalId is already in the array, do nothing
        console.log("Hospital already has access to user's medical records");
      }
    }

    //emit an updateAppointment event
    io.emit("updateAppointment", updatedAppointment);

    return response(
      res,
      200,
      "Appointment updated successfully",
      updatedAppointment
    );
  }

  static async cancelAppointment(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const appointment = await Appointment.findById(value.id);
    if (!appointment)
      return response(res, 404, "Appointment with given id not found!");

    if (appointment.status === "failed")
      return response(res, 400, "Appointment is already cancelled!");
    if (appointment.status === "success")
      return response(
        res,
        400,
        "Cannot cancel an already approved appointment."
      );
    appointment.status = "failed";

    const cancelledAppointment = await appointment.save();

    //emit an event to cancel the appointment
    io.emit("cancelAppointment", cancelledAppointment);
    return response(
      res,
      200,
      "Appointment cancelled successfully",
      cancelledAppointment
    );
  }

  static async approveAppointment(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    //check if the appointment exists
    const appointment = await Appointment.findById(value.id);
    if (!appointment)
      return response(res, 404, "Appointment with given id not found!");

    if (appointment.status === "failed")
      return response(res, 400, "Appointment is already cancelled");
    const currentTime = new Date();
    const appointmentStartDate = toJavaScriptDate(appointment.startDate);

    //if appointment start date and time has passed,
    if (appointmentStartDate < currentTime) {
      return response(res, 400, "Appointment has expired!");
    }

    const hospital = await Hospital.findById(appointment.hospitalId);
    const user = await User.findById(appointment.userId);

    //check if the user and the hospital exists
    if (user && hospital) {
      const userEmail = user.email;
      const hospitalEmail = hospital.email;
      const startFormattedTime = formatDateTime(appointment.startDate);
      const endFormattedTime = formatDateTime(appointment.endDate);

      const meetingLink =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/user/appointments/${appointment._id}/start`
          : `https://getcaresync.vercel.app/user/appointments/${appointment._id}/start`;

      const rescheduleLink =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/user/appointments/${appointment._id}`
          : `https://getcaresync.vercel.app/user/appointments/${appointment._id}`;

      const hospitalMeetingLink =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/hospital/appointments/${appointment._id}/start`
          : `https://getcaresync.vercel.app/hospital/appointments/${appointment._id}/start`;

      const hospitalRescheduleLink =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/hospital/appointments/${appointment._id}`
          : `https://getcaresync.vercel.app/hospital/appointments/${appointment._id}`;

      const userEmailContent = parseUserEmailData(
        user.name,
        hospital.clinicName,
        appointment.title,
        appointment.description,
        startFormattedTime,
        endFormattedTime,
        meetingLink,
        rescheduleLink
      );

      const hospitalEmailContent = parseHospitalEmailData(
        user.name,
        hospital.clinicName,
        appointment.title,
        appointment.description,
        startFormattedTime,
        endFormattedTime,
        hospitalMeetingLink,
        hospitalRescheduleLink
      );

      const hospitalMailResponse = await sendEmail(
        "Appointment Approved",
        hospitalEmailContent,
        hospitalEmail
      );

      const userMailResponse = await sendEmail(
        "Appointment Approved",
        userEmailContent,
        userEmail
      );

      if (!hospitalMailResponse || !userMailResponse) {
        // a very bad error occured probably SMTP issues
        appointment.status = "failed";
        await appointment.save();
        return response(res, 400, "An error occured while sending email");
      } else {
        //everything is fine
        appointment.status = "success";
        const approvedAppointment = await appointment.save();

        io.emit("approveAppointment", approvedAppointment);
        return response(
          res,
          200,
          "Appointment approved successfully",
          approvedAppointment
        );
      }
    } else {
      appointment.status = "failed";
      await appointment.save();
      return response(
        res,
        404,
        "Appointment failed, user or hospital not found!"
      );
    }
  }

  static async getEvents(req: Request, res: Response) {
    const API_KEY = process.env.LK_API_KEY;
    const SECRET_KEY = process.env.LK_API_SECRET;
    const receiver = new WebhookReceiver(API_KEY!, SECRET_KEY!);

    const event = receiver.receive(req.body, req.get("Authorization"));
    console.log(event);

    return response(
      res,
      200,
      "Appointment web hook received successfully",
      event
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
      //emit a delete event
      io.emit("deleteAppointment", deletedAppointment);
      return response(res, 200, "Appointment deleted successfully");
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
