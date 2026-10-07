import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { config } from "./config/env";

export const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.corsOrigins.length === 0 ||
        config.corsOrigins.includes(origin) ||
        config.isDev
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] \x1b[35m${req.method}\x1b[0m ${req.url} - flavor:\x1b[32m${config.flavor}\x1b[0m`);
  next();
});

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    app: config.appName,
    flavor: config.flavor,
    status: "online",
    docs: "/api/info",
  });
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    flavor: config.flavor,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Flavor inspection endpoint
app.get("/api/flavor", (_req: Request, res: Response) => {
  res.json({
    flavor: config.flavor,
    isDev: config.isDev,
    isStaging: config.isStaging,
    isProd: config.isProd,
    appName: config.appName,
    port: config.port,
    corsOrigins: config.corsOrigins,
  });
});

// Mock Fleet devices endpoint (matching NexPhone Admin requirements)
app.get("/api/devices", (_req: Request, res: Response) => {
  const flavorPrefix = config.flavor === "prod" ? "NX" : `NX-${config.flavor.toUpperCase()}`;
  res.json([
    {
      id: "dev-001",
      serialNumber: `${flavorPrefix}-8821-A`,
      model: "NexPhone Pro Max X",
      firmwareVersion: "v2.4.12",
      status: "online",
      batteryLevel: 94,
      lastPingAt: new Date().toISOString(),
      location: "San Francisco, US",
      environment: config.flavor,
    },
    {
      id: "dev-002",
      serialNumber: `${flavorPrefix}-8821-B`,
      model: "NexPhone Enterprise",
      firmwareVersion: "v2.4.10",
      status: "online",
      batteryLevel: 82,
      lastPingAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      location: "Tokyo, JP",
      environment: config.flavor,
    },
    {
      id: "dev-003",
      serialNumber: `${flavorPrefix}-7200-E`,
      model: "NexPhone Lite",
      firmwareVersion: "v2.3.9",
      status: "maintenance",
      batteryLevel: 41,
      lastPingAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      location: "Berlin, DE",
      environment: config.flavor,
    },
    {
      id: "dev-004",
      serialNumber: `${flavorPrefix}-9000-X`,
      model: "NexPhone Pro Max X",
      firmwareVersion: "v2.5.0-rc1",
      status: "provisioning",
      batteryLevel: 100,
      lastPingAt: new Date().toISOString(),
      location: "Singapore, SG",
      environment: config.flavor,
    },
  ]);
});

// Dashboard metrics summary endpoint
app.get("/api/dashboard/metrics", (_req: Request, res: Response) => {
  res.json({
    totalRevenue: {
      value: config.flavor === "prod" ? "$142,850" : config.flavor === "staging" ? "$84,200" : "$12,450",
      changePercentage: 14.8,
      trend: "up",
      periodLabel: `vs prior 30 days [${config.flavor.toUpperCase()}]`,
    },
    activeDevices: {
      value: config.flavor === "prod" ? "8,420" : config.flavor === "staging" ? "1,250" : "42",
      changePercentage: 5.2,
      trend: "up",
      periodLabel: "98.2% fleet online",
    },
    systemHealth: {
      value: "99.98%",
      changePercentage: -0.01,
      trend: "down",
      periodLabel: "VoIP gateway uptime",
    },
    supportTickets: {
      value: "14",
      changePercentage: 0,
      trend: "neutral",
      periodLabel: "pending tier-2 triage",
    },
  });
});
