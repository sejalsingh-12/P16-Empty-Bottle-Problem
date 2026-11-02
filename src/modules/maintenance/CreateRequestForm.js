"use client";

import { useState } from "react";
import { priorityOptions, MAX_TEXT_LENGTH } from "./maintenanceOptions";
import { validateNewRequest } from "./validateRequest";

// A form to create a maintenance request from ONE student report.
// The issue description and priority are pre-filled from the report.
export default function CreateRequestForm({ report, onCreated, onCancel }) {
  const [form, setForm] = useState({
    issueDescription: report.problem,
    priority: report.suggestedPriority,
    assignedTo: "",
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
      assignedTo: form.assignedTo,
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
          <label>Assigned Staff Member</label>
          <input
            type="text"
            name="assignedTo"
            placeholder="Example: Ramesh Kumar"
            value={form.assignedTo}
            onChange={handleChange}
          />
          {errors.assignedTo && <span className="mt-field-error">{errors.assignedTo}</span>}
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
