import { Router, type Request, type Response } from "express";
import { CustomerRecord, customersStore, getCustomerRecentOrders } from "./customers.data";

export const customersRouter = Router();

// GET all customers with search and filters
customersRouter.get("/api/customers", (req: Request, res: Response) => {
  const { search, status, tier, sortBy } = req.query;
  let results = [...customersStore];

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
    ...c,
    recentOrders: getCustomerRecentOrders(c.email),
  }));

  res.json(enriched);
});

// GET single customer by ID
customersRouter.get("/api/customers/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const customer = customersStore.find((c) => c.id === id || c.customerNumber === id);

  if (!customer) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }

  res.json({
    ...customer,
    recentOrders: getCustomerRecentOrders(customer.email),
  });
});

// PATCH toggle customer account status (Enable / Disable)
customersRouter.patch("/api/customers/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason, note, performedBy = "Admin Staff" } = req.body || {};
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
    ...updated,
    recentOrders: getCustomerRecentOrders(updated.email),
  });
});

// PUT fallback for status update
customersRouter.put("/api/customers/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason, note, performedBy = "Admin Staff" } = req.body || {};
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
    ...updated,
    recentOrders: getCustomerRecentOrders(updated.email),
  });
});

// GET customer high-level metrics
customersRouter.get("/api/customers-metrics", (_req: Request, res: Response) => {
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
