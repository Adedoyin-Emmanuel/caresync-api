import mongoose from "mongoose";

export interface IHealthCareHistory extends mongoose.Document {
  meetingDate: Date;
  userId: mongoose.Types.ObjectId[];
  hospitalId: mongoose.Types.ObjectId[];
  meetingPurpose: string;
  meetingNotes: string;
  userReview: mongoose.Types.ObjectId[];
  status: "scheduled" | "completed" | "cancelled";
}

const healthcareHistorySchema = new mongoose.Schema(
  {
    meetingDate: Date,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    meetingPurpose: {
      type: String,
      max: 1000,
    },
    meetingNotes: {
      type: String,
      max: 5000,
    },
    userReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reviews",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const HealthcareHistory = mongoose.model<IHealthCareHistory>(
  "HealthcareHistory",
  healthcareHistorySchema
);

export default HealthcareHistory;
