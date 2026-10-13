import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { createRateLimiter } from "../../middleware/rateLimit";
import { requireDatabase } from "../../middleware/requireDatabase";
import { validate } from "../../middleware/validate";
import * as controller from "./auth.controller";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schemas";

export const authRouter = Router();

authRouter.use(requireDatabase);

authRouter.post(
  "/register",
  createRateLimiter(),
  validate({ body: registerSchema }),
  controller.register
);
authRouter.post(
  "/login",
  createRateLimiter({ skipSuccessfulRequests: true }),
  validate({ body: loginSchema }),
  controller.login
);
authRouter.post(
  "/admin/login",
  createRateLimiter({ skipSuccessfulRequests: true }),
  validate({ body: loginSchema }),
  controller.adminLogin
);
authRouter.post("/logout", controller.logout);
authRouter.post(
  ["/refresh-token", "/refresh"],
  createRateLimiter(),
  validate({ body: refreshTokenSchema }),
  controller.refreshToken
);
authRouter.post(
  "/forgot-password",
  createRateLimiter(),
  validate({ body: forgotPasswordSchema }),
  controller.forgotPassword
);
authRouter.post(
  "/reset-password",
  createRateLimiter(),
  validate({ body: resetPasswordSchema }),
  controller.resetPassword
);
authRouter.get("/me", authenticate, controller.me);
authRouter.post(
  "/change-password",
  createRateLimiter({ skipSuccessfulRequests: true }),
  authenticate,
  validate({ body: changePasswordSchema }),
  controller.changePassword
);
