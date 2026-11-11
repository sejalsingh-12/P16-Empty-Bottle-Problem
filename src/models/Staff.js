import mongoose from "mongoose";

// One document = ONE staff (or admin) account.
// The real password is NEVER stored, only a "hash" of it.
const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: {
      type: String,
      required: true,
      unique: true, // two accounts cannot share a username
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    isActive: { type: Boolean, default: true }, // false = account is disabled
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null }, // login is blocked until this time
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
