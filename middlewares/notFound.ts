import response from "../utils/response";
import { Response, Request } from "express";

const notFound = (req:Request, res: Response) => {
  return response(res, 404, "Route not found");
};


export default notFound;
