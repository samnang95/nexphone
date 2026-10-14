import type { Request, Response } from "express";
import { settingsService } from "../services/settings.service";

function checkIsAdmin(req: Request): boolean {
  const role = req.auth?.user?.role;
  return role === "admin" || role === "super_admin";
}

// ==========================================
// 1. Store Settings
// ==========================================
export async function getStoreSettings(req: Request, res: Response): Promise<void> {
  const isAdmin = checkIsAdmin(req);
  const result = await settingsService.getStoreSettings(isAdmin);
  res.json(result);
}

export async function updateStoreSettings(req: Request, res: Response): Promise<void> {
  const result = await settingsService.updateStoreSettings(req.body, req.auth?.user);
  res.json(result);
}

// ==========================================
// 2. Shipping Settings
// ==========================================
export async function getShippingSettings(_req: Request, res: Response): Promise<void> {
  const result = await settingsService.getShippingSettings();
  res.json(result);
}

export async function updateShippingSettings(req: Request, res: Response): Promise<void> {
  const result = await settingsService.updateShippingSettings(req.body, req.auth?.user);
  res.json(result);
}

// ==========================================
// 3. Payment Settings
// ==========================================
export async function getPaymentSettings(req: Request, res: Response): Promise<void> {
  const isAdmin = checkIsAdmin(req);
  const result = await settingsService.getPaymentSettings(isAdmin);
  res.json(result);
}

export async function updatePaymentSettings(req: Request, res: Response): Promise<void> {
  const result = await settingsService.updatePaymentSettings(req.body, req.auth?.user);
  res.json(result);
}

// ==========================================
// 4. System Health Check
// ==========================================
export function getHealthCheck(_req: Request, res: Response): void {
  const result = settingsService.getHealthCheck();
  res.json(result);
}
