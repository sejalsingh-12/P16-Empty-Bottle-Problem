import { NextResponse } from "next/server";
import { deleteCurrentSession, clearSessionCookie } from "@/lib/auth";

// POST /api/auth/logout
// Deletes the session in the database and clears the cookie.
export async function POST() {
  try {
    await deleteCurrentSession();
  } catch (error) {
    // Even if the database fails, we still clear the cookie below
  }

  const response = NextResponse.json({ success: true, message: "Logged out." });
  clearSessionCookie(response);

  return response;
}
