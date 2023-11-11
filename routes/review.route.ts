import express from "express";
import { ReviewController } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";
const reviewRouter = express.Router();

reviewRouter.post(
  "/",
  [useAuth, useCheckRole("user")],
  ReviewController.createReview
);
reviewRouter.get("/", ReviewController.getAllReviews);
reviewRouter.get("/:id", ReviewController.getReviewById);

reviewRouter.get("/user/:id", ReviewController.getReviewByUserId);
reviewRouter.get("/hospital/:id", ReviewController.getReviewByHospitalId);

//only a user can update or delete a review
reviewRouter.put(
  "/",
  [useAuth, useCheckRole("user")],
  ReviewController.updateReview
);

reviewRouter.delete(
  "/",
  [useAuth, useCheckRole("user")],
  ReviewController.deleteReview
);

export default reviewRouter;
