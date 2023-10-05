import config from "config";
import jwt, { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  token?: string;
  appointments: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  reviews: mongoose.Types.ObjectId[];

  generateAuthToken(): string;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 50,
    },
    username: {
      type: String,
      required: true,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      min: 6,
      max: 30,
      required: true,
      select: false,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: false,
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointments",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reviews",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);


UserSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    name: this.name,
  };
  const JWT_SECRET: string = config.get("jwtPrivateKey");
  const tokenExpiration: string = config.get("tokenExpiration");

  const options: SignOptions = {
    expiresIn: tokenExpiration,
  };

  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
};

UserSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    name: this.name,
  };
  const JWT_SECRET: string = config.get("jwtPrivateKey");

  const options: SignOptions = {
    expiresIn: config.get("refreshTokenExpiration"),
  };

  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
