import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { response } from "../utils";

const useAuth = (req: any, res: any, next: NextFunction) => {
  const token = req.headers["authorization"];
  if (!token) {
    return response(res, 401, "You're not authorized to perform this action!");
  }

  try {
    let bearer = token.split(" ")[1];
    const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;

    if (!JWT_SECRET) {
      throw new Error("JWT private key is missing.");
    }

    let decode = jwt.verify(bearer, JWT_SECRET);
    console.log(decode);
    req.user = decode;
    res.user = decode;
    next(); // Continue with the next middleware
  } catch (error) {
    console.error(error);
    return response(
      res,
      401,
      `You're not authorized to perform this action! ${error}`
    );
  }
};

export default useAuth;
