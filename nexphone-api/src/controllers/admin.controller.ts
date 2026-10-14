import type { Request, Response } from "express";
import { adminService } from "../services/admin.service";

// ==========================================
// 1. Get Admin Profile
// ==========================================
export async function getAdminProfile(req: Request, res: Response): Promise<void> {
  const result = await adminService.getAdminProfile(req.auth?.user);
  res.json({
    success: true,
    admin: result,
    ...result,
  });
}

// ==========================================
// 2. Update Admin Profile
// ==========================================
export async function updateAdminProfile(req: Request, res: Response): Promise<void> {
  const result = await adminService.updateAdminProfile(req.auth?.user, req.body);
  res.json({
    success: true,
    message: "Admin profile updated successfully.",
    admin: result,
    ...result,
  });
}

// ==========================================
// 3. Change Admin Password
// ==========================================
export async function changeAdminPassword(req: Request, res: Response): Promise<void> {
  const result = await adminService.changeAdminPassword(req.auth?.user, req.body);
  res.json(result);
}

// ==========================================
// 4. List Admin Accounts
// ==========================================
export async function listAdminAccounts(req: Request, res: Response): Promise<void> {
  const result = await adminService.listAdminAccounts({
    role: req.query.role as string,
    status: req.query.status as string,
    search: req.query.search as string,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json(result);
}

// ==========================================
// 5. Create Admin Account (Protected)
// ==========================================
export async function createAdminAccount(req: Request, res: Response): Promise<void> {
  const result = await adminService.createAdminAccount(req.body, req.auth?.user);
  res.status(201).json(result);
}

// ==========================================
// 6. Update Admin Account (Protected)
// ==========================================
export async function updateAdminAccount(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await adminService.updateAdminAccount(id, req.body, req.auth?.user);
  res.json(result);
}

// ==========================================
// 7. Disable Admin Account (Protected)
// ==========================================
export async function disableAdminAccount(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const reason = req.body?.reason;
  const result = await adminService.disableAdminAccount(id, reason, req.auth?.user);
  res.json(result);
}

// ==========================================
// 8. Enable Admin Account (Protected)
// ==========================================
export async function enableAdminAccount(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await adminService.enableAdminAccount(id, req.auth?.user);
  res.json(result);
}
