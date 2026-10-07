import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

export type Flavor = "dev" | "staging" | "prod";

/**
 * Parses a CLI argument formatted as --key=value or --key value
 */
function parseCliFlag(name: string): string | null {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (arg) {
    return arg.slice(prefix.length);
  }
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1]!;
  }
  return null;
}

/**
 * Normalizes raw flavor input to standard 'dev' | 'staging' | 'prod'
 */
function normalizeFlavor(val?: string | null): Flavor {
  const lower = (val || "").toLowerCase().trim();
  if (["dev", "development", "local"].includes(lower)) return "dev";
  if (["staging", "stage", "qa", "test"].includes(lower)) return "staging";
  if (["prod", "production", "live"].includes(lower)) return "prod";
  return "dev";
}

// 1. Detect flavor
const rawFlavor =
  parseCliFlag("flavor") ||
  parseCliFlag("env") ||
  process.env.FLAVOR ||
  process.env.APP_ENV ||
  process.env.NODE_ENV ||
  "dev";

export const activeFlavor: Flavor = normalizeFlavor(rawFlavor);

// 2. Cascade load .env files
const rootDir = path.resolve(__dirname, "../../");
const candidateFiles = [
  `.env.${activeFlavor}.local`,
  `.env.${activeFlavor}`,
  ".env.local",
  ".env",
];

export const loadedEnvFiles: string[] = [];

for (const file of candidateFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    const result = dotenv.config({ path: fullPath, override: false });
    if (!result.error) {
      loadedEnvFiles.push(file);
    }
  }
}

// Standardize system envs
const nodeEnvMap: Record<Flavor, string> = {
  dev: "development",
  staging: "staging",
  prod: "production",
};

process.env.NODE_ENV = nodeEnvMap[activeFlavor];
process.env.FLAVOR = activeFlavor;
process.env.APP_ENV = activeFlavor;

export interface AppConfig {
  flavor: Flavor;
  isDev: boolean;
  isStaging: boolean;
  isProd: boolean;
  port: number;
  appName: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
}

export const config: AppConfig = Object.freeze({
  flavor: activeFlavor,
  isDev: activeFlavor === "dev",
  isStaging: activeFlavor === "staging",
  isProd: activeFlavor === "prod",
  port: Number(process.env.PORT) || (activeFlavor === "staging" ? 4001 : 4000),
  appName: process.env.APP_NAME || `NexPhone API (${activeFlavor.toUpperCase()})`,
  mongodbUri:
    process.env.MONGODB_URI || `mongodb://localhost:27017/nexphone_${activeFlavor}`,
  jwtSecret: process.env.JWT_SECRET || `nexphone_fallback_secret_${activeFlavor}`,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
});

console.log(
  `\x1b[36m🌿 [NexPhone API Flavor]\x1b[0m Active Flavor: \x1b[1m\x1b[32m${config.flavor.toUpperCase()}\x1b[0m | Port: \x1b[33m${config.port}\x1b[0m | NodeEnv: ${process.env.NODE_ENV}`
);
if (loadedEnvFiles.length > 0) {
  console.log(`   📁 Loaded env files: [ ${loadedEnvFiles.join(", ")} ]`);
}
