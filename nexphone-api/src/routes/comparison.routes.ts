import { Router } from "express";
import * as controller from "../controllers/comparison.controller";

export const comparisonRouter = Router();

// ==========================================
// 2. Get Comparison Specifications
// (Mounted before "/" to guarantee clean path matching)
// ==========================================
comparisonRouter.get("/specifications", controller.getComparisonSpecifications);
comparisonRouter.post("/specifications", controller.getComparisonSpecifications);
comparisonRouter.get("/specs", controller.getComparisonSpecifications);
comparisonRouter.post("/specs", controller.getComparisonSpecifications);

// ==========================================
// 3. Get Phone Comparison Data
// ==========================================
comparisonRouter.get("/data", controller.getComparisonData);
comparisonRouter.post("/data", controller.getComparisonData);
comparisonRouter.get("/phones", controller.getComparisonData);
comparisonRouter.post("/phones", controller.getComparisonData);

// ==========================================
// 1. Compare 2–3 Phones
// ==========================================
comparisonRouter.get("/", controller.comparePhones);
comparisonRouter.post("/", controller.comparePhones);
