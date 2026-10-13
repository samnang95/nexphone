import { isValidObjectId } from "mongoose";
import { isDatabaseConnected } from "../config/database";
import { User, type UserDocument } from "../models/user.model";
import { CustomerRecord, customersStore } from "../data/customers.data";
import { serializeCustomerRecord } from "../views/customers.view";

export const customersRepo = {
  async getAllCustomers(): Promise<CustomerRecord[]> {
    if (isDatabaseConnected()) {
      try {
        const dbUsers = await User.find({ role: "customer" }).sort({ createdAt: -1 });
        const dbRecords = dbUsers.map(serializeCustomerRecord);
        const dbEmails = new Set(dbRecords.map((r) => r.email.toLowerCase()));
        const remainingSeed = customersStore.filter((s) => !dbEmails.has(s.email.toLowerCase()));
        return [...dbRecords, ...remainingSeed];
      } catch (e) {
        console.warn("⚠️ [Customers Repo] Could not fetch users from MongoDB, falling back to store.", e);
      }
    }
    return [...customersStore];
  },

  async findCustomerById(id: string): Promise<{ userDoc?: UserDocument; storeRecord?: CustomerRecord } | null> {
    if (isDatabaseConnected()) {
      try {
        const query = isValidObjectId(id)
          ? { $or: [{ _id: id }, { customerNumber: id }, { email: id.toLowerCase() }] }
          : { $or: [{ customerNumber: id }, { email: id.toLowerCase() }] };
        const user = await User.findOne(query);
        if (user) return { userDoc: user };
      } catch {
      }
    }

    const customer = customersStore.find((c) => c.id === id || c.customerNumber === id);
    if (customer) return { storeRecord: customer };
    return null;
  },

  async updateCustomerStatusInDb(
    id: string,
    updates: {
      status: "active" | "disabled";
      disabledReason?: string;
      disabledAt?: Date;
      disabledBy?: string;
      notes?: string;
      incrementTokenVersion?: boolean;
    }
  ): Promise<UserDocument | null> {
    if (!isDatabaseConnected()) return null;
    try {
      const query = isValidObjectId(id)
        ? { $or: [{ _id: id }, { customerNumber: id }, { email: id.toLowerCase() }] }
        : { $or: [{ customerNumber: id }, { email: id.toLowerCase() }] };
      const user = await User.findOne(query);
      if (!user) return null;

      user.status = updates.status;
      user.disabledReason = updates.disabledReason;
      user.disabledAt = updates.disabledAt;
      user.disabledBy = updates.disabledBy;
      if (updates.incrementTokenVersion) {
        user.tokenVersion += 1;
      }
      if (updates.notes) {
        user.notes = user.notes ? `${user.notes}\n${updates.notes}` : updates.notes;
      }
      await user.save();
      return user;
    } catch (e) {
      console.warn("⚠️ [Customers Repo] Status update error in MongoDB:", e);
      return null;
    }
  },

  updateCustomerStatusInStore(
    id: string,
    updates: {
      status: "active" | "disabled";
      disabledReason?: string;
      disabledAt?: string;
      disabledBy?: string;
      note?: string;
      performedBy?: string;
    }
  ): CustomerRecord | null {
    const index = customersStore.findIndex((c) => c.id === id || c.customerNumber === id);
    if (index === -1) return null;

    const current = customersStore[index]!;
    const now = new Date().toISOString();

    const updated: CustomerRecord = {
      ...current,
      status: updates.status,
      disabledReason: updates.disabledReason,
      disabledAt: updates.disabledAt,
      disabledBy: updates.disabledBy,
      notes: updates.note
        ? `${current.notes ? `${current.notes}\n` : ""}[${new Date().toLocaleDateString()}] ${updates.performedBy}: ${updates.note}`
        : current.notes,
      updatedAt: now,
    };

    customersStore[index] = updated;
    return updated;
  },

  async getMetricsCounts(): Promise<{
    fromDb: boolean;
    total: number;
    active: number;
    disabled: number;
    vip: number;
  }> {
    if (isDatabaseConnected()) {
      try {
        const [totalDb, activeDb, disabledDb, vipDb] = await Promise.all([
          User.countDocuments({ role: "customer" }),
          User.countDocuments({ role: "customer", status: "active" }),
          User.countDocuments({ role: "customer", status: "disabled" }),
          User.countDocuments({ role: "customer", tier: { $in: ["VIP", "Enterprise"] } }),
        ]);

        if (totalDb > 0) {
          return { fromDb: true, total: totalDb, active: activeDb, disabled: disabledDb, vip: vipDb };
        }
      } catch {
        // Fallback to store
      }
    }

    const total = customersStore.length;
    const active = customersStore.filter((c) => c.status === "active").length;
    const disabled = customersStore.filter((c) => c.status === "disabled").length;
    const vip = customersStore.filter((c) => c.tier === "VIP" || c.tier === "Enterprise").length;
    return { fromDb: false, total, active, disabled, vip };
  },
};
