import mongoose from "mongoose";

// One document = ONE report submitted by a student.
// We keep every report, so this collection is the "history".
const WaterStatusReportSchema = new mongoose.Schema(
  {
    // Same ID as the WaterPoint (e.g. "WP-001"), this links the two collections
    waterPointId: { type: String, required: true, index: true },
    availability: {
      type: String,
      enum: ["Available", "Not Available"],
      required: true,
    },
    cleanliness: {
      type: String,
      enum: ["Clean", "Average", "Dirty"],
      required: true,
    },
    temperature: {
      type: String,
      enum: ["Cold", "Normal", "Warm"],
      required: true,
    },
    isWorking: { type: Boolean, required: true },
    usageStatus: {
      type: String,
      enum: ["Low", "Normal", "Crowded"],
      required: true,
    },
    description: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true } // createdAt = the time the report was submitted
);

export default mongoose.models.WaterStatusReport ||
  mongoose.model("WaterStatusReport", WaterStatusReportSchema);
