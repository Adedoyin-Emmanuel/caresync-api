import bcrypt from "bcryptjs";
import config from "config";
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
    if (userType !== "user" && userType !== "hospital")
      return response(res, 400, "Invalid user type");

    if (userType == "user") {
      const user: IUser | any = await User.findOne({ email }).select(
        "+password"
      );

      /*The email doesn't exist but we confuse the user to think it is an invalid, 
      just in case of an hacker trying to exploit 😂*/
      if (!user) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      await User.findOneAndUpdate({ email }, { token: refreshToken });

      //update the headers
      res.header("X-Auth-Access-Token", accessToken);
      res.header("X-Auth-Refresh-Token", refreshToken);

      // Set HTTP-only cookies for access token and refresh token
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.get("App.cookieAccessTokenExpiration"),
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.get("App.cookieRefreshTokenExpiration"),
        path: "/",
      });

      const filteredUser = _.pick(user, [
        "_id",
        "name",
        "email",
        "username",
        "profilePicture",
        "createdAt",
        "updatedAt",
      ]);

      return response(res, 200, "Login successful", filteredUser);
    } else {
      const hospital: IHospital | any = await Hospital.findOne({
        email,
      }).select("+password");

      if (!hospital) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, hospital.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = hospital.generateAccessToken();
      const refreshToken = hospital.generateRefreshToken();

      await Hospital.findOneAndUpdate({ email }, { token: refreshToken });
      res.header("X-Auth-Access-Token", accessToken);
      res.header("X-Auth-Refresh-Token", refreshToken);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.get("App.cookieAccessTokenExpiration"),
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.get("App.cookieRefreshTokenExpiration"),
        path: "/",
      });

      const filteredHospital = _.pick(hospital, [
        "_id",
        "clinicName",
        "username",
        "email",
        "profilePicture",
        "createdAt",
        "updatedAt",
      ]);

      return response(res, 200, "Login successful", filteredHospital);
    }
  }

  static async generateRefreshToken(req: Request, res: Response) {
    interface customJwtPayload {
      _id: string;
      username: string;
      name: string;
    }
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return response(res, 401, "Refresh token not found!");
    const privateKey: any = process.env.JWT_PRIVATE_KEY;

    const decoded: customJwtPayload | any = jwt.verify(
      refreshToken,
      privateKey
    );
    console.log(decoded);
    if (!decoded)
      return response(res, 401, "You're not authorized, Invalid token");

    const userRole = "user";
    const hospitalRole = "hospital";

    if (decoded.role === userRole) {
      //that's a user

      const user = await User.findById(decoded._id).select("+token");

      if (!user || !user.token)
        return response(res, 401, "You're not authorized, invalid token!");

      if (refreshToken === user.token) {
        const newAccessToken = user.generateAccessToken();

        res.header("X-Auth-Access-Token", newAccessToken);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: config.get("App.cookieAccessTokenExpiration"),
          path: "/",
        });
        return response(res, 200, "Access token generated successfully");
      } else {
        // the token is no longer valid, so the user has to login.
        this.logout(req, res);
      }
    } else if (decoded.role === hospitalRole) {
      //that's an hospital
      const hospital = await Hospital.findById(decoded._id).select("+token");

      if (!hospital || !hospital.token)
        return response(
          res,
          401,
          "You're not authorized, invalid token!"
        );

      if (refreshToken === hospital.token) {
        const newAccessToken = hospital.generateAccessToken();

        res.header("X-Auth-Access-Token", newAccessToken);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: config.get("App.cookieAccessTokenExpiration"),
          path: "/",
        });
        return response(res, 200, "Access token generated successfully");
      } else {
        //nobody
        return response(res, 403, "You can't perform this action, no role found");
      }
    }
  }


  //add the verify user functionality

  //add the verify hospital functionality
  

  static async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response(res, 200, "Logout successful!");
  }
}

export default AuthController;
