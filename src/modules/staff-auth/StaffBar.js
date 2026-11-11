"use client";

import { useState } from "react";
import Link from "next/link";
import "./auth.css";

// A bar at the top of the dashboard: who is logged in + Logout button.
// "current" tells it which page we are on ("maintenance" or "staff").
export default function StaffBar({ staff, current }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // We still go to the login page below
    }

    window.location.href = "/login";
  }

  return (
    <div className="sa-staff-bar">
      <span>
        👤 Logged in as <b>{staff.name}</b>{" "}
        <span className="sa-role">({staff.role === "admin" ? "Admin" : "Staff"})</span>
      </span>

      <div className="sa-bar-buttons">
        {staff.role === "admin" && current === "maintenance" && (
          <Link href="/admin/staff" className="btn btn-outline sa-small">
            Manage Staff
          </Link>
        )}

        {current === "staff" && (
          <Link href="/maintenance" className="btn btn-outline sa-small">
            ← Maintenance Dashboard
          </Link>
        )}

        <button className="btn btn-primary sa-small" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
