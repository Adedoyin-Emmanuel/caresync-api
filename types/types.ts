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

export type GlobalUser = User | Hospital | undefined;

export interface SocketMessage{
  roomId?: string;
  sender?: string;
  receiver?: string;
  message?: string;
}


export interface HospitalJWTPayload extends Request {
  hospital: Hospital | any;
}

export interface UserJWTPayload extends Request {
  user: User | any;
}


export interface AuthRequest extends Request{
  hospital: Hospital | any;
  user: User | any;
  userType: "user" | "hospital",
}
