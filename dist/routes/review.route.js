"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("./../middlewares");
const reviewRouter = express_1.default.Router();
reviewRouter.post("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("user")], controllers_1.ReviewController.createReview);
reviewRouter.get("/", controllers_1.ReviewController.getAllReviews);
reviewRouter.get("/:id", controllers_1.ReviewController.getReviewById);
reviewRouter.get("/user/:id", controllers_1.ReviewController.getReviewByUserId);
reviewRouter.get("/hospital/:id", controllers_1.ReviewController.getReviewByHospitalId);
//only a user can update or delete a review
reviewRouter.put("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("user")], controllers_1.ReviewController.updateReview);
reviewRouter.delete("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("user")], controllers_1.ReviewController.deleteReview);
exports.default = reviewRouter;
