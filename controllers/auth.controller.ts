import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import Hospital, { IHospital } from "../models/hospital.model";
import User, { IUser } from "../models/user.model";
import { response } from "./../utils";

class AuthController {
  static async login(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 200, error.details[0].message);

    const { email, password, userType } = value;
    if (userType !== "user" && userType !== "hospital") return response(res, 400, "Invalid user type");

    if (userType == "user") {
      const user: IUser | any = await User.findOne({ email }).select("+password");

      /*The email doesn't exist but we confuse the user to think it is an invalid, 
      just in case of an hacker trying to exploit 😂*/
      if (!user) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      await User.findOneAndUpdate({ email }, { token: refreshToken });
      res.header("x-auth-access-token", accessToken);
      res.header("x-auth-refresh-token", refreshToken);
      
      const filteredUser = _.omit(user, ["password"]);

      return response(res, 200, "Login successful", filteredUser);
    } else {
      const hospital: IHospital | any = await Hospital.findOne({ email }).select(
        "+password"
      );

      if (!hospital) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, hospital.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = hospital.generateAccessToken();
      const refreshToken = hospital.generateRefreshToken();


      await Hospital.findOneAndUpdate({ email }, { token: refreshToken });
      res.header("x-auth-access-token", accessToken);
      res.header("x-auth-refresh-token", refreshToken);
      
      const filteredHospital = _.omit(hospital, ["password"]);
      
      return response(res, 200, "Login successful", filteredHospital);
    }
  }

  static async generateRefreshToken(req: Request, res: Response) {
    interface customJwtPayload {
      _id: string;
      username: string;
      name: string;
    }
    const accessToken: any = req
      ?.header("Authorization")
      ?.replace("Bearer ", "");

    if (!accessToken) return response(res, 401, "Access token not found");
    const privateKey: any = process.env.JWT_PRIVATE_KEY;

    const decoded: customJwtPayload | any = jwt.verify(accessToken, privateKey);

    if (!decoded || !decoded._id)
      return response(res, 401, "Invalid access token");

    //find a user by decoded id
    const user = await User.findById(decoded._id);

    if (!user || !user.token)
      return response(res, 401, "You're not authorized!");

    //create a new access token
    const newAccessToken = user.generateAuthToken();
    res.header("x-auth-token", newAccessToken);

    return response(res, 200, "Access token generated successfully");
  }
}

export default AuthController;
