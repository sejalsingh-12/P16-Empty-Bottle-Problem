import mongoose from "mongoose";

// One document = ONE maintenance request created by an admin.
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

    // The staff ACCOUNT this request is assigned to (links to the Staff model).
    // It is empty (null) for old requests created before the login system.
    assignedToStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true,
    },
    // The staff member's NAME, saved for easy display
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
