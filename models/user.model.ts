import config from "config";
import jwt, { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  token?: string;
  isVerified: boolean;
  verifyEmailToken?: string;
  verifyEmailTokenExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpire?: Date;
  appointments: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  reviews: mongoose.Types.ObjectId[];
  healthCareHistory: mongoose.Types.ObjectId[];
  allTotalAppointments?: number;
  location?: string;
  online?: boolean;

  generateAccessToken(): string;
  generateRefreshToken(): string;
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
    bio: {
      type: String,
      required: false,
      default: "Bridging health with technology",
      max: 500,
    },
    token: {
      type: String,
      select: false,
      required: false,
    },

    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },

    location: {
      type: String,
      required: false,
      max: 50,
      default: ""
    },

    allTotalAppointments: {
      type: Number,
      required: false,
      default: 0,
    },

    verifyEmailToken: {
      type: String,
      required: false,
      select: false,
    },

    online:{
      type: Boolean,
      required: false,
      default: false
    },

    verifyEmailTokenExpire: {
      type: Date,
      required: false,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      required: false,
      select: false,
    },

    resetPasswordTokenExpire: {
      type: Date,
      required: false,
      select: false,
    }, 
    
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointments",
      },
    ],

    healthCareHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "HealthcareHistory" },
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

UserSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    name: this.name,
    role: "user",
  };
  const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;
  const tokenExpiration: string = config.get("App.tokenExpiration");

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
    role: "user",
  };
  const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;

  const options: SignOptions = {
    expiresIn: config.get("App.refreshTokenExpiration"),
  };

  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
