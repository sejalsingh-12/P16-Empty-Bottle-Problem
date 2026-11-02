import {
  availabilityOptions,
  cleanlinessOptions,
  temperatureOptions,
  usageOptions,
  MAX_DESCRIPTION_LENGTH,
} from "./statusOptions";

// Checks a report and returns an object of error messages.
// An EMPTY object {} means the report is valid.
//
// Example of a result: { availability: "Please choose availability." }
export function validateReport(data) {
  const errors = {};

  if (!data.waterPointId) {
    errors.waterPointId = "Please select a water point.";
  }

  if (!availabilityOptions.includes(data.availability)) {
    errors.availability = "Please choose availability.";
  }

  if (!cleanlinessOptions.includes(data.cleanliness)) {
    errors.cleanliness = "Please choose cleanliness.";
  }

  if (!temperatureOptions.includes(data.temperature)) {
    errors.temperature = "Please choose water temperature.";
  }

  if (typeof data.isWorking !== "boolean") {
    errors.working = "Please tell us if the water point is working.";
  }

  if (!usageOptions.includes(data.usageStatus)) {
    errors.usageStatus = "Please choose the usage / crowd status.";
  }

  // Rule: a broken water point cannot have water available
  if (
    data.isWorking === false &&
    availabilityOptions.includes(data.availability) &&
    data.availability !== "Not Available"
  ) {
    errors.availability =
      "A water point that is Not Working must be reported as Not Available.";
  }

  // Description is optional, but it must not be too long
  if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`;
  }

  return errors;
}
