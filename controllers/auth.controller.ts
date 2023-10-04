import { Request, Response } from "express";
import Joi from "joi";
import * as bcrypt from "bcryptjs";
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
  }

 // private async generate
}
