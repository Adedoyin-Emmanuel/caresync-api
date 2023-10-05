import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { response } from "../utils";

const useAuth = (req: any, res: any, next: NextFunction) => {
  const token = req.headers["authorization"];
  if (!token)
    return response(res, 401, "You're not authorized to perform this action!");
  try {
    let bearer = token.split(" ")[1];
    let jwtSecret: any = process.env.JWT_PRIVATE_KEY;
    let decode = jwt.verify(bearer, jwtSecret);
    req.user = decode;
    res.user = decode;
  } catch (error: unknown) {
    console.log(error);
    return response(res, 401, "You're not authorized to perform this action!");
  }
};

export default useAuth;
