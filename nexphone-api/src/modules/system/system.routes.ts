import { Router, type Request, type Response } from "express";
import { config } from "../../config/env";

export const systemRouter = Router();

// Root route
systemRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    app: config.appName,
    flavor: config.flavor,
    status: "online",
    docs: "/api/info",
  });
});

// Health check endpoint
systemRouter.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    flavor: config.flavor,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Flavor inspection endpoint
systemRouter.get("/api/flavor", (_req: Request, res: Response) => {
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
