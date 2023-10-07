import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { response } from "../utils";

const useAuth = (req: any, res: any, next: NextFunction) => {
  const tokenFromHeader = req.headers["authorization"];
  const tokenFromCookie = req.cookies.accessToken; // Assuming you're using cookie-parser

  if (!tokenFromHeader || !tokenFromCookie) {
    return response(res, 401, "You're not authorized to perform this action!");
  }

  try {
    // Extract the bearer token from the header
    let bearer = tokenFromHeader.split(" ")[1];
    const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;

    if (!JWT_SECRET) {
      throw new Error("JWT private key is missing.");
    }

    let decodeHeader: any = jwt.verify(bearer, JWT_SECRET);

    let decodeCookie: any = jwt.verify(tokenFromCookie, JWT_SECRET);

    if (decodeHeader && decodeCookie && decodeHeader._id === decodeCookie._id) {
      req.user = decodeHeader;
      res.user = decodeHeader;
      next();
    } else {
      return response(res, 401, "Invalid token.");
    }
  } catch (error) {
    console.error(error);
    return response(res, 401, `You're not authorized to perform this action!`);
  }
};

export default useAuth;
