import mongoose from "mongoose";

// One document = ONE maintenance request created by staff.
const MaintenanceRequestSchema = new mongoose.Schema(
  {
    // The student report (Module 2) this request came from.
    // "unique: true" means one report can only have ONE request (no duplicates).
    statusReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WaterStatusReport",
      required: true,
      unique: true,
    },
    // Same ID as the WaterPoint (e.g. "WP-001"), this links to Module 1 data
    waterPointId: { type: String, required: true, index: true },

    issueDescription: { type: String, required: true, maxlength: 500 },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedTo: { type: String, required: true, maxlength: 50 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    maintenanceNote: { type: String, default: "", maxlength: 500 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt = when the request was created
);

export default mongoose.models.MaintenanceRequest ||
  mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);
