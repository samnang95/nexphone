import type { UserDocument } from "../models/user.model";
import type { AdminRecord } from "../repositories/admin.repo";

export function serializeAdminAccount(admin: UserDocument | AdminRecord | any) {
  const id = admin._id ? String(admin._id) : String(admin.id);
  return {
    id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    phone: admin.phone || null,
    company: admin.company || null,
    avatarUrl: admin.avatarUrl || null,
    disabledReason: admin.disabledReason || null,
    disabledAt: admin.disabledAt ? new Date(admin.disabledAt).toISOString() : null,
    disabledBy: admin.disabledBy || null,
    lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt).toISOString() : null,
    createdAt: admin.createdAt ? new Date(admin.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: admin.updatedAt ? new Date(admin.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export function serializeAdminProfile(admin: UserDocument | AdminRecord | any) {
  return {
    ...serializeAdminAccount(admin),
    permissions: admin.role === "super_admin"
      ? ["*"]
      : [
          "dashboard:read",
          "products:read",
          "products:write",
          "orders:read",
          "orders:write",
          "inventory:read",
          "inventory:write",
          "promotions:read",
          "promotions:write",
          "reports:read",
          "reports:export",
          "content:read",
          "content:write",
        ],
  };
}

export function serializeAdminList(data: {
  admins: Array<UserDocument | AdminRecord>;
  total: number;
  page: number;
  limit: number;
}) {
  const totalPages = Math.ceil(data.total / data.limit) || 1;
  return {
    success: true,
    admins: data.admins.map(serializeAdminAccount),
    pagination: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages,
      hasNext: data.page < totalPages,
      hasPrev: data.page > 1,
    },
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages,
  };
}
