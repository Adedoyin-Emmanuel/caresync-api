import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import Joi from "joi";
import * as _ from "lodash";
import User from "../models/user.model";
import { AuthRequest } from "../types/types";
import { response } from "./../utils";
class UserController {
  static async createUser(req: Request, res: Response) {
    const validationSchema = Joi.object({
      name: Joi.string().required().max(50),
      username: Joi.string().required().max(20),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6).max(30),
    });

    const { error, value } = validationSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    //check if email has been taken by another user
    const { email: emailTaken, username: usernameTaken } = value;
    const existingEmailUser = await User.findOne({ email: emailTaken });
    if (existingEmailUser) return response(res, 400, "Email already taken");

    const existingUsernameUser = await User.findOne({
      username: usernameTaken,
    });
    if (existingUsernameUser)
      return response(res, 400, "Username already taken");

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(value.password, salt);
    const { name, username, email } = value;
    const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${
      username || name
    }`;
    const valuesToStore = {
      name,
      username,
      email,
      password,
      profilePicture,
    };

    const user = await User.create(valuesToStore);
    const filteredUser = _.pick(user, [
      "name",
      "username",
      "email",
      "createdAt",
      "updatedAt",
      "profilePicture",
    ]);
    return response(res, 201, "User created successfully", filteredUser);
  }

  static async getAllUsers(req: Request | any, res: Response) {
    const allUsers = await User.find();

    return response(res, 200, "Users fetched successfully", allUsers);
  }

  static async getUserById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const user = await User.findById(value.id);
    if (!user) return response(res, 404, "User with given id not found");

    return response(res, 200, "User fetched successfully", user);
  }

  static async getMe(req: AuthRequest | any, res: Response) {
    const user = await User.findById(req.user._id);
    if (!user) return response(res, 404, "User with given id not found");
    return response(res, 200, "User info fetched successfully", user);
  }

  static async searchUser(req: Request, res: Response) {
    const requestSchema = Joi.object({
      searchTerm: Joi.string().required(),
    });
    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    const { searchTerm } = value;

    const user = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
      ],
    });

    if (user.length == 0)
      return response(res, 404, "No users found", []);

    if (!user) return response(res, 400, "Couldn't get user");

    return response(res, 200, "User fetched successfully", user);
  }

  static async updateUser(req: Request, res: Response) {
    const requestSchema = Joi.object({
      name: Joi.string().required().max(50),
      username: Joi.string().required().max(20),
      bio: Joi.string().required().max(500),
      email: Joi.string().required().email(),
      location: Joi.string().required().max(50),
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

    //check if user with id exist
    const { id } = requestParamsValue;
    const existingUser = await User.findById(id);
    if (!existingUser)
      return response(res, 404, "User with given id not found");

    //check if email has been taken by another user
    const { username, email } = requestBodyValue;
    if (email && email !== existingUser.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) return response(res, 400, "Email already taken");
    }

    // Check if username has been taken by another user
    if (username && username !== existingUser.username) {
      const existingUsernameUser = await User.findOne({ username });
      if (existingUsernameUser) {
        return response(
          res,
          400,
          "Username has already been taken by another user"
        );
      }
    }

    //update the user
    const options = { new: true, runValidators: true };
    const updatedUser = await User.findByIdAndUpdate(
      id,
      requestBodyValue,
      options
    );

    return response(res, 200, "User details updated successfully", updatedUser);
  }

  static async deleteUser(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 200, error.details[0].message);

    const deletedUser = await User.findByIdAndDelete(value.id);
    if (!deletedUser)
      return response(res, 404, "User with given id not found!");

    return response(res, 200, "User deleted successfully");
  }
}

export default UserController;
