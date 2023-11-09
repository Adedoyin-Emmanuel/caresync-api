import Joi from "joi";
import { Request, Response } from "express";
import { response } from "./../utils";
import { AuthRequest } from "../types/types";

class RoomController {
  static async getRoomToken(req: AuthRequest | any, res: Response) {
    const requestSchema = Joi.object({
      userId: Joi.string().required(),
      hospitalId: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    const { userId, hospitalId } = value;

    const roomId = `${userId}_${hospitalId}`;

    //check if user or hospital is authorized

    if (
      userId === req?.user?._id.toString() ||
      hospitalId === req?.hospital?._id.toString()
    ) {
      return response(res, 200, "Room token generated successfully", {
        roomId,
      });
    } else {
    }
    return response(res, 401, "You're not authorized!");
  }
}

export default RoomController;
