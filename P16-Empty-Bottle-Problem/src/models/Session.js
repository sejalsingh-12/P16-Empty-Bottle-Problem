import mongoose from "mongoose";

// One document = ONE logged-in browser.
// We store a HASH of the session token, not the token itself, so even if
// someone could read the database they could not log in with it.
const SessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB deletes the session automatically after "expiresAt"
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
