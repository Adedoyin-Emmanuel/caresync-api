import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { response } from "../utils";

const useAuth = (req: any, res: any, next: NextFunction) => {
  const tokenFromHeader = req.headers["authorization"];
  const tokenFromCookie = req.cookies.accessToken; 

  console.log(tokenFromHeader);

  if (!tokenFromHeader || !tokenFromCookie) {
    return response(res, 401, "You're not authorized to perform this action, no token provided !");
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
      const userRole = "user",
        hospitalRole = "hospital";
      if (decodeCookie.role === userRole) {
        req.user = decodeHeader;
        res.user = decodeHeader;
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
