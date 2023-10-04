import mongoose from "mongoose";

const AppointmentModel = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true, versionKey: false }
);

const Appointment = mongoose.model("Appointment", AppointmentModel);

export default Appointment;
