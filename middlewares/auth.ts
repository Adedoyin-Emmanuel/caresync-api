import { NextFunction, Request, Response } from "express";

const useAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.headers["x-auth-token"]);
  next();
};

export default useAuth;
