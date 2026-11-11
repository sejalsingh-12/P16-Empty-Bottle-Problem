import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Staff from "@/models/Staff";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { validateNewStaff } from "@/modules/staff-auth/validateStaff";

// GET /api/staff  (admin only) -> list of all staff accounts
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    // "-passwordHash" means: do NOT send the password hash
    const staffList = await Staff.find().select("-passwordHash").sort({ name: 1 }).lean();

    return NextResponse.json({ success: true, data: staffList });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/staff  (admin only) -> create a new STAFF account
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    const body = await request.json();

    const errors = validateNewStaff(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "Please fix the errors in the form.", errors },
        { status: 400 }
      );
    }

    const username = body.username.trim().toLowerCase();

    const existing = await Staff.findOne({ username: username });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "This username is already taken.", errors: { username: "This username is already taken." } },
        { status: 409 }
      );
    }

    // The role is always "staff" here. Admins are created only with
    // the terminal script, never from the website.
    const newStaff = await Staff.create({
      name: body.name.trim(),
      username: username,
      passwordHash: hashPassword(body.password),
      role: "staff",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff account created successfully!",
        data: {
          _id: newStaff._id,
          name: newStaff.name,
          username: newStaff.username,
          role: newStaff.role,
          isActive: newStaff.isActive,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This username is already taken." },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
