import { Request, Response } from "express";
import Joi from "joi";
import { Hospital, Review, User } from "../models";
import { response } from "./../utils";

class ReviewController {
  static async createReview(req: Request, res: Response) {
    const requestSchema = Joi.object({
      message: Joi.string().required().max(1000),
      rating: Joi.number().required().min(1).max(5).default(1),
      userId: Joi.string().required(),
      hospitalId: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    try {
      const review = await Review.create(value);

      // Update User's review
      await User.findByIdAndUpdate(
        value.userId,
        { $push: { reviews: review._id } },
        { new: true }
      );

      // Update Hospital's Review
      await Hospital.findByIdAndUpdate(
        value.hospitalId,
        { $push: { reviews: review._id } },
        { new: true }
      );

      return response(res, 201, "Review submitted successfully", review);
    } catch (error) {
      console.log(error);
      return response(
        res,
        500,
        `An error occurred while creating the review ${error}`
      );
    }
  }

  static async getAllReviews(req: Request, res: Response) {
    const allReviews = await Review.find();

    return response(res, 200, "Reviews fetched successfully", allReviews);
  }

  static async getReviewById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const review = await Review.findById(value.id);

    if (!review) return response(res, 404, "Review with given id not found!");

    return response(res, 200, "Review fetched successfully", review);
  }

  static async getReviewByUserId(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const { id: userId } = value;

    const reviews = Review.find({ userId }).sort({ createdAt: -1 }).exec();

    if (!reviews) {
      return response(res, 404, "No reviews found", []);
    }

    return response(res, 200, "Reviews fetched successfully", reviews);
  }

  static async getReviewByHospitalId(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const { id: hospitalId } = value;

    const reviews = Review.find({ hospitalId }).sort({ createdAt: -1 }).exec();

    if (!reviews) {
      return response(res, 404, "No reviews found", []);
    }

    return response(res, 200, "Reviews fetched successfully", reviews);
  }

  static async updateReview(req: Request, res: Response) {
    const requestSchema = Joi.object({
      message: Joi.string().max(1000).required(),
      rating: Joi.number().min(1).max(5).required(),
    });

    const requestParamsSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error: requestParamsError, value: requestParamsValue } =
      requestParamsSchema.validate(req.params);
    if (requestParamsError)
      return response(res, 400, requestParamsError.details[0].message);

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const updatedReview = await Review.findByIdAndUpdate(
      requestParamsValue.id,
      value,
      { new: true }
    );
    if (!updatedReview)
      return response(res, 404, "Review with given id not found!");

    return response(res, 200, "Review updated successfully", updatedReview);
  }

  static async deleteReview(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const deletedReview = await Review.findByIdAndDelete(value.id);

    if (!deletedReview)
      return response(res, 404, "Review with given id not found!");

    try {
      await User.findByIdAndUpdate(deletedReview.userId, {
        $pull: { reviews: deletedReview._id },
      });

      await Hospital.findByIdAndUpdate(deletedReview.hospitalId, {
        $pull: { reviews: deletedReview._id },
      });

      return response(res, 200, "Review deleted successfully");
    } catch (error) {
      return response(res, 400, "An error occured while deleting the review!");
    }
  }
}

export default ReviewController;
