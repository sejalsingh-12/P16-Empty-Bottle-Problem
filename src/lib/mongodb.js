import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

// Keep the connection in a global variable so Next.js
// does not open a new connection on every request.
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { connection: null, promise: null };
}

export default async function connectDB() {
  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.connection = await cached.promise;
  return cached.connection;
}
