import bcrypt from "bcryptjs";
import config from "config";
import { Request, Response } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import Hospital, { IHospital } from "../models/hospital.model";
import User, { IUser } from "../models/user.model";
import { AuthRequest } from "../types/types";
import { generateLongToken, response, sendEmail } from "./../utils";
import { io } from "../sockets/socket.server";
import HospitalController from "./hospital.controller";
import UserController from "./user.controller";

class AuthController {
  static async login(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { email, password, userType } = value;
    if (userType !== "user" && userType !== "hospital")
      return response(res, 400, "Invalid user type");

    if (userType == "user") {
      let user: IUser | any = await User.findOne({ email }).select(
        "+password"
      );

      /*The email doesn't exist but we confuse the user to think it is an invalid, 
      just in case of an hacker trying to exploit 😂*/
      if (!user) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      const options = { new: true, runValidators: true };

      user = await User.findOneAndUpdate({ email }, { token: refreshToken, online: true }, options);
      await user.save();
      

      //update the headers
      res.header("X-Auth-Access-Token", accessToken);
      res.header("X-Auth-Refresh-Token", refreshToken);

      // Set HTTP-only cookies for access token and refresh token
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.get("App.cookieAccessTokenExpiration"),
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
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
        "online"
      ]);

      const dataToClient = { accessToken, ...filteredUser };


      //actually we want to emit all online hospitals
      const onlineUsers = await UserController.returnOnlineUsers(req, res);
      io.emit("userLogin", filteredUser);

      if(onlineUsers.length === 0){

        io.emit("onlineUsers", []);
      }
      io.emit("onlineUsers", onlineUsers);

      

      return response(res, 200, "Login successful", dataToClient);
    } else {
      let hospital: IHospital | any = await Hospital.findOne({
        email,
      }).select("+password");

      if (!hospital) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, hospital.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = hospital.generateAccessToken();
      const refreshToken = hospital.generateRefreshToken();
      const options = { new: true, runValidators: true };


      hospital = await Hospital.findOneAndUpdate({ email }, { token: refreshToken, online: true}, options);

      await hospital.save();


      res.header("X-Auth-Access-Token", accessToken);
      res.header("X-Auth-Refresh-Token", refreshToken);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.get("App.cookieAccessTokenExpiration"),
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
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
        "online"
      ]);

      const dataToClient = { accessToken, ...filteredHospital };


      //actually we want to emit all online hospitals
      const onlineHospitals = await HospitalController.returnOnlineHospitals(req, res);
      io.emit("userLogin", filteredHospital);

      if(onlineHospitals.length === 0){
      io.emit("onlineHospitals", []);

      }

      io.emit("onlineHospitals", onlineHospitals);
      return response(res, 200, "Login successful", dataToClient);
    }
  }

  static async generateRefreshToken(req: Request, res: Response) {
    interface customJwtPayload {
      _id: string;
      username: string;
      name: string;
    }
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return AuthController.logout(req, res);
    const privateKey: any = process.env.JWT_PRIVATE_KEY;

    const decoded: customJwtPayload | any = jwt.verify(
      refreshToken,
      privateKey
    );
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
          sameSite: "none",
          maxAge: config.get("App.cookieAccessTokenExpiration"),
          path: "/",
        });
        return response(
          res,
          200,
          "Access token generated successfully",
          newAccessToken
        );
      } else {
        // the token is no longer valid, so the user has to login.
        AuthController.logout(req, res);
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
          sameSite: "none",
          maxAge: config.get("App.cookieAccessTokenExpiration"),
          path: "/",
        });
        return response(
          res,
          200,
          "Access token generated successfully",
          newAccessToken
        );
      } else {
        //nobody
        AuthController.logout(req, res);

        // return response(
        //   res,
        //   403,
        //   "You can't perform this action, no role found"
        // );
      }
    }
  }

  static async sendEmailToken(req: any, res: Response) {
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

    const { error, value } = requestSchema.validate(req.query);

    if (error) return response(res, 400, error.details[0].message);
    const { email } = value;

    if (userType == "user") {
      const user = await User.findOne({ email }).select(
        "+verifyEmailToken +verifyEmailTokenExpire"
      );
      if (!user) return response(res, 404, "User with given email not found");
      const verifyEmailToken = generateLongToken();

      //update the verifyEmailToken
      user.verifyEmailToken = verifyEmailToken;
      user.verifyEmailTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      const serverURL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:2800"
          : req.hostname;

      const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1; font-weight:bold;">Caresync</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${req.user.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync</p>
      
                </div>
      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(res, 200, "Verification mail sent successfully");
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({ email }).select(
        "+verifyEmailToken +verifyEmailTokenExpire"
      );
      if (!hospital)
        return response(res, 404, "Hospital with given email not found");

      const verifyEmailToken = generateLongToken();

      //update the verifyEmailToken
      hospital.verifyEmailToken = verifyEmailToken;
      hospital.verifyEmailTokenExpire = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
      await hospital.save();
      const serverURL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:2800"
          : req.hostname;
      const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;
      console.log(req.hospital);
      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1; font-weight:bold;">Caresync</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${hospital.clinicName},</p>
      
                    <p style="color: #333;">Thank you for creating an hospital account with Caresync. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync</p>
      
                </div>
      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(res, 200, "Verification mail sent successfully");
    }
  }

  static async verifyEmailToken(req: AuthRequest | any, res: Response) {
    const requestSchema = Joi.object({
      token: Joi.string().required(),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);
    const redirectURL =
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/auth/verified`
        : `https://getcaresync.vercel.app/auth/verified`;

    const { token, userType } = value;

    const verifyEmailToken = token;
    if (userType == "user") {
      const user = await User.findOne({
        verifyEmailToken,
        verifyEmailTokenExpire: { $gt: Date.now() },
      });

      if (!user) {
        console.log(user);
        return res
          .status(400)
          .redirect(
            redirectURL +
              "?success=false&message=Invalid or expired token!&userType=user"
          );
      }

      user.verifyEmailToken = undefined;
      user.verifyEmailTokenExpire = undefined;
      user.isVerified = true;

      await user.save();

      return res
        .status(200)
        .redirect(
          redirectURL +
            "?success=true&message=User email verified successfully&userType=user"
        );
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({
        verifyEmailToken,
        verifyEmailTokenExpire: { $gt: Date.now() },
      });

      if (!hospital) {
        return res
          .status(400)
          .redirect(
            redirectURL +
              "?success=false&message=Invalid or expired token!&userType=hospital"
          );
      }

      hospital.verifyEmailToken = undefined;
      hospital.verifyEmailTokenExpire = undefined;
      hospital.isVerified = true;

      await hospital.save();

      return res
        .status(200)
        .redirect(
          redirectURL +
            "?success=true&message=Hospital email verified successfully&userType=hospital"
        );
    } else {
      return res
        .status(400)
        .redirect(
          redirectURL +
            "?success=false&message=No valid user type, please login!"
        );
    }
  }

  static async forgotPassword(req: AuthRequest | any, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { email, userType: clientUserType } = value;

    const userType = clientUserType;

    if (userType == "user") {
      const user = await User.findOne({ email }).select(
        "+resetPasswordToken +resetPasswordTokenExpire"
      );
      if (!user) {
        return response(res, 400, "Invalid or expired token!");
      }

      const resetToken = generateLongToken();
      // 1 hour
      const tokenExpireDate = new Date(Date.now() + 3600000);

      user.resetPasswordToken = resetToken;
      user.resetPasswordTokenExpire = tokenExpireDate;

      await user.save();
      const clientDomain =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/auth/reset-password?token=${resetToken}&userType=${userType}`
          : `https://getcaresync.vercel.app/auth/reset-password?token=${resetToken}&userType=${userType}`;

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1;">Change Password</h1>
      
                    <p style="color: #333;">Dear ${user.name},</p>
      
                    <p style="color: #333;">We received a request to reset your password for your caresync account. To proceed with resetting your password, please click the button below. 
                    Please note that this link is temporary and will expire in an hour, so make sure to reset your password as soon as possible.
                    </p>
      
                    <a href=${clientDomain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Change my password</a>
                    <br/>
                    <span>Or copy this link ${clientDomain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't initiate a password reset, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>
          `;

      const result = await sendEmail("Change Password", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(
        res,
        200,
        "Password reset link sent to mail successfully"
      );
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({ email }).select(
        "+resetPasswordToken +resetPasswordTokenExpire"
      );
      if (!hospital) {
        return response(res, 404, "Hospital not found!");
      }

      const resetToken = generateLongToken();
      // 1 hour
      const tokenExpireDate = new Date(Date.now() + 3600000);

      hospital.resetPasswordToken = resetToken;
      hospital.resetPasswordTokenExpire = tokenExpireDate;
      await hospital.save();
      const clientDomain =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/auth/reset-password?token=${resetToken}&userType=${userType}`
          : `https://getcaresync.vercel.app/auth/reset-password?token=${resetToken}&userType=${userType}`;

      const data = `
                  <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1;">Change Password</h1>
      
                    <p style="color: #333;">Dear ${hospital.clinicName},</p>
      
                    <p style="color: #333;">We received a request to reset your password for your caresync hospital account. To proceed with resetting your password, please click the button below. 
                    Please note that this link is temporary and will expire in an hour, so make sure to reset your password as soon as possible.
                    </p>
      
                    <a href=${clientDomain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Change my password</a>
                    <br/>
                    <span>Or copy this link ${clientDomain} and paste it to your browser </span>
      
                    <p style="color: #333;">If your hospital didn't initiate a password reset, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Caresync.</p>
      
                </div>

          `;

      const result = await sendEmail("Change Password", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(
        res,
        200,
        "Password reset link sent to mail successfully"
      );
    } else {
      return response(
        res,
        400,
        "Invalid user type, valid userTypes include a user or an hospital!"
      );
    }
  }

  static async resetPassword(req: AuthRequest | any, res: Response) {
    const requestSchema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().required().min(6).max(30),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);
    const { token, password, userType: clientUserType } = value;
    const resetPasswordToken = token;
    const userType = clientUserType;

    if (userType == "user") {
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordTokenExpire");

      if (!user) return response(res, 400, "Invalid or expired token!");
      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpire = undefined;

      await user.save();

      return response(res, 200, "Password reset successful");
    } else if (userType == "hospital") {
      const hospital = await Hospital.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordTokenExpire");

      if (!hospital) return response(res, 400, "Invalid or expired token!");
      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      hospital.password = hashedPassword;
      hospital.resetPasswordToken = undefined;
      hospital.resetPasswordTokenExpire = undefined;

      await hospital.save();

      return response(res, 200, "Password reset successful");
    } else {
      return response(res, 404, "No valid user type, please login");
    }
  }

  static async logout(req: AuthRequest | any, res: Response) {
  switch(req.userType){
    case "user":
        const userId= req.user._id;
        const user:any = await User.findByIdAndUpdate({_id: userId}, {online: false});
        await user.save();
        io.emit("onlineUsers", []);

        break;
        case "hospital":
          const hospitalId= req.hospital._id;
          const hospital:any = await Hospital.findByIdAndUpdate({_id: hospitalId}, {online: false});
          await hospital.save();
          io.emit("onlineHospitals", []);

  
          break;
  }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    io.emit("userLogout", {});
    return response(res, 200, "Logout successful!");
  }
}

export default AuthController;
