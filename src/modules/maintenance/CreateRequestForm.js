"use client";

import { useState } from "react";
import Link from "next/link";
import { priorityOptions, MAX_TEXT_LENGTH } from "./maintenanceOptions";
import { validateNewRequest } from "./validateRequest";

// A form to create a maintenance request from ONE student report.
// The issue description and priority are pre-filled from the report.
// The staff member is chosen from the list of real staff accounts.
export default function CreateRequestForm({ report, staffList, onCreated, onCancel }) {
  const [form, setForm] = useState({
    issueDescription: report.problem,
    priority: report.suggestedPriority,
    assignedToStaffId: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const data = {
      statusReportId: report._id,
      issueDescription: form.issueDescription,
      priority: form.priority,
      assignedToStaffId: form.assignedToStaffId,
    };

    // 1. Check the form BEFORE sending it
    const validationErrors = validateNewRequest(data);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // 2. Send it to the API
    setSubmitting(true);

    try {
      const response = await fetch("/api/maintenance/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const result = await response.json();

      if (result.success) {
        onCreated(result.message);
        return;
      }

      if (result.errors) setErrors(result.errors);
      setServerError(result.message);
    } catch (err) {
      setServerError("Could not create the request. Is the server running?");
    }

    setSubmitting(false);
  }

  return (
    <form className="mt-form" onSubmit={handleSubmit}>
      <h3>
        Create Maintenance Request for {report.waterPointId} - {report.waterPointName}
      </h3>

      {serverError && <div className="message message-error">{serverError}</div>}

      <div className="mt-form-group">
        <label>Issue Description</label>
        <textarea
          name="issueDescription"
          rows="3"
          value={form.issueDescription}
          onChange={handleChange}
        />
        <span className="mt-char-count">
          {form.issueDescription.length} / {MAX_TEXT_LENGTH}
        </span>
        {errors.issueDescription && (
          <span className="mt-field-error">{errors.issueDescription}</span>
        )}
      </div>

      <div className="mt-form-row">
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
          <label>Assign To (Staff Member)</label>
          <select
            name="assignedToStaffId"
            value={form.assignedToStaffId}
            onChange={handleChange}
          >
            <option value="">-- Select staff --</option>
            {staffList.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} (@{member.username})
              </option>
            ))}
          </select>
          {staffList.length === 0 && (
            <span className="mt-field-error">
              No staff accounts yet. Add one on the{" "}
              <Link href="/admin/staff">Manage Staff</Link> page.
            </span>
          )}
          {errors.assignedToStaffId && (
            <span className="mt-field-error">{errors.assignedToStaffId}</span>
          )}
        </div>
      </div>

      <div className="mt-button-row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create Request"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
