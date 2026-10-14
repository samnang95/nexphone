import { Router, type Request, type Response } from "express";
import { config } from "../config/env";
import * as settingsController from "../controllers/settings.controller";

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

// Health check endpoints (/health, /api/health, and container orchestration probes)
systemRouter.get(
  ["/health", "/api/health", "/healthz", "/livez", "/readyz"],
  settingsController.getHealthCheck
);

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
