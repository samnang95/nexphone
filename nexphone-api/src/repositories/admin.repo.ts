import { Types } from "mongoose";
import { User, type UserDocument, type UserRole } from "../models/user.model";
import { type UserStatus } from "../constants/user.constants";
import { isDatabaseConnected } from "../config/database";
import { hashPassword } from "../utils/password";

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  disabledReason?: string;
  disabledAt?: Date | string;
  disabledBy?: string;
  tokenVersion: number;
  lastLoginAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// In-memory fallback store for standalone/offline dev/test mode
export const inMemoryAdminsStore: AdminRecord[] = [
  {
    id: "admin-seed-001",
    name: "Alex Vance (Root Admin)",
    email: "admin@nexphone.io",
    role: "super_admin",
    status: "active",
    phone: "+1 (206) 555-0194",
    company: "NexPhone Global Systems",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    tokenVersion: 0,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date(),
  },
  {
    id: "admin-seed-002",
    name: "Sarah Chen (Fleet Ops)",
    email: "operations@nexphone.io",
    role: "admin",
    status: "active",
    phone: "+1 (415) 555-4820",
    company: "NexPhone Operations",
    tokenVersion: 0,
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date(),
  },
  {
    id: "admin-seed-003",
    name: "Marcus Sterling (Compliance)",
    email: "compliance@nexphone.io",
    role: "admin",
    status: "active",
    phone: "+44 20 7946 0912",
    company: "NexPhone Legal & Governance",
    tokenVersion: 0,
    createdAt: new Date("2026-03-01T00:00:00Z"),
    updatedAt: new Date(),
  },
];

export class AdminRepository {
  async findById(id: string): Promise<UserDocument | AdminRecord | null> {
    if (isDatabaseConnected() && Types.ObjectId.isValid(id)) {
      const user = await User.findOne({
        _id: id,
        role: { $in: ["admin", "super_admin"] },
      });
      if (user) return user;
    }

    // Fallback to in-memory store
    const found = inMemoryAdminsStore.find((a) => a.id === id);
    return found || null;
  }

  async findByEmail(email: string): Promise<UserDocument | AdminRecord | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (isDatabaseConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (user) return user;
    }

    const found = inMemoryAdminsStore.find((a) => a.email.toLowerCase() === cleanEmail);
    return found || null;
  }

  async findAdmins(filters: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ admins: Array<UserDocument | AdminRecord>; total: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    if (isDatabaseConnected()) {
      const query: any = {
        role: { $in: ["admin", "super_admin"] },
      };

      if (filters.role && filters.role !== "all") {
        query.role = filters.role;
      }
      if (filters.status && filters.status !== "all") {
        query.status = filters.status;
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), "i");
        query.$or = [{ name: regex }, { email: regex }, { company: regex }];
      }

      const [admins, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
      ]);

      return { admins, total };
    }

    // In-memory fallback
    let list = [...inMemoryAdminsStore];
    if (filters.role && filters.role !== "all") {
      list = list.filter((a) => a.role === filters.role);
    }
    if (filters.status && filters.status !== "all") {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s) ||
          (a.company && a.company.toLowerCase().includes(s))
      );
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);
    return { admins: paginated, total };
  }

  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    company?: string;
    avatarUrl?: string;
  }): Promise<UserDocument | AdminRecord> {
    const cleanEmail = data.email.trim().toLowerCase();
    const role: UserRole = data.role === "super_admin" ? "super_admin" : "admin";
    const passwordHash = await hashPassword(data.password);

    if (isDatabaseConnected()) {
      const _id = new Types.ObjectId();
      const user = new User({
        _id,
        name: data.name.trim(),
        email: cleanEmail,
        passwordHash,
        role,
        status: "active",
        phone: data.phone?.trim(),
        company: data.company?.trim(),
        avatarUrl: data.avatarUrl?.trim(),
        emailVerified: true,
        tokenVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
      return user;
    }

    // In-memory
    const newAdmin: AdminRecord = {
      id: `admin-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      role,
      status: "active",
      phone: data.phone?.trim(),
      company: data.company?.trim(),
      avatarUrl: data.avatarUrl?.trim(),
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryAdminsStore.push(newAdmin);
    return newAdmin;
  }

  async updateAdmin(
    id: string,
    updates: {
      name?: string;
      email?: string;
      role?: UserRole;
      status?: UserStatus;
      phone?: string;
      company?: string;
      avatarUrl?: string;
      disabledReason?: string;
      disabledAt?: Date;
      disabledBy?: string;
      tokenVersion?: number;
    }
  ): Promise<UserDocument | AdminRecord | null> {
    if (isDatabaseConnected() && Types.ObjectId.isValid(id)) {
      const setFields: Record<string, any> = {};
      const unsetFields: Record<string, any> = {};

      for (const [key, val] of Object.entries(updates)) {
        if (val === undefined) {
          unsetFields[key] = 1;
        } else {
          setFields[key] = val;
        }
      }

      const updateQuery: any = {};
      if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
      if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

      const user = await User.findOneAndUpdate(
        { _id: id, role: { $in: ["admin", "super_admin"] } },
        updateQuery,
        { returnDocument: "after" }
      );
      if (user) return user;
    }

    const index = inMemoryAdminsStore.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = inMemoryAdminsStore[index]!;
    const updated: AdminRecord = {
      ...current,
      ...updates,
      updatedAt: new Date(),
    };
    for (const [key, val] of Object.entries(updates)) {
      if (val === undefined) {
        delete (updated as any)[key];
      }
    }
    inMemoryAdminsStore[index] = updated;
    return updated;
  }

  async countSuperAdmins(): Promise<number> {
    if (isDatabaseConnected()) {
      return User.countDocuments({ role: "super_admin", status: "active" });
    }
    return inMemoryAdminsStore.filter((a) => a.role === "super_admin" && a.status === "active").length;
  }
}

export const adminRepository = new AdminRepository();
