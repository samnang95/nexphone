import mongoose from "mongoose";
import { config } from "./env";

// Note: do NOT set `bufferCommands = false` globally. Mongoose reads that option when a model is
// compiled, so its effect would depend on import order (models created earlier keep buffering) and
// it breaks autoIndex/autoCreate for models compiled before the connection opens. Routes that need
// the database are guarded by `requireDatabase`, which answers 503 immediately instead.

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Connects to MongoDB.
 *
 * - dev: logs a warning and keeps running so modules still backed by in-memory seed data work.
 * - staging/prod: throws, so the process can exit instead of serving from volatile memory.
 *   Set ALLOW_STANDALONE_MODE=true to opt out (not recommended).
 */
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
