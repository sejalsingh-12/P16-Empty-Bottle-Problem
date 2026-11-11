import {
  statusOptions,
  priorityOptions,
  MAX_TEXT_LENGTH,
} from "./maintenanceOptions";

// Both functions return an object of error messages.
// An EMPTY object {} means everything is valid.

// Used when an ADMIN creates a request from a student report
export function validateNewRequest(data) {
  const errors = {};

  if (!data.statusReportId) {
    errors.statusReportId = "No student report was selected.";
  }

  if (!data.issueDescription || data.issueDescription.trim() === "") {
    errors.issueDescription = "Please describe the issue.";
  } else if (data.issueDescription.length > MAX_TEXT_LENGTH) {
    errors.issueDescription = `Issue description must be ${MAX_TEXT_LENGTH} characters or less.`;
  }

  if (!priorityOptions.includes(data.priority)) {
    errors.priority = "Please choose a priority.";
  }

  if (!data.assignedToStaffId) {
    errors.assignedToStaffId = "Please choose a staff member to assign.";
  }

  return errors;
}

// Used when someone UPDATES an existing request.
//  - Everyone checks the status and the note.
//  - Only an admin (isAdmin = true) also changes priority and assigned staff.
export function validateUpdate(data, isAdmin) {
  const errors = {};

  if (!statusOptions.includes(data.status)) {
    errors.status = "Please choose a status.";
  }

  if (data.maintenanceNote && data.maintenanceNote.length > MAX_TEXT_LENGTH) {
    errors.maintenanceNote = `Note must be ${MAX_TEXT_LENGTH} characters or less.`;
  }

  // Rule: a note about the repair is required to mark a task Completed
  if (
    data.status === "Completed" &&
    (!data.maintenanceNote || data.maintenanceNote.trim() === "")
  ) {
    errors.maintenanceNote =
      "Please write a note about the repair or action taken before marking Completed.";
  }

  if (isAdmin) {
    if (!priorityOptions.includes(data.priority)) {
      errors.priority = "Please choose a priority.";
    }

    if (!data.assignedToStaffId) {
      errors.assignedToStaffId = "Please choose a staff member to assign.";
    }
  }

  return errors;
}
