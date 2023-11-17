"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const models_1 = require("../models");
const utils_1 = require("./../utils");
const socket_server_1 = require("../sockets/socket.server");
class ReviewController {
    static createReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                message: joi_1.default.string().required().max(1000),
                rating: joi_1.default.number().required().min(1).max(5).default(1),
                userId: joi_1.default.string().required(),
                hospitalId: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            try {
                const review = yield models_1.Review.create(value);
                // Update User's review
                yield models_1.User.findByIdAndUpdate(value.userId, { $push: { reviews: review._id } }, { new: true });
                // Update Hospital's Review
                yield models_1.Hospital.findByIdAndUpdate(value.hospitalId, { $push: { reviews: review._id } }, { new: true });
                // emit the new review created
                socket_server_1.io.emit("newReview", review);
                return (0, utils_1.response)(res, 201, "Review submitted successfully", review);
            }
            catch (error) {
                console.log(error);
                return (0, utils_1.response)(res, 500, `An error occurred while creating the review ${error}`);
            }
        });
    }
    static getAllReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allReviews = yield models_1.Review.find();
            return (0, utils_1.response)(res, 200, "Reviews fetched successfully", allReviews);
        });
    }
    static getReviewById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const review = yield models_1.Review.findById(value.id);
            if (!review)
                return (0, utils_1.response)(res, 404, "Review with given id not found!");
            return (0, utils_1.response)(res, 200, "Review fetched successfully", review);
        });
    }
    static getReviewByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { id: userId } = value;
            const reviews = yield models_1.Review.find({ userId })
                .sort({ createdAt: -1 })
                .exec();
            if (reviews.length == 0) {
                return (0, utils_1.response)(res, 404, "No reviews found", []);
            }
            return (0, utils_1.response)(res, 200, "Reviews fetched successfully", reviews);
        });
    }
    static getReviewByHospitalId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { id: hospitalId } = value;
            const reviews = yield models_1.Review.find({ hospitalId })
                .sort({ createdAt: -1 })
                .exec();
            if (reviews.length == 0) {
                return (0, utils_1.response)(res, 404, "No reviews found");
            }
            return (0, utils_1.response)(res, 200, "Reviews fetched successfully", reviews);
        });
    }
    static updateReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                message: joi_1.default.string().max(1000).required(),
                rating: joi_1.default.number().min(1).max(5).required(),
            });
            const requestParamsSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error: requestParamsError, value: requestParamsValue } = requestParamsSchema.validate(req.params);
            if (requestParamsError)
                return (0, utils_1.response)(res, 400, requestParamsError.details[0].message);
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const updatedReview = yield models_1.Review.findByIdAndUpdate(requestParamsValue.id, value, { new: true });
            if (!updatedReview)
                return (0, utils_1.response)(res, 404, "Review with given id not found!");
            //emit the newly updated review
            socket_server_1.io.emit("updateReview", updatedReview);
            return (0, utils_1.response)(res, 200, "Review updated successfully", updatedReview);
        });
    }
    static deleteReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const deletedReview = yield models_1.Review.findByIdAndDelete(value.id);
            if (!deletedReview)
                return (0, utils_1.response)(res, 404, "Review with given id not found!");
            try {
                yield models_1.User.findByIdAndUpdate(deletedReview.userId, {
                    $pull: { reviews: deletedReview._id },
                });
                yield models_1.Hospital.findByIdAndUpdate(deletedReview.hospitalId, {
                    $pull: { reviews: deletedReview._id },
                });
                socket_server_1.io.emit("deleteReview", deletedReview);
                return (0, utils_1.response)(res, 200, "Review deleted successfully");
            }
            catch (error) {
                return (0, utils_1.response)(res, 400, "An error occured while deleting the review!");
            }
        });
    }
}
exports.default = ReviewController;
