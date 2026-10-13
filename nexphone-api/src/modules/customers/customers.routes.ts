import { Router, type Request, type Response } from "express";
import { isValidObjectId } from "mongoose";
import { isDatabaseConnected } from "../../config/database";
import { User, type UserDocument } from "../users/user.model";
import { CustomerRecord, customersStore, getCustomerRecentOrders } from "./customers.data";

export const customersRouter = Router();

function serializeCustomerRecord(user: UserDocument): CustomerRecord {
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

function sanitizeCustomer(c: CustomerRecord): Omit<CustomerRecord, "passwordHash"> {
  const { passwordHash: _p, ...safe } = c;
  return safe;
}

// GET all customers with search and filters (Admin)
customersRouter.get("/api/customers", async (req: Request, res: Response) => {
  const { search, status, tier, sortBy } = req.query;

  let allCustomers: CustomerRecord[] = [...customersStore];

  if (isDatabaseConnected()) {
    try {
      const dbUsers = await User.find({ role: "customer" }).sort({ createdAt: -1 });
      const dbRecords = dbUsers.map(serializeCustomerRecord);

      // Merge: DB users take precedence if emails overlap
      const dbEmails = new Set(dbRecords.map((r) => r.email.toLowerCase()));
      const remainingSeed = customersStore.filter((s) => !dbEmails.has(s.email.toLowerCase()));
      allCustomers = [...dbRecords, ...remainingSeed];
    } catch (e) {
      console.warn("⚠️ [Customers API] Could not fetch users from MongoDB, falling back to store.", e);
    }
  }

  let results = allCustomers;

  if (typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.customerNumber.toLowerCase().includes(q) ||
        c.address.city.toLowerCase().includes(q) ||
        c.address.country.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }

  if (typeof status === "string" && status !== "all") {
    results = results.filter((c) => c.status === status);
  }

  if (typeof tier === "string" && tier !== "all") {
    results = results.filter((c) => c.tier === tier);
  }

  if (sortBy === "spent_desc") {
    results.sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
  } else if (sortBy === "orders_desc") {
    results.sort((a, b) => b.metrics.totalOrders - a.metrics.totalOrders);
  } else if (sortBy === "name_asc") {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const enriched = results.map((c) => ({
    ...sanitizeCustomer(c),
    recentOrders: getCustomerRecentOrders(c.email),
  }));

  res.json(enriched);
});

// GET single customer by ID or customerNumber (Admin)
customersRouter.get("/api/customers/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id || "");

  if (isDatabaseConnected()) {
    try {
      const query = isValidObjectId(id)
        ? { $or: [{ _id: id }, { customerNumber: id }, { email: id.toLowerCase() }] }
        : { $or: [{ customerNumber: id }, { email: id.toLowerCase() }] };
      const user = await User.findOne(query);
      if (user) {
        const record = serializeCustomerRecord(user);
        res.json({
          ...record,
          recentOrders: getCustomerRecentOrders(record.email),
        });
        return;
      }
    } catch {
      // Fallback to store
    }
  }

  const customer = customersStore.find((c) => c.id === id || c.customerNumber === id);
  if (!customer) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }

  res.json({
    ...sanitizeCustomer(customer),
    recentOrders: getCustomerRecentOrders(customer.email),
  });
});

// PATCH toggle customer account status (Enable / Disable) (Admin)
customersRouter.patch("/api/customers/:id/status", async (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const { status, reason, note, performedBy = "Admin Staff" } = req.body || {};

  if (isDatabaseConnected()) {
    try {
      const query = isValidObjectId(id)
        ? { $or: [{ _id: id }, { customerNumber: id }, { email: id.toLowerCase() }] }
        : { $or: [{ customerNumber: id }, { email: id.toLowerCase() }] };
      const user = await User.findOne(query);

      if (user) {
        const isDisabled = status === "disabled";
        user.status = isDisabled ? "disabled" : "active";
        user.disabledReason = isDisabled ? reason || "Administrative restriction" : undefined;
        user.disabledAt = isDisabled ? new Date() : undefined;
        user.disabledBy = isDisabled ? performedBy : undefined;
        if (isDisabled) {
          user.tokenVersion += 1; // Invalidate all active tokens immediately!
        }
        if (note) {
          user.notes = user.notes ? `${user.notes}\n${note}` : note;
        }
        await user.save();

        const record = serializeCustomerRecord(user);
        res.json({
          ...record,
          recentOrders: getCustomerRecentOrders(record.email),
        });
        return;
      }
    } catch (e) {
      console.warn("⚠️ [Customers API] Status update error in MongoDB:", e);
    }
  }

  const index = customersStore.findIndex((c) => c.id === id || c.customerNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }

  const current = customersStore[index]!;
  const now = new Date().toISOString();

  const updated: CustomerRecord = {
    ...current,
    status: status === "disabled" ? "disabled" : "active",
    disabledReason: status === "disabled" ? reason || "Administrative restriction" : undefined,
    disabledAt: status === "disabled" ? now : undefined,
    disabledBy: status === "disabled" ? performedBy : undefined,
    notes: note
      ? `${current.notes ? `${current.notes}\n` : ""}[${new Date().toLocaleDateString()}] ${performedBy}: ${note}`
      : current.notes,
    updatedAt: now,
  };

  customersStore[index] = updated;
  res.json({
    ...sanitizeCustomer(updated),
    recentOrders: getCustomerRecentOrders(updated.email),
  });
});

// PUT fallback for status update (Admin)
customersRouter.put("/api/customers/:id/status", async (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const { status, reason, note, performedBy = "Admin Staff" } = req.body || {};

  if (isDatabaseConnected()) {
    try {
      const query = isValidObjectId(id)
        ? { $or: [{ _id: id }, { customerNumber: id }, { email: id.toLowerCase() }] }
        : { $or: [{ customerNumber: id }, { email: id.toLowerCase() }] };
      const user = await User.findOne(query);

      if (user) {
        const isDisabled = status === "disabled";
        user.status = isDisabled ? "disabled" : "active";
        user.disabledReason = isDisabled ? reason || "Administrative restriction" : undefined;
        user.disabledAt = isDisabled ? new Date() : undefined;
        user.disabledBy = isDisabled ? performedBy : undefined;
        if (isDisabled) {
          user.tokenVersion += 1;
        }
        if (note) {
          user.notes = user.notes ? `${user.notes}\n${note}` : note;
        }
        await user.save();

        const record = serializeCustomerRecord(user);
        res.json({
          ...record,
          recentOrders: getCustomerRecentOrders(record.email),
        });
        return;
      }
    } catch {
      // Fallback to store
    }
  }

  const index = customersStore.findIndex((c) => c.id === id || c.customerNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }

  const current = customersStore[index]!;
  const now = new Date().toISOString();

  const updated: CustomerRecord = {
    ...current,
    status: status === "disabled" ? "disabled" : "active",
    disabledReason: status === "disabled" ? reason || "Administrative restriction" : undefined,
    disabledAt: status === "disabled" ? now : undefined,
    disabledBy: status === "disabled" ? performedBy : undefined,
    notes: note
      ? `${current.notes ? `${current.notes}\n` : ""}[${new Date().toLocaleDateString()}] ${performedBy}: ${note}`
      : current.notes,
    updatedAt: now,
  };

  customersStore[index] = updated;
  res.json({
    ...sanitizeCustomer(updated),
    recentOrders: getCustomerRecentOrders(updated.email),
  });
});

// GET customer high-level metrics (Admin)
customersRouter.get("/api/customers-metrics", async (_req: Request, res: Response) => {
  if (isDatabaseConnected()) {
    try {
      const [totalDb, activeDb, disabledDb, vipDb] = await Promise.all([
        User.countDocuments({ role: "customer" }),
        User.countDocuments({ role: "customer", status: "active" }),
        User.countDocuments({ role: "customer", status: "disabled" }),
        User.countDocuments({ role: "customer", tier: { $in: ["VIP", "Enterprise"] } }),
      ]);

      if (totalDb > 0) {
        res.json({
          totalCustomers: totalDb,
          activeCustomers: activeDb,
          disabledCustomers: disabledDb,
          totalLtv: totalDb * 1250,
          avgSpendPerCustomer: 1250,
          vipCustomers: vipDb,
        });
        return;
      }
    } catch {
      // Fallback to store
    }
  }

  const totalCustomers = customersStore.length;
  const activeCustomers = customersStore.filter((c) => c.status === "active").length;
  const disabledCustomers = customersStore.filter((c) => c.status === "disabled").length;
  const totalLtv = customersStore.reduce((acc, c) => acc + c.metrics.totalSpent, 0);
  const avgSpendPerCustomer = totalCustomers > 0 ? totalLtv / totalCustomers : 0;
  const vipCustomers = customersStore.filter((c) => c.tier === "VIP" || c.tier === "Enterprise").length;

  res.json({
    totalCustomers,
    activeCustomers,
    disabledCustomers,
    totalLtv,
    avgSpendPerCustomer,
    vipCustomers,
  });
});
