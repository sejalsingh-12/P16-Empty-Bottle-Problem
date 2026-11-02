"use client";

import { useState, useEffect } from "react";
import ReportForm from "./ReportForm";
import LatestStatusList from "./LatestStatusList";
import ReportHistory from "./ReportHistory";
import "./status.css";

// The main component of Module 2.
// It loads the data ONCE here and passes it to the 3 smaller components.
export default function StatusReportPage() {
  const [waterPoints, setWaterPoints] = useState([]);
  const [reports, setReports] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get all water points (uses the API made in Module 1)
  async function loadWaterPoints() {
    try {
      const response = await fetch("/api/water-points");
      const result = await response.json();

      if (result.success) {
        setWaterPoints(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Could not load water points. Is the server running?");
    }

    setLoading(false);
  }

  // Get the report history (all, or only one water point)
  async function loadReports(waterPointId) {
    try {
      const response = await fetch("/api/status-reports?waterPointId=" + waterPointId);
      const result = await response.json();

      if (result.success) {
        setReports(result.data);
      }
    } catch (err) {
      setError("Could not load reports.");
    }
  }

  // Load water points once when the page opens
  useEffect(() => {
    loadWaterPoints();
  }, []);

  // Load reports when the page opens and whenever the history filter changes
  useEffect(() => {
    loadReports(historyFilter);
  }, [historyFilter]);

  // The form calls this after a report is saved, so the lists refresh
  function handleReportSubmitted() {
    loadWaterPoints();
    loadReports(historyFilter);
  }

  return (
    <div>
      <h1 className="page-title">Report Water Point Status</h1>
      <p className="page-subtitle">
        Help other students: tell everyone what the water point is like right now.
      </p>

      {error && <div className="message message-error">{error}</div>}

      {loading ? (
        <div className="message">Loading...</div>
      ) : (
        <>
          <ReportForm waterPoints={waterPoints} onSubmitted={handleReportSubmitted} />

          <LatestStatusList waterPoints={waterPoints} />

          <ReportHistory
            reports={reports}
            waterPoints={waterPoints}
            filter={historyFilter}
            setFilter={setHistoryFilter}
          />
        </>
      )}
    </div>
  );
}
