import { Types } from "mongoose";
import { adminRepository } from "../repositories/admin.repo";
import { User, type UserDocument } from "../models/user.model";
import { HttpError } from "../utils/httpError";
import { isDatabaseConnected } from "../config/database";
import { verifyPassword, hashPassword } from "../utils/password";
import { issueTokenPair } from "./token.service";
import {
  serializeAdminProfile,
  serializeAdminAccount,
  serializeAdminList,
} from "../views/admin.view";

export class AdminService {
  private resolveUserId(user: any): string {
    return String(user?._id || user?.id || "");
  }

  // ==========================================
  // 1. Get Admin Profile
  // ==========================================
  async getAdminProfile(currentUser: any) {
    const id = this.resolveUserId(currentUser);
    const admin = await adminRepository.findById(id);
    if (!admin) {
      // In case currentUser was from JWT but not in adminRepository findById yet
      return serializeAdminProfile(currentUser);
    }
    if (admin.status === "disabled") {
      throw HttpError.forbidden("Admin account has been suspended.", "ACCOUNT_DISABLED");
    }
    return serializeAdminProfile(admin);
  }

  // ==========================================
  // 2. Update Admin Profile
  // ==========================================
  async updateAdminProfile(
    currentUser: any,
    input: { name?: string; phone?: string; company?: string; avatarUrl?: string }
  ) {
    const id = this.resolveUserId(currentUser);
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw HttpError.notFound("Admin user not found.");
    }
    if (admin.status === "disabled") {
      throw HttpError.forbidden("Admin account has been suspended.", "ACCOUNT_DISABLED");
    }

    const updated = await adminRepository.updateAdmin(id, {
      name: input.name,
      phone: input.phone,
      company: input.company,
      avatarUrl: input.avatarUrl,
    });

    return serializeAdminProfile(updated || admin);
  }

  // ==========================================
  // 3. Change Admin Password
  // ==========================================
  async changeAdminPassword(
    currentUser: any,
    input: { currentPassword: string; newPassword: string; confirmPassword?: string }
  ) {
    const id = this.resolveUserId(currentUser);

    if (input.confirmPassword && input.newPassword !== input.confirmPassword) {
      throw HttpError.badRequest("New password and confirmation do not match.", "PASSWORD_MISMATCH");
    }

    if (input.currentPassword === input.newPassword) {
      throw HttpError.badRequest("New password must be different from current password.", "PASSWORD_UNCHANGED");
    }

    if (isDatabaseConnected() && Types.ObjectId.isValid(id)) {
      const user = await User.findById(id).select("+passwordHash");
      if (!user) {
        throw HttpError.unauthorized("Admin session invalid or expired.", "TOKEN_INVALID");
      }
      if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
        throw HttpError.badRequest("Current password is incorrect.", "INVALID_CURRENT_PASSWORD");
      }

      user.passwordHash = await hashPassword(input.newPassword);
      user.passwordChangedAt = new Date();
      user.tokenVersion += 1;
      await user.save();

      return {
        success: true,
        message: "Admin password changed successfully.",
        ...issueTokenPair(user),
      };
    }

    // In-memory fallback
    return {
      success: true,
      message: "Admin password changed successfully.",
    };
  }

  // ==========================================
  // 4. List Admin Accounts
  // ==========================================
  async listAdminAccounts(query: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const { admins, total } = await adminRepository.findAdmins({
      role: query.role,
      status: query.status,
      search: query.search,
      page,
      limit,
    });

    return serializeAdminList({
      admins,
      total,
      page,
      limit,
    });
  }

  // ==========================================
  // 5. Create Admin Account (Protected)
  // ==========================================
  async createAdminAccount(
    input: {
      name: string;
      email: string;
      password: string;
      role?: "admin" | "super_admin";
      phone?: string;
      company?: string;
      avatarUrl?: string;
    },
    _currentUser: any
  ) {
    const existing = await adminRepository.findByEmail(input.email);
    if (existing) {
      throw HttpError.conflict(
        `An account with email "${input.email.toLowerCase()}" already exists.`,
        "EMAIL_EXISTS"
      );
    }

    const created = await adminRepository.createAdmin({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role || "admin",
      phone: input.phone,
      company: input.company,
      avatarUrl: input.avatarUrl,
    });

    return {
      success: true,
      message: "Admin account created successfully.",
      admin: serializeAdminAccount(created),
    };
  }

  // ==========================================
  // 6. Update Admin Account (Protected)
  // ==========================================
  async updateAdminAccount(
    id: string,
    input: {
      name?: string;
      email?: string;
      role?: "admin" | "super_admin";
      status?: "active" | "disabled";
      phone?: string;
      company?: string;
      avatarUrl?: string;
      disabledReason?: string;
    },
    currentUser: any
  ) {
    const target = await adminRepository.findById(id);
    if (!target) {
      throw HttpError.notFound(`Admin account with ID "${id}" was not found.`);
    }

    // Safety check: Cannot demote or disable the last active super_admin
    if (
      target.role === "super_admin" &&
      (input.role === "admin" || input.status === "disabled")
    ) {
      const superAdminCount = await adminRepository.countSuperAdmins();
      if (superAdminCount <= 1) {
        throw HttpError.badRequest(
          "Cannot demote or disable the last active super administrator.",
          "LAST_SUPER_ADMIN"
        );
      }
    }

    // Check email uniqueness if changing email
    if (input.email && input.email.toLowerCase() !== target.email.toLowerCase()) {
      const emailTaken = await adminRepository.findByEmail(input.email);
      if (emailTaken) {
        throw HttpError.conflict(`Email "${input.email}" is already in use by another user.`);
      }
    }

    let tokenVersion = (target as any).tokenVersion || 0;
    let disabledAt: Date | undefined;
    let disabledBy: string | undefined;

    if (input.status === "disabled") {
      tokenVersion += 1;
      disabledAt = new Date();
      disabledBy = currentUser?.email || "admin";
    }

    const updated = await adminRepository.updateAdmin(id, {
      ...input,
      tokenVersion,
      disabledAt,
      disabledBy,
    });

    return {
      success: true,
      message: "Admin account updated successfully.",
      admin: serializeAdminAccount(updated || target),
    };
  }

  // ==========================================
  // 7. Disable Admin Account (Protected)
  // ==========================================
  async disableAdminAccount(
    id: string,
    reason: string = "Administrative action",
    currentUser: any
  ) {
    const currentUserId = this.resolveUserId(currentUser);
    if (String(id) === currentUserId) {
      throw HttpError.badRequest("You cannot disable your own admin account.", "SELF_DISABLE_FORBIDDEN");
    }

    const target = await adminRepository.findById(id);
    if (!target) {
      throw HttpError.notFound(`Admin account with ID "${id}" was not found.`);
    }

    if (target.status === "disabled") {
      return {
        success: true,
        message: "Admin account is already disabled.",
        admin: serializeAdminAccount(target),
      };
    }

    // Check last super_admin safeguard
    if (target.role === "super_admin") {
      const superAdminCount = await adminRepository.countSuperAdmins();
      if (superAdminCount <= 1) {
        throw HttpError.badRequest(
          "Cannot disable the last active super administrator.",
          "LAST_SUPER_ADMIN"
        );
      }
    }

    const updated = await adminRepository.updateAdmin(id, {
      status: "disabled",
      disabledReason: reason,
      disabledAt: new Date(),
      disabledBy: currentUser?.email || "admin",
      tokenVersion: ((target as any).tokenVersion || 0) + 1,
    });

    return {
      success: true,
      message: "Admin account disabled successfully.",
      admin: serializeAdminAccount(updated || target),
    };
  }

  // ==========================================
  // 8. Enable Admin Account (Protected)
  // ==========================================
  async enableAdminAccount(id: string, _currentUser: any) {
    const target = await adminRepository.findById(id);
    if (!target) {
      throw HttpError.notFound(`Admin account with ID "${id}" was not found.`);
    }

    const updated = await adminRepository.updateAdmin(id, {
      status: "active",
      disabledReason: undefined,
      disabledAt: undefined,
      disabledBy: undefined,
    });

    return {
      success: true,
      message: "Admin account re-enabled successfully.",
      admin: serializeAdminAccount(updated || target),
    };
  }
}

export const adminService = new AdminService();
