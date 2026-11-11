import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Staff from "@/models/Staff";
import { hashPassword, checkPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/auth";

const WRONG_MESSAGE = "Invalid username or password.";
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// Used when the username does not exist, so a wrong username takes the same
// time as a wrong password (this hides which usernames exist).
const DUMMY_HASH = hashPassword("dummy-password-for-timing");

// POST /api/auth/login   body: { username, password }
export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (err) {
      body = {};
    }

    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (username === "" || password === "") {
      return NextResponse.json(
        { success: false, message: "Please enter your username and password." },
        { status: 400 }
      );
    }

    await connectDB();

    const staff = await Staff.findOne({ username: username });

    // 1. Unknown username
    if (!staff) {
      checkPassword(password, DUMMY_HASH);
      return NextResponse.json({ success: false, message: WRONG_MESSAGE }, { status: 401 });
    }

    // 2. Account is temporarily locked after too many wrong passwords
    if (staff.lockUntil && staff.lockUntil > new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed attempts. Please try again in ${LOCK_MINUTES} minutes.`,
        },
        { status: 429 }
      );
    }

    // 3. Wrong password: count it, and lock the account after 5 mistakes
    if (!checkPassword(password, staff.passwordHash)) {
      staff.failedLoginAttempts = staff.failedLoginAttempts + 1;

      if (staff.failedLoginAttempts >= MAX_ATTEMPTS) {
        staff.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        staff.failedLoginAttempts = 0;
      }

      await staff.save();
      return NextResponse.json({ success: false, message: WRONG_MESSAGE }, { status: 401 });
    }

    // 4. Correct password, but the admin has disabled this account
    if (!staff.isActive) {
      return NextResponse.json(
        { success: false, message: "This account is deactivated. Please contact the administrator." },
        { status: 403 }
      );
    }

    // 5. Success: clear the counters and start a session
    staff.failedLoginAttempts = 0;
    staff.lockUntil = null;
    await staff.save();

    const { token, expiresAt } = await createSession(staff._id);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      data: { name: staff.name, role: staff.role },
    });
    setSessionCookie(response, token, expiresAt);

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
