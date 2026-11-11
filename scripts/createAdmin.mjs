// Creates the FIRST administrator account.
// Run it in your terminal (NOT in the browser):
//
//     npm run create-admin
//
// It reads MONGODB_URI from your .env.local file, asks for a name,
// username and password, and saves the admin in MongoDB.

import readline from "node:readline/promises";
import mongoose from "mongoose";
import Staff from "../src/models/Staff.js";
import { hashPassword } from "../src/lib/password.js";
import { validateNewStaff } from "../src/modules/staff-auth/validateStaff.js";

if (!process.env.MONGODB_URI) {
  console.log("MONGODB_URI was not found. Run this with:  npm run create-admin");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// This makes the typed password invisible in the terminal
let hidden = false;
const originalWrite = rl._writeToOutput;
rl._writeToOutput = function (text) {
  if (!hidden) originalWrite.call(rl, text);
};

async function askHidden(question) {
  process.stdout.write(question);
  hidden = true;
  const answer = await rl.question("");
  hidden = false;
  console.log("");
  return answer;
}

console.log("\n=== Create the first administrator ===\n");

const name = await rl.question("Full name: ");
const username = await rl.question("Username (letters, numbers, underscore): ");
const password = await askHidden("Password (at least 8 characters): ");
const confirm = await askHidden("Type the password again: ");
rl.close();

if (password !== confirm) {
  console.log("\nThe two passwords do not match. Nothing was created.");
  process.exit(1);
}

const errors = validateNewStaff({ name, username, password });
if (Object.keys(errors).length > 0) {
  console.log("\nPlease fix these problems and run the command again:");
  Object.values(errors).forEach((message) => console.log(" - " + message));
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);

  const cleanUsername = username.trim().toLowerCase();
  const existing = await Staff.findOne({ username: cleanUsername });

  if (existing) {
    console.log(`\nThe username "${cleanUsername}" already exists. Nothing was created.`);
  } else {
    await Staff.create({
      name: name.trim(),
      username: cleanUsername,
      passwordHash: hashPassword(password),
      role: "admin",
    });
    console.log(`\nAdministrator "${cleanUsername}" created successfully.`);
    console.log("You can now log in at http://localhost:3000/login");
  }
} catch (error) {
  console.log("\nCould not save the admin: " + error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
