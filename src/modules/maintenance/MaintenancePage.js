"use client";

import { useState, useEffect } from "react";
import ReportsToReview from "./ReportsToReview";
import RequestDashboard from "./RequestDashboard";
import "./maintenance.css";

// The main component of Module 3.
// It has two tabs: "Student Reports" and "Dashboard".
// It loads the data here and passes it to the smaller components.
export default function MaintenancePage() {
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get the student reports that need attention
  async function loadReports() {
    try {
      const response = await fetch("/api/maintenance/reports");
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

  // Get the maintenance requests (all, or only one status)
  async function loadRequests(status) {
    try {
      const response = await fetch("/api/maintenance/requests?status=" + status);
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

  // Load the reports once when the page opens
  useEffect(() => {
    loadReports();
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
      <h1 className="page-title">Maintenance Management</h1>
      <p className="page-subtitle">
        Review student reports, create repair requests and track their progress.
      </p>

      {error && <div className="message message-error">{error}</div>}

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

      {loading ? (
        <div className="message">Loading...</div>
      ) : (
        <>
          {tab === "reports" && (
            <ReportsToReview reports={reports} onRequestCreated={handleRequestCreated} />
          )}

          {tab === "dashboard" && (
            <RequestDashboard
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
