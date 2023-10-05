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
  appointments: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  reviews: mongoose.Types.ObjectId[];

  generateAuthToken(): string;
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

    bio: {
      type: String,
      required: false,
      max: 500,
    },

    profilePicture: {
      type: String,
      required: true,
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

HospitalSchema.methods.generateAuthToken = function () {
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
