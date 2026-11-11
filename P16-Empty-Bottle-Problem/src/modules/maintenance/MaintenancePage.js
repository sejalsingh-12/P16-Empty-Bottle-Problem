"use client";

import { useState, useEffect } from "react";
import StaffBar from "@/modules/staff-auth/StaffBar";
import ReportsToReview from "./ReportsToReview";
import RequestDashboard from "./RequestDashboard";
import "./maintenance.css";

// The main component of Module 3.
// "staff" is the logged-in person (the server checked the login already).
//  - An ADMIN sees two tabs: "Student Reports" and "Dashboard".
//  - A STAFF member sees only their own assigned requests.
export default function MaintenancePage({ staff }) {
  const isAdmin = staff.role === "admin";

  const [tab, setTab] = useState(isAdmin ? "reports" : "dashboard");
  const [reports, setReports] = useState([]);
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // If the session has ended (error 401), go back to the login page
  function sessionEnded(response) {
    if (response.status === 401) {
      window.location.href = "/login";
      return true;
    }
    return false;
  }

  // Get the student reports that need attention (admin only)
  async function loadReports() {
    try {
      const response = await fetch("/api/maintenance/reports");
      if (sessionEnded(response)) return;
      const result = await response.json();

      if (result.success) {
        setReports(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Could not load student reports. Is the server running?");
    }

    setLoading(false);
  }

  // Get the active staff accounts for the "assign to" dropdown (admin only)
  async function loadStaffList() {
    try {
      const response = await fetch("/api/staff");
      if (sessionEnded(response)) return;
      const result = await response.json();

      if (result.success) {
        setStaffList(result.data.filter((member) => member.isActive));
      }
    } catch (err) {
      setError("Could not load the staff list.");
    }
  }

  // Get the maintenance requests (all, or only one status).
  // The server decides which ones this person is allowed to see.
  async function loadRequests(status) {
    try {
      const response = await fetch("/api/maintenance/requests?status=" + status);
      if (sessionEnded(response)) return;
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Could not load maintenance requests.");
    }
  }

  // When the page opens: an admin loads the reports and staff list
  useEffect(() => {
    if (isAdmin) {
      loadReports();
      loadStaffList();
    } else {
      setLoading(false);
    }
  }, []);

  // Load the requests when the page opens and whenever the filter changes
  useEffect(() => {
    loadRequests(statusFilter);
  }, [statusFilter]);

  // Called after a new request is created
  function handleRequestCreated(message) {
    setSuccessMessage(message);
    loadReports(); // refresh so the report shows "Request created"
    loadRequests(statusFilter);
    setTab("dashboard");
  }

  // Called after a request is updated
  function handleRequestUpdated() {
    loadRequests(statusFilter);
  }

  return (
    <div>
      <h1 className="page-title">
        {isAdmin ? "Maintenance Management" : "My Assigned Requests"}
      </h1>
      <p className="page-subtitle">
        {isAdmin
          ? "Review student reports, assign repair requests and track their progress."
          : "Update the status of the requests assigned to you and add repair notes."}
      </p>

      <StaffBar staff={staff} current="maintenance" />

      {error && <div className="message message-error">{error}</div>}

      {isAdmin && (
        <div className="mt-tabs">
          <button
            className={tab === "reports" ? "mt-tab mt-tab-active" : "mt-tab"}
            onClick={() => setTab("reports")}
          >
            📋 Student Reports
          </button>
          <button
            className={tab === "dashboard" ? "mt-tab mt-tab-active" : "mt-tab"}
            onClick={() => setTab("dashboard")}
          >
            🛠️ Dashboard
          </button>
        </div>
      )}

      {loading ? (
        <div className="message">Loading...</div>
      ) : (
        <>
          {isAdmin && tab === "reports" && (
            <ReportsToReview
              reports={reports}
              staffList={staffList}
              onRequestCreated={handleRequestCreated}
            />
          )}

          {tab === "dashboard" && (
            <RequestDashboard
              staff={staff}
              staffList={staffList}
              requests={requests}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onRequestUpdated={handleRequestUpdated}
              successMessage={successMessage}
              clearSuccessMessage={() => setSuccessMessage("")}
            />
          )}
        </>
      )}
    </div>
  );
}
