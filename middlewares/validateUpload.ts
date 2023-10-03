import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { response } from "./../utils";

const validateUpload = (req: Request, res: Response, next: NextFunction) => {
  const requestSchema = Joi.object({
    title: Joi.string().required().max(100),
    transcript: Joi.string().required().max(5000),
  });
    
    

  const { error, value } = requestSchema.validate(req.body);
  if (error) {
      return response(res, 400, error.details[0].message);
  } else {
      console.log("moving to the next");
    next();
  }
};

export default validateUpload;
