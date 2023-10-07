import { Request } from "express";

interface User {
  _id: String;
  role: "user";
  username: String;
  name: String;
}

interface Hospital {
  _id: String;
  role: "hospital";
  username: String;
  clinicName: String;
}

export interface HospitalJWTPayload extends Request {
  hospital: Hospital | any;
}

export interface UserJWTPayload extends Request {
  user: User | any;
}
