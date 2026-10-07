import { app } from "./app";
import { config } from "./config/env";
import { connectDatabase } from "./config/database";

async function bootstrap() {
  const server = app.listen(config.port, () => {
    console.log(`🚀 [NexPhone API] Server running at http://localhost:${config.port}`);
    console.log(`📡 Flavor: \x1b[33m${config.flavor.toUpperCase()}\x1b[0m | Health: http://localhost:${config.port}/api/health\n`);
  });

  // Connect database asynchronously without blocking HTTP readiness
  connectDatabase().catch((err) => {
    console.warn("⚠️  [Database] Initial connection warning:", err.message);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log("\n🛑 Gracefully shutting down NexPhone API...");
    server.close(() => {
      console.log("👋 HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch((err) => {
  console.error("❌ Fatal error during bootstrap:", err);
  process.exit(1);
});
