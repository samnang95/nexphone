import type { Request, Response } from "express";
import { customersService } from "../services/customers.service";

export { serializeCustomerRecord, sanitizeCustomer } from "../views/customers.view";

export async function getCustomers(req: Request, res: Response): Promise<void> {
  const result = await customersService.getCustomers(req.query);
  res.json(result);
}

export async function getCustomerById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const customer = await customersService.getCustomerById(id);
  if (!customer) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }
  res.json(customer);
}

export async function updateCustomerStatus(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const updated = await customersService.updateCustomerStatus(id, req.body || {});
  if (!updated) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }
  res.json(updated);
}

export async function getCustomerMetrics(_req: Request, res: Response): Promise<void> {
  const metrics = await customersService.getMetrics();
  res.json(metrics);
}
