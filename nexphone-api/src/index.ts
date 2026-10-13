import { startServer } from "./server";

startServer().catch((err) => {
  console.error("❌ Fatal error during bootstrap:", err);
  process.exit(1);
});
