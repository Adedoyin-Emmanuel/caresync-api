import mongoose from "mongoose";

export interface IMedicalRecord extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  symptoms: string;
  diagnosis: string;
}

const MedicalRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },

    symptoms: {
      type: String,
      required: true,
      max: 2500,
    },

    diagnosis: {
      type: String,
      required: true,
      max: 25000,
    },
  },
  { timestamps: true, versionKey: false }
);

const MedicalRecord = mongoose.model<IMedicalRecord>(
  "MedicalRecord",
  MedicalRecordSchema
);

export default MedicalRecord;
