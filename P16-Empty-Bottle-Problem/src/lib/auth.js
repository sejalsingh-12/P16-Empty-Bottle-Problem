import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Staff from "@/models/Staff";
import Session from "@/models/Session";

// SERVER-ONLY helpers for login sessions. Never import this file in a
// "use client" component.

export const SESSION_COOKIE = "staff_session";
const SESSION_HOURS = 8;

// Scrambles the token before saving it in the database
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Creates a session in the database and returns the token for the cookie
export async function createSession(staffId) {
  await connectDB();

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);

  await Session.create({ tokenHash: hashToken(token), staffId, expiresAt });

  return { token, expiresAt };
}

// Puts the session token in the browser cookie.
// httpOnly = JavaScript in the browser cannot read it.
export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

// Deletes the session of the person who is making this request (logout)
export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return;

  await connectDB();
  await Session.deleteOne({ tokenHash: hashToken(cookie.value) });
}

// Returns the logged-in staff member, or null if nobody is logged in.
// Used by pages AND by API routes.
export async function getCurrentStaff() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;

  await connectDB();

  const session = await Session.findOne({ tokenHash: hashToken(cookie.value) });
  if (!session || session.expiresAt < new Date()) return null;

  const staff = await Staff.findById(session.staffId);
  if (!staff || !staff.isActive) return null;

  // Only the safe fields. The password hash is never returned.
  return {
    id: String(staff._id),
    name: staff.name,
    username: staff.username,
    role: staff.role,
  };
}

// For API routes. Usage:
//   const { staff, error } = await requireLogin();
//   if (error) return error;
export async function requireLogin() {
  const staff = await getCurrentStaff();

  if (!staff) {
    const error = NextResponse.json(
      { success: false, message: "Please log in first." },
      { status: 401 }
    );
    return { staff: null, error };
  }

  return { staff, error: null };
}

// Same as requireLogin, but the person must also be an admin
export async function requireAdmin() {
  const { staff, error } = await requireLogin();
  if (error) return { staff: null, error };

  if (staff.role !== "admin") {
    const forbidden = NextResponse.json(
      { success: false, message: "Only an administrator can do this." },
      { status: 403 }
    );
    return { staff: null, error: forbidden };
  }

  return { staff, error: null };
}
