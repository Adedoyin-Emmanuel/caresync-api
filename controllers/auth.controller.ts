import bcrypt from "bcryptjs";
import config from "config";
import { Request, Response } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { response } from "./../utils";

class AuthController {
  static async login(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 200, error.details[0].message);

    const { email, password } = value;

    //find a user with the email
    const user = await User.findOne({ email });

    /*The email doesn't exist but we confuse the user to think it is an invalid, 
    just in case of an hacker trying to exploit 😂*/
    if (!user) return response(res, 400, "Invalid credentials");

    //check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return response(res, 400, "Invalid credentials");

    //generate access token
    const token = user.generateAuthToken();
    res.header("x-auth-token", token);

    return response(res, 200, "Login successful");
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

    const decoded: customJwtPayload | any = jwt.verify(
      accessToken,
      config.get("jwtPrivateKey")
    );

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
