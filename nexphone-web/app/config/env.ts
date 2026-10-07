export type Flavor = "dev" | "staging" | "prod";

export interface AppConfig {
  flavor: Flavor;
  appName: string;
  apiUrl: string;
  isDev: boolean;
  isStaging: boolean;
  isProd: boolean;
}

const rawEnv = (process.env.NEXT_PUBLIC_APP_ENV || "dev").toLowerCase();
const flavor: Flavor =
  rawEnv === "staging" ? "staging" : rawEnv === "prod" ? "prod" : "dev";

export const appConfig: AppConfig = Object.freeze({
  flavor,
  appName: process.env.NEXT_PUBLIC_APP_TITLE || "NexPhone",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  isDev: flavor === "dev",
  isStaging: flavor === "staging",
  isProd: flavor === "prod",
});
