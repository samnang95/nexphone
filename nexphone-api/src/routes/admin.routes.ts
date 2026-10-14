import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  updateAdminProfileSchema,
  changeAdminPasswordSchema,
  listAdminsQuerySchema,
  createAdminAccountSchema,
  updateAdminAccountSchema,
  disableAdminAccountSchema,
} from "../validators/admin.validator";
import * as controller from "../controllers/admin.controller";

export const adminRouter = Router();

// Enforce authentication & admin authorization across all endpoints
adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

// ==========================================
// 1. Get & Update Admin Profile
// ==========================================
adminRouter.get(["/profile", "/me"], controller.getAdminProfile);
adminRouter.put("/profile", validate({ body: updateAdminProfileSchema }), controller.updateAdminProfile);
adminRouter.patch("/profile", validate({ body: updateAdminProfileSchema }), controller.updateAdminProfile);

// ==========================================
// 2. Change Admin Password
// ==========================================
adminRouter.post("/change-password", validate({ body: changeAdminPasswordSchema }), controller.changeAdminPassword);
adminRouter.put("/change-password", validate({ body: changeAdminPasswordSchema }), controller.changeAdminPassword);
adminRouter.post("/password", validate({ body: changeAdminPasswordSchema }), controller.changeAdminPassword);

// ==========================================
// 3. Admin Accounts Management
// ==========================================
adminRouter.get(["/accounts", "/users"], validate({ query: listAdminsQuerySchema }), controller.listAdminAccounts);
adminRouter.post(["/accounts", "/users"], validate({ body: createAdminAccountSchema }), controller.createAdminAccount);

// Disable / Enable actions (declared before generic :id to prevent collision)
adminRouter.patch(["/accounts/:id/disable", "/users/:id/disable"], validate({ body: disableAdminAccountSchema }), controller.disableAdminAccount);
adminRouter.put(["/accounts/:id/disable", "/users/:id/disable"], validate({ body: disableAdminAccountSchema }), controller.disableAdminAccount);
adminRouter.post(["/accounts/:id/disable", "/users/:id/disable"], validate({ body: disableAdminAccountSchema }), controller.disableAdminAccount);
adminRouter.delete(["/accounts/:id", "/users/:id"], validate({ body: disableAdminAccountSchema }), controller.disableAdminAccount);

adminRouter.patch(["/accounts/:id/enable", "/users/:id/enable"], controller.enableAdminAccount);
adminRouter.post(["/accounts/:id/enable", "/users/:id/enable"], controller.enableAdminAccount);

// Update account
adminRouter.put(["/accounts/:id", "/users/:id"], validate({ body: updateAdminAccountSchema }), controller.updateAdminAccount);
adminRouter.patch(["/accounts/:id", "/users/:id"], validate({ body: updateAdminAccountSchema }), controller.updateAdminAccount);
