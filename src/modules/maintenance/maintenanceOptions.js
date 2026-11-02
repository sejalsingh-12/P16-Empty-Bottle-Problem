// Values and simple rules for Module 3, kept in ONE place.

export const statusOptions = ["Pending", "In Progress", "Completed"];
export const priorityOptions = ["Low", "Medium", "High"];

// For the dashboard filter buttons
export const filterOptions = ["All", "Pending", "In Progress", "Completed"];

export const MAX_TEXT_LENGTH = 500;
export const MAX_STAFF_NAME_LENGTH = 50;

// RULE: a student report "needs maintenance attention" if the water point
// is not working, OR has no water, OR is dirty. (This is a MongoDB query.)
export const attentionFilter = {
  $or: [
    { isWorking: false },
    { availability: "Not Available" },
    { cleanliness: "Dirty" },
  ],
};

// Builds the "reported problem" text from a report.
// Example: "Not working, Not available, Dirty. Student note: no water since morning"
export function buildProblemText(report) {
  const problems = [];

  if (report.isWorking === false) problems.push("Not working");
  if (report.availability === "Not Available") problems.push("Not available");
  if (report.cleanliness === "Dirty") problems.push("Dirty");

  let text = problems.join(", ");

  if (report.description) {
    text = text + ". Student note: " + report.description;
  }

  return text;
}

// Suggests a priority (staff can change it in the form)
export function suggestPriority(report) {
  if (report.isWorking === false) return "High";
  if (report.availability === "Not Available") return "Medium";
  return "Low";
}
