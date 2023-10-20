import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { response } from "../utils";

const useAuth = (req: any, res: any, next: NextFunction) => {
  const tokenFromCookie = req.cookies.accessToken;

  if (!tokenFromCookie) {
    return response(
      res,
      401,
      "You're not authorized to perform this action, no token provided !"
    );
  }

  try {
    // Extract the bearer token from the header
    const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;

    if (!JWT_SECRET) {
      throw new Error("JWT private key is missing.");
    }

    let decodeCookie: any = jwt.verify(tokenFromCookie, JWT_SECRET);
    if (decodeCookie && decodeCookie._id) {
      const userRole = "user",
        hospitalRole = "hospital";
      if (decodeCookie.role === userRole) {
        req.user = decodeCookie;
        res.user = decodeCookie;
        req.userType = "user";
        next();
      } else if (decodeCookie.role === hospitalRole) {
        req.hospital = decodeCookie;
        res.hospital = decodeCookie;
        req.userType = "hospital";

        next();
      } else {
        console.log("invalid auth token!");
        return response(res, 401, "Invalid auth token");
      }
    } else {
      return response(res, 401, "Invalid auth token.");
    }
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
