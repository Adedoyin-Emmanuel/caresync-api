import { NextFunction, Request, Response } from "express";
import { response } from "../utils";

const useAuth = (req: Request, res: Response, next: NextFunction) => {
    console.log("Auth middleware");
    next();
};



export default useAuth;
