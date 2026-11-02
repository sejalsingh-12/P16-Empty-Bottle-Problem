"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { statusOptions, priorityOptions, MAX_TEXT_LENGTH } from "./maintenanceOptions";
import { validateUpdate } from "./validateRequest";

// A small coloured label for the maintenance status and the priority.
// (Module 3 only. The shared StatusBadge is left untouched.)
const labelColors = {
  Pending: "yellow",
  "In Progress": "blue",
  Completed: "green",
  Low: "green",
  Medium: "orange",
  High: "red",
};

// "colorKey" decides the colour (e.g. "High"), "label" is the text shown
function MaintenanceBadge({ label, colorKey }) {
  const color = labelColors[colorKey] || "grey";
  return <span className={`badge badge-${color}`}>{label}</span>;
}

// Shows ONE maintenance request, and a form to update it.
export default function RequestCard({ request, onUpdated }) {
  const [form, setForm] = useState({
    status: request.status,
    priority: request.priority,
    assignedTo: request.assignedTo,
    maintenanceNote: request.maintenanceNote,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const isCompleted = request.status === "Completed";
  const waterPoint = request.waterPoint;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSave(event) {
    event.preventDefault();
    setMessage("");
    setServerError("");

    // 1. Check the form BEFORE sending it
    const validationErrors = validateUpdate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // 2. Send the update to the API
    setSaving(true);

    try {
      const response = await fetch("/api/maintenance/requests/" + request._id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        onUpdated(); // refresh the dashboard
      } else {
        if (result.errors) setErrors(result.errors);
        setServerError(result.message);
      }
    } catch (err) {
      setServerError("Could not save the changes. Is the server running?");
    }

    setSaving(false);
  }

  return (
    <div className="mt-card">
      <div className="mt-card-top">
        <div>
          <span className="mt-id">{request.waterPointId}</span>
          <h3>{waterPoint ? waterPoint.name : "Unknown water point"}</h3>
          {waterPoint && (
            <p className="mt-location">
              📍 {waterPoint.building}, {waterPoint.floor}
            </p>
          )}
        </div>
        <div className="mt-badge-row">
          <MaintenanceBadge label={request.priority + " Priority"} colorKey={request.priority} />
          <MaintenanceBadge label={request.status} colorKey={request.status} />
        </div>
      </div>

      <p className="mt-problem">
        <b>Issue:</b> {request.issueDescription}
      </p>

      <p className="mt-meta">
        👷 Assigned to: <b>{request.assignedTo}</b> &nbsp;|&nbsp; Created:{" "}
        {new Date(request.createdAt).toLocaleString()}
      </p>

      {/* The CURRENT status of the water point, so staff can verify it */}
      {waterPoint && (
        <div className="mt-current-status">
          <span>Current water point status:</span>
          <StatusBadge label={waterPoint.isWorking ? "Working" : "Not Working"} />
          <StatusBadge label={waterPoint.availability} />
          <StatusBadge label={waterPoint.cleanliness} />
          <StatusBadge label={waterPoint.temperature} />
        </div>
      )}

      {isCompleted ? (
        // ----- Completed requests are read-only -----
        <div className="mt-completed-box">
          <p>
            <b>Completed on:</b> {new Date(request.completedAt).toLocaleString()}
          </p>
          <p>
            <b>Repair note:</b> {request.maintenanceNote}
          </p>
          <p className="mt-verify">
            ⚠️ Maintenance is completed, but the water point status is{" "}
            <b>not</b> changed automatically. Please verify the water point and
            submit a new status report on the{" "}
            <Link href="/report">Report Status</Link> page.
          </p>
        </div>
      ) : (
        // ----- Update form for Pending / In Progress requests -----
        <form className="mt-update-form" onSubmit={handleSave}>
          {message && <div className="mt-success-box">✅ {message}</div>}
          {serverError && <div className="message message-error">{serverError}</div>}

          <div className="mt-form-row">
            <div className="mt-form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.status && <span className="mt-field-error">{errors.status}</span>}
            </div>

            <div className="mt-form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.priority && <span className="mt-field-error">{errors.priority}</span>}
            </div>

            <div className="mt-form-group">
              <label>Assigned Staff Member</label>
              <input
                type="text"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
              />
              {errors.assignedTo && <span className="mt-field-error">{errors.assignedTo}</span>}
            </div>
          </div>

          <div className="mt-form-group">
            <label>Maintenance Note (required to mark Completed)</label>
            <textarea
              name="maintenanceNote"
              rows="2"
              placeholder="Example: Replaced the filter and cleaned the tank."
              value={form.maintenanceNote}
              onChange={handleChange}
            />
            <span className="mt-char-count">
              {form.maintenanceNote.length} / {MAX_TEXT_LENGTH}
            </span>
            {errors.maintenanceNote && (
              <span className="mt-field-error">{errors.maintenanceNote}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary mt-small-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
