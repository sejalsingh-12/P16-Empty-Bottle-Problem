// Rules for staff accounts. Used by the admin form, the API and the
// create-admin script, so the rules are always the same.

export const MIN_PASSWORD_LENGTH = 8;

// Returns an error message, or "" if the password is fine
export function validatePassword(password) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 100) {
    return "Password must be 100 characters or less.";
  }
  return "";
}

// Returns an object of error messages. {} means everything is valid.
export function validateNewStaff(data) {
  const errors = {};

  const name = (data.name || "").trim();
  const username = (data.username || "").trim().toLowerCase();

  if (name === "") {
    errors.name = "Please enter the staff member's name.";
  } else if (name.length > 50) {
    errors.name = "Name must be 50 characters or less.";
  }

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    errors.username =
      "Username must be 3 to 30 characters: letters, numbers or underscore only.";
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}
