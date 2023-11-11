import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      max: 1000,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  },
  { timestamps: true, versionKey: false }
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
