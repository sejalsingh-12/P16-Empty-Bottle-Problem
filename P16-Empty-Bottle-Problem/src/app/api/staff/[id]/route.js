import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Staff from "@/models/Staff";
import Session from "@/models/Session";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { validatePassword } from "@/modules/staff-auth/validateStaff";

// PATCH /api/staff/<id>  (admin only)
// body can contain:  { isActive: true/false }  and/or  { newPassword: "..." }
export async function PATCH(request, { params }) {
  const { staff: admin, error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid staff ID." }, { status: 400 });
    }

    const member = await Staff.findById(id);
    if (!member) {
      return NextResponse.json({ success: false, message: "Staff member not found." }, { status: 404 });
    }

    const body = await request.json();
    let forceLogout = false;

    // ----- Activate / deactivate -----
    if (typeof body.isActive === "boolean") {
      if (body.isActive === false && String(member._id) === admin.id) {
        return NextResponse.json(
          { success: false, message: "You cannot deactivate your own account." },
          { status: 400 }
        );
      }

      member.isActive = body.isActive;

      if (body.isActive === false) {
        forceLogout = true; // a disabled person must be logged out now
      } else {
        member.failedLoginAttempts = 0;
        member.lockUntil = null;
      }
    }

    // ----- Reset password -----
    if (body.newPassword !== undefined) {
      const passwordError = validatePassword(body.newPassword);
      if (passwordError) {
        return NextResponse.json(
          { success: false, message: passwordError, errors: { newPassword: passwordError } },
          { status: 400 }
        );
      }

      member.passwordHash = hashPassword(body.newPassword);
      member.failedLoginAttempts = 0;
      member.lockUntil = null;
      forceLogout = true; // old sessions must stop working
    }

    await member.save();

    if (forceLogout) {
      await Session.deleteMany({ staffId: member._id });
    }

    return NextResponse.json({
      success: true,
      message: "Staff account updated successfully!",
      data: {
        _id: member._id,
        name: member.name,
        username: member.username,
        role: member.role,
        isActive: member.isActive,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
