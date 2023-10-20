import mongoose from "mongoose";

export interface IHealthCareHistory extends mongoose.Document {
  meetingDate: Date;
  user: string;
  hospital: string;
  meetingPurpose: string;
  meetingNotes: string;
  userReview: string;
  status: "scheduled" | "completed" | "cancelled";
}

const healthcareHistorySchema = new mongoose.Schema(
  {
    meetingDate: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hospital: {
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
