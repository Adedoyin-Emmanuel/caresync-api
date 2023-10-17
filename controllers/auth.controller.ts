import bcrypt from "bcryptjs";
import config from "config";
import { Request, Response } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import Hospital, { IHospital } from "../models/hospital.model";
import User, { IUser } from "../models/user.model";
import { AuthRequest } from "../types/types";
import { response } from "./../utils";
import { sendEmail } from "./../utils";

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
        return response(res, 401, "You're not authorized, invalid token!");

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
        return response(
          res,
          403,
          "You can't perform this action, no role found"
        );
      }
    }
  }

  static async sendEmailToken(req: AuthRequest | any, res: Response) {
    const userType = req.userType;
    let defaultName = "Caresync";

    switch (userType) {
      case "user":
        defaultName = req.user.name;
        break;

      case "hospital":
        defaultName = req.hospital.clinicName;
        break;
    }

    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
    });

    const { error, value } = requestSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);
    const { email } = value;

    if (userType == "user") {
      const user = await User.findOne({ email }).select(
        "+verifyEmailToken +verifyEmailTokenExpire"
      );
      if (!user) return response(res, 404, "User with given email not found");
      const salt = await bcrypt.genSalt(10);
      console.log(user);
      const verifyEmailToken = await bcrypt.hash(user._id.toString(), salt);

      //update the verifyEmailToken
      user.verifyEmailToken = verifyEmailToken;
      user.verifyEmailTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const updatedUser = await user.save();

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #007bff;">Email Verification</h1>
      
                    <p style="color: #333;">Dear ${req.user.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=https://getcaresync.vercel.app/auth/verfiy?token=${verifyEmailToken} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
      
                    <span>Or copy this https://getcaresync.vercel.app/auth/verfiy?token=${verifyEmailToken} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>
      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(res, 200, "Email sent successfully", updatedUser);
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({ email }).select(
        "+verifyEmailToken +verifyEmailTokenExpire"
      );
      if (!hospital)
        return response(res, 404, "Hospital with given email not found");
      const salt = await bcrypt.genSalt(10);
      const verifyEmailToken = await bcrypt.hash(
        hospital._id.toString().toString(),
        salt
      );

      //update the verifyEmailToken
      hospital.verifyEmailToken = verifyEmailToken;
      hospital.verifyEmailTokenExpire = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
      const updatedHospital = await hospital.save();

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #007bff;">Email Verification</h1>
      
                    <p style="color: #333;">Dear ${req.hospital.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=https://getcaresync.vercel.app/auth/verfiy?token=${verifyEmailToken} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
      
                    <span>Or copy this https://getcaresync.vercel.app/auth/verfiy?token=${verifyEmailToken} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>
      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(res, 200, "Email sent successfully", updatedHospital);
    }
  }

  static async verifyEmailToken(req: AuthRequest | any, res: Response) {
    const requestSchema = Joi.object({
      token: Joi.string().required(),
    });

    const userType = req.userType;
    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    const { token } = value;

    const verifyEmailToken = token;
    if (userType == "user") {
      const user = await User.findOne({
        verifyEmailToken,
        verifyEmailTokenExpire: { $gt: Date.now() },
      }).select("+verifyEmailToken +verifyEmailTokenExpire");

      if (!user) return response(res, 400, "Invalid token");

      user.verifyEmailToken = undefined;
      user.verifyEmailTokenExpire = new Date(Date.now());
      user.isVerified = true;

      const updatedUser = await user.save();

      return response(
        res,
        200,
        "User Account verified successfully",
        updatedUser
      );
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({
        verifyEmailToken,
        verifyEmailTokenExpire: { $gt: Date.now() },
      }).select("+verifyEmailToken +verifyEmailTokenExpire");

      if (!hospital) return response(res, 400, "Invalid token");

      hospital.verifyEmailToken = undefined;
      hospital.verifyEmailTokenExpire = new Date(Date.now());
      hospital.isVerified = true;

      const updatedHospital = await hospital.save();

      return response(
        res,
        200,
        "Hospital Account verified successfully",
        updatedHospital
      );
    } else {
      return response(res, 404, "No valid user type, please login");
    }
  }

  static async forgotPassword(req: AuthRequest | any, res: Response) {
    const userType = req.userType;
    let defaultName = "Caresync";

    switch (userType) {
      case "user":
        defaultName = req.user.name;
        break;

      case "hospital":
        defaultName = req.hospital.clinicName;
        break;
    }

    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      appBaseUrl: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { email, appBaseUrl } = value;

    if (userType == "user") {
      const user = await User.findOne({ email }).select(
        "+resetPasswordToken +resetPasswordTokenExpires"
      );
      if (!user) {
        return response(res, 400, "Invalid or expired token!");
      }

      const salt = await bcrypt.genSalt(10);
      const resetToken = await bcrypt.hash(user._id.toString(), salt);
      // 1 hour
      const tokenExpireDate = new Date(Date.now() + 3600000);

      user.resetPasswordToken = resetToken;
      user.resetPasswordTokenExpires = tokenExpireDate;
      const updatedUser = await user.save();

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #007bff;">Email Verification</h1>
      
                    <p style="color: #333;">Dear ${req.user.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${appBaseUrl}?token=${resetToken} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
      
                    <span>Or copy this ${appBaseUrl}?token=${resetToken} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>

      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(
        res,
        200,
        "Password reset link sent to mail successfully",
        updatedUser
      );
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({ email }).select(
        "+resetPasswordToken +resetPasswordTokenExpires"
      );
      if (!hospital) {
        return response(res, 404, "Hospital not found!");
      }

      const salt = await bcrypt.genSalt(10);
      const resetToken = await bcrypt.hash(hospital._id.toString(), salt);
      // 1 day
      const tokenExpireDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      hospital.resetPasswordToken = resetToken;
      hospital.resetPasswordTokenExpires = tokenExpireDate;
      const updatedHospital = await hospital.save();

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #007bff;">Email Verification</h1>
      
                    <p style="color: #333;">Dear ${req.hospital.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${appBaseUrl}?token=${resetToken} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
      
                    <span>Or copy this ${appBaseUrl}?token=${resetToken} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>
      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(
        res,
        200,
        "Password reset link sent to mail successfully",
        updatedHospital
      );
    }
  }

  static async resetPassword(req: AuthRequest | any, res: Response) {
    const userType = req.userType;

    const requestSchema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().required().min(6).max(30),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);
    const { token, password } = value;
    const resetPasswordToken = token;
    if (userType == "user") {
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpires: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordTokenExpires");

      if (!user) return response(res, 400, "Invalid or expired token!");
      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;

      const updatedUser = await user.save();

      return response(res, 200, "Password reset successful", updatedUser);
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({
        resetPasswordToken,
        resetPasswordTokenExpires: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordTokenExpires");

      if (!hospital) return response(res, 400, "Invalid or expired token!");
      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      hospital.password = hashedPassword;
      hospital.resetPasswordToken = undefined;
      hospital.resetPasswordTokenExpires = undefined;

      const updatedHospital = await hospital.save();

      return response(res, 200, "Password reset successful", updatedHospital);
    } else {
      return response(res, 404, "No valid user type, please login");
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response(res, 200, "Logout successful!");
  }
}

export default AuthController;
