"use client";

import { useState } from "react";
import "./auth.css";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (username.trim() === "" || password === "") {
      setError("Please enter your username and password.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      });
      const result = await response.json();

      if (result.success) {
        // A full page load, so the server sees the new login cookie
        window.location.href = "/maintenance";
        return;
      }

      setError(result.message);
    } catch (err) {
      setError("Could not log in. Is the server running?");
    }

    setSubmitting(false);
  }

  return (
    <div className="sa-login-wrapper">
      <form className="sa-login-box" onSubmit={handleSubmit}>
        <h1>🔐 Staff Login</h1>
        <p className="sa-login-text">
          Maintenance staff only. Accounts are created by the administrator.
        </p>

        {error && <div className="message message-error">{error}</div>}

        <div className="sa-form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="sa-form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
