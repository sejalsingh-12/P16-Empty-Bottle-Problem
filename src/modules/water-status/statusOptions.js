// Dropdown values for the report form. Kept in ONE place so the form
// and the validation always use the same words.

export const availabilityOptions = ["Available", "Not Available"];
export const cleanlinessOptions = ["Clean", "Average", "Dirty"];
export const temperatureOptions = ["Cold", "Normal", "Warm"];
export const workingOptions = ["Working", "Not Working"];
export const usageOptions = ["Low", "Normal", "Crowded"];

// The longest description we allow
export const MAX_DESCRIPTION_LENGTH = 300;

// Starting (empty) values for the form
export const emptyForm = {
  waterPointId: "",
  availability: "",
  cleanliness: "",
  temperature: "",
  working: "",
  usageStatus: "",
  description: "",
};
