import {
  statusOptions,
  priorityOptions,
  MAX_TEXT_LENGTH,
  MAX_STAFF_NAME_LENGTH,
} from "./maintenanceOptions";

// Both functions return an object of error messages.
// An EMPTY object {} means everything is valid.

// Used when staff CREATE a request from a student report
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

  if (!data.assignedTo || data.assignedTo.trim() === "") {
    errors.assignedTo = "Please enter the assigned staff member's name.";
  } else if (data.assignedTo.length > MAX_STAFF_NAME_LENGTH) {
    errors.assignedTo = `Staff name must be ${MAX_STAFF_NAME_LENGTH} characters or less.`;
  }

  return errors;
}

// Used when staff UPDATE an existing request
export function validateUpdate(data) {
  const errors = {};

  if (!statusOptions.includes(data.status)) {
    errors.status = "Please choose a status.";
  }

  if (!priorityOptions.includes(data.priority)) {
    errors.priority = "Please choose a priority.";
  }

  if (!data.assignedTo || data.assignedTo.trim() === "") {
    errors.assignedTo = "Please enter the assigned staff member's name.";
  } else if (data.assignedTo.length > MAX_STAFF_NAME_LENGTH) {
    errors.assignedTo = `Staff name must be ${MAX_STAFF_NAME_LENGTH} characters or less.`;
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

  return errors;
}
