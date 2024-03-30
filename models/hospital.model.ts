import config from "config";
import jwt, { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";

export interface IHospital extends mongoose.Document {
  clinicName: string;
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
  location?: string;
  online?: boolean;

  allTotalAppointments?: number;

  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const HospitalSchema = new mongoose.Schema(
  {
    clinicName: {
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

    location: {
      type: String,
      required: false,
      max: 150,
      default: "",
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

    healthCareHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "HealthcareHistory" },
    ],

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

HospitalSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    clinicName: this.name,
    role: "hospital",
  };
  const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;
  const tokenExpiration: string = config.get("App.tokenExpiration");

  const options: SignOptions = {
    expiresIn: tokenExpiration,
  };

  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
};

HospitalSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    clinicName: this.name,
    role: "hospital",
  };
  const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;

  const options: SignOptions = {
    expiresIn: config.get("App.refreshTokenExpiration"),
  };

  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
};

const Hospital = mongoose.model<IHospital>("Hospital", HospitalSchema);

export default Hospital;
