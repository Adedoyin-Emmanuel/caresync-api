import { NextFunction, Request, Response } from "express";
import { response } from "../utils";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      hospital?: any;
    }
  }
}
interface UseCheckRoleOptions {
  req: Request;
  res: Response;
  next: NextFunction;
  role: "user" | "hospital";
}

const useCheckRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isHospital = req.hospital;
    const isUser = req.user;

    if (isHospital && role === "hospital") {
      next();
    } else if (isUser && role === "user") {
      next();
    } else {
      return response(res, 403, "Access denied. Insufficient permissions.");
    }
  };
};

export default useCheckRole;
