"use client";

import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import CreateRequestForm from "./CreateRequestForm";

// Lists the student reports that need maintenance attention (admin only).
export default function ReportsToReview({ reports, staffList, onRequestCreated }) {
  // The report the admin clicked "Create Request" on (or null)
  const [selectedReport, setSelectedReport] = useState(null);

  function handleCreated(message) {
    setSelectedReport(null); // close the form
    onRequestCreated(message);
  }

  return (
    <section>
      <h2 className="mt-heading">Student Reports That Need Attention</h2>
      <p className="mt-help">
        These reports say a water point is not working, has no water, or is dirty.
      </p>

      {/* The form opens here when a report is selected */}
      {selectedReport && (
        <CreateRequestForm
          report={selectedReport}
          staffList={staffList}
          onCreated={handleCreated}
          onCancel={() => setSelectedReport(null)}
        />
      )}

      {reports.length === 0 ? (
        <div className="message">
          No student reports need attention right now. 🎉
        </div>
      ) : (
        <div className="mt-list">
          {reports.map((report) => (
            <div className="mt-card" key={report._id}>
              <div className="mt-card-top">
                <div>
                  <span className="mt-id">{report.waterPointId}</span>
                  <h3>{report.waterPointName}</h3>
                  <p className="mt-location">
                    📍 {report.building}, {report.floor}
                  </p>
                </div>
                <span className="mt-date">
                  Reported: {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="mt-problem">
                <b>Reported problem:</b> {report.problem}
              </p>

              <div className="mt-badge-row">
                <StatusBadge label={report.availability} />
                <StatusBadge label={report.cleanliness} />
                <StatusBadge label={report.temperature} />
                <StatusBadge label={report.isWorking ? "Working" : "Not Working"} />
              </div>

              {report.hasRequest ? (
                <p className="mt-done-text">✅ Maintenance request already created</p>
              ) : (
                <button
                  className="btn btn-primary mt-small-btn"
                  onClick={() => setSelectedReport(report)}
                >
                  Create Request
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
