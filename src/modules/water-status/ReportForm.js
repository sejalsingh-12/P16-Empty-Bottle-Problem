"use client";

import { useState } from "react";
import {
  availabilityOptions,
  cleanlinessOptions,
  temperatureOptions,
  workingOptions,
  usageOptions,
  emptyForm,
  MAX_DESCRIPTION_LENGTH,
} from "./statusOptions";
import { validateReport } from "./validateReport";

// A helper that shows one dropdown + its error message
function FormSelect({ label, name, value, options, onChange, error }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        <option value="">-- Select --</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default function ReportForm({ waterPoints, onSubmitted }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Runs whenever the student types or picks something
  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the page from reloading
    setSuccessMessage("");
    setServerError("");

    // Turn the form values into the data the API expects.
    // "Working" -> true, "Not Working" -> false
    let isWorking = "";
    if (form.working === "Working") isWorking = true;
    if (form.working === "Not Working") isWorking = false;

    const data = {
      waterPointId: form.waterPointId,
      availability: form.availability,
      cleanliness: form.cleanliness,
      temperature: form.temperature,
      isWorking: isWorking,
      usageStatus: form.usageStatus,
      description: form.description.trim(),
    };

    // 1. Check the form BEFORE sending it
    const validationErrors = validateReport(data);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // stop here, the errors are shown under the fields
    }

    // 2. Send the report to the API
    setSubmitting(true);

    try {
      const response = await fetch("/api/status-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message);
        setForm(emptyForm); // clear the form
        onSubmitted(); // tell the page to refresh the lists
      } else {
        if (result.errors) setErrors(result.errors);
        setServerError(result.message);
      }
    } catch (err) {
      setServerError("Could not submit the report. Is the server running?");
    }

    setSubmitting(false);
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <h2>📝 Submit a Report</h2>

      {successMessage && <div className="success-box">✅ {successMessage}</div>}
      {serverError && <div className="message message-error">{serverError}</div>}

      <div className="form-group">
        <label>Water Point</label>
        <select name="waterPointId" value={form.waterPointId} onChange={handleChange}>
          <option value="">-- Select a water point --</option>
          {waterPoints.map((wp) => (
            <option key={wp.waterPointId} value={wp.waterPointId}>
              {wp.waterPointId} - {wp.name} ({wp.building})
            </option>
          ))}
        </select>
        {errors.waterPointId && <span className="field-error">{errors.waterPointId}</span>}
      </div>

      <div className="form-grid">
        <FormSelect label="Water Availability" name="availability" value={form.availability} options={availabilityOptions} onChange={handleChange} error={errors.availability} />
        <FormSelect label="Cleanliness" name="cleanliness" value={form.cleanliness} options={cleanlinessOptions} onChange={handleChange} error={errors.cleanliness} />
        <FormSelect label="Water Temperature" name="temperature" value={form.temperature} options={temperatureOptions} onChange={handleChange} error={errors.temperature} />
        <FormSelect label="Working Condition" name="working" value={form.working} options={workingOptions} onChange={handleChange} error={errors.working} />
        <FormSelect label="Usage / Crowd Status" name="usageStatus" value={form.usageStatus} options={usageOptions} onChange={handleChange} error={errors.usageStatus} />
      </div>

      <div className="form-group">
        <label>Description (optional)</label>
        <textarea
          name="description"
          rows="3"
          placeholder="Example: Water is very slow, long queue after lunch..."
          value={form.description}
          onChange={handleChange}
        />
        <span className="char-count">
          {form.description.length} / {MAX_DESCRIPTION_LENGTH}
        </span>
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}
