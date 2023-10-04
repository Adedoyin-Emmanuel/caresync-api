import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: false,
      max: 500,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 0,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  },
  { timestamp: true, versionKey: false }
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
