import type { UserDocument } from "../models/user.model";
import type { CustomerRecord } from "../data/customers.data";

export function serializeCustomerRecord(user: UserDocument): CustomerRecord {
  const defaultAddress = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
  return {
    id: String(user._id),
    customerNumber: user.customerNumber || `CUST-${String(user._id).slice(-6).toUpperCase()}`,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    company: user.company || undefined,
    avatarUrl: user.avatarUrl || undefined,
    status: user.status as "active" | "disabled",
    tier: user.tier as "VIP" | "Enterprise" | "Pro" | "Regular",
    address: {
      street: defaultAddress?.street || "",
      city: defaultAddress?.city || "",
      state: defaultAddress?.state || "",
      postalCode: defaultAddress?.zipCode || "",
      country: defaultAddress?.country || "",
    },
    metrics: {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrderDate: user.createdAt?.toISOString() || new Date().toISOString(),
    },
    security: {
      emailVerified: Boolean(user.emailVerified),
      phoneVerified: Boolean(user.phoneVerified),
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      lastLoginAt: user.lastLoginAt?.toISOString() || new Date().toISOString(),
      lastLoginIp: user.lastLoginIp || "127.0.0.1",
    },
    notes: user.notes || undefined,
    disabledReason: user.disabledReason || undefined,
    disabledAt: user.disabledAt?.toISOString(),
    disabledBy: user.disabledBy || undefined,
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export function sanitizeCustomer(c: CustomerRecord): Omit<CustomerRecord, "passwordHash"> {
  const { passwordHash: _p, ...safe } = c;
  return safe;
}
