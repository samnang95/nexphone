import mongoose from "mongoose";
import { config } from "./env";
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
export async function connectDatabase(): Promise<void> {
  mongoose.connection.on("error", (err) => {
    console.error("❌ [Database] Connection error:", err.message);
  });

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
    const message = (error as Error).message;
    if (config.isDev || config.allowStandaloneMode) {
      console.warn(`⚠️  [Database] MongoDB connection failed (${message}). API running in standalone mock mode.`);
      return;
    }
    throw new Error(`MongoDB connection failed (${message}). Refusing to start in ${config.flavor} without a database.`);
  }
}
