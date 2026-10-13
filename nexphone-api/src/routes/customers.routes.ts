import { Router } from "express";
import * as controller from "../controllers/customers.controller";

export const customersRouter = Router();

// GET all customers with search and filters (Admin)
customersRouter.get("/api/customers", controller.getCustomers);

// GET single customer by ID or customerNumber (Admin)
customersRouter.get("/api/customers/:id", controller.getCustomerById);

// PATCH toggle customer account status (Enable / Disable) (Admin)
customersRouter.patch("/api/customers/:id/status", controller.updateCustomerStatus);

// PUT fallback for status update (Admin)
customersRouter.put("/api/customers/:id/status", controller.updateCustomerStatus);

// GET customer high-level metrics (Admin)
customersRouter.get("/api/customers-metrics", controller.getCustomerMetrics);
