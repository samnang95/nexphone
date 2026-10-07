import mongoose from "mongoose";
import { config } from "./env";

export async function connectDatabase(): Promise<void> {
  if (!config.mongodbUri) {
    console.warn("⚠️  [Database] MONGODB_URI is not set. Skipping DB connection.");
    return;
  }

  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`🗄️  [Database] Connected to MongoDB: ${config.mongodbUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`);
  } catch (error) {
    console.warn(`⚠️  [Database] MongoDB connection failed (${(error as Error).message}). API running in standalone mock mode.`);
  }

  mongoose.connection.on("error", (err) => {
    console.error("❌ [Database] Connection error:", err.message);
  });
}
