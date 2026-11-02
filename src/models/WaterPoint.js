import mongoose from "mongoose";

// This is the SHARED data structure used by all 3 modules.
const WaterPointSchema = new mongoose.Schema(
  {
    waterPointId: { type: String, required: true, unique: true }, // e.g. "WP-001"
    name: { type: String, required: true },
    building: { type: String, required: true },
    floor: { type: String, required: true },
    locationDetails: { type: String, default: "" },
    availability: {
      type: String,
      enum: ["Available", "Not Available"],
      default: "Available",
    },
    cleanliness: {
      type: String,
      enum: ["Clean", "Average", "Dirty"],
      default: "Clean",
    },
    temperature: {
      type: String,
      enum: ["Cold", "Normal", "Warm"],
      default: "Normal",
    },
    isWorking: { type: Boolean, default: true },

    // ---- Added by Module 2 (Water Point Status) ----
    // How crowded the water point is. Old documents simply get the default.
    usageStatus: {
      type: String,
      enum: ["Low", "Normal", "Crowded"],
      default: "Normal",
    },
    // When a student last reported the status (null = never reported)
    lastReportedAt: { type: Date, default: null },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// "mongoose.models.WaterPoint ||" stops Next.js from creating the model twice
export default mongoose.models.WaterPoint ||
  mongoose.model("WaterPoint", WaterPointSchema);
