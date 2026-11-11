"use client";

import { useState, useEffect } from "react";
import StaffBar from "./StaffBar";
import { validateNewStaff, validatePassword } from "./validateStaff";
import "./auth.css";

// One row of the staff list, with Deactivate / Activate and Reset Password.
function StaffRow({ member, currentStaffId, onChanged, onMessage, onError }) {
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const isMe = member._id === currentStaffId;

  // Sends a change to the API (activate/deactivate or new password)
  async function sendUpdate(body) {
    onMessage("");
    onError("");

    try {
      const response = await fetch("/api/staff/" + member._id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return false;
      }

      const result = await response.json();

      if (result.success) {
        onMessage(result.message);
        onChanged();
        return true;
      }

      onError(result.message);
    } catch (err) {
      onError("Could not update the account.");
    }

    return false;
  }

  async function handleToggleActive() {
    await sendUpdate({ isActive: !member.isActive });
  }

  async function handleResetPassword() {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      onError(passwordError);
      return;
    }

    const done = await sendUpdate({ newPassword: newPassword });
    if (done) {
      setNewPassword("");
      setShowReset(false);
    }
  }

  return (
    <div className="sa-staff-row">
      <div className="sa-staff-info">
        <b>{member.name}</b>
        <span className="sa-username">@{member.username}</span>
        <span className={member.role === "admin" ? "badge badge-blue" : "badge badge-grey"}>
          {member.role === "admin" ? "Admin" : "Staff"}
        </span>
        <span className={member.isActive ? "badge badge-green" : "badge badge-red"}>
          {member.isActive ? "Active" : "Deactivated"}
        </span>
      </div>

      <div className="sa-row-buttons">
        <button className="btn btn-outline sa-small" onClick={() => setShowReset(!showReset)}>
          Reset Password
        </button>

        {!isMe && (
          <button className="btn btn-outline sa-small" onClick={handleToggleActive}>
            {member.isActive ? "Deactivate" : "Activate"}
          </button>
        )}
      </div>

      {showReset && (
        <div className="sa-reset-box">
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
          <button className="btn btn-primary sa-small" onClick={handleResetPassword}>
            Save New Password
          </button>
        </div>
      )}
    </div>
  );
}

export default function StaffManagement({ staff }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function loadStaff() {
    try {
      const response = await fetch("/api/staff");

      if (response.status === 401 || response.status === 403) {
        window.location.href = "/login";
        return;
      }

      const result = await response.json();

      if (result.success) {
        setStaffList(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Could not load the staff list.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleAddStaff(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    // 1. Check the form BEFORE sending it
    const validationErrors = validateNewStaff(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // 2. Send it to the API
    setSubmitting(true);

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        setForm({ name: "", username: "", password: "" });
        loadStaff();
      } else {
        if (result.errors) setErrors(result.errors);
        setError(result.message);
      }
    } catch (err) {
      setError("Could not create the account.");
    }

    setSubmitting(false);
  }

  return (
    <div>
      <h1 className="page-title">Manage Staff Accounts</h1>
      <p className="page-subtitle">
        Only administrators can create staff accounts. Staff cannot register themselves.
      </p>

      <StaffBar staff={staff} current="staff" />

      {message && <div className="sa-success-box">✅ {message}</div>}
      {error && <div className="message message-error">{error}</div>}

      <form className="sa-add-form" onSubmit={handleAddStaff}>
        <h2>➕ Add a Staff Member</h2>

        <div className="sa-form-row">
          <div className="sa-form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} />
            {errors.name && <span className="sa-field-error">{errors.name}</span>}
          </div>

          <div className="sa-form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.username && <span className="sa-field-error">{errors.username}</span>}
          </div>

          <div className="sa-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <span className="sa-field-error">{errors.password}</span>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary sa-small" disabled={submitting}>
          {submitting ? "Creating..." : "Create Staff Account"}
        </button>
      </form>

      <h2 className="sa-list-title">All Accounts</h2>

      {loading ? (
        <div className="message">Loading...</div>
      ) : (
        <div className="sa-staff-list">
          {staffList.map((member) => (
            <StaffRow
              key={member._id}
              member={member}
              currentStaffId={staff.id}
              onChanged={loadStaff}
              onMessage={setMessage}
              onError={setError}
            />
          ))}
        </div>
      )}
    </div>
  );
}
