import type { Request, Response } from "express";
import { comparisonService } from "../services/comparison.service";

function extractProductIds(req: Request): { productIds: string[]; highlightDifferences: boolean } {
  let productIds: string[] = [];
  let highlightDifferences = false;

  if (Array.isArray(req.body?.productIds)) {
    productIds = req.body.productIds;
  } else if (typeof req.query.ids === "string" && req.query.ids.trim()) {
    productIds = req.query.ids.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (Array.isArray(req.query.ids)) {
    productIds = req.query.ids.map(String);
  }

  if (req.body?.highlightDifferences !== undefined) {
    highlightDifferences = Boolean(req.body.highlightDifferences);
  } else if (req.query.highlightDifferences !== undefined) {
    highlightDifferences = req.query.highlightDifferences === "true" || req.query.highlightDifferences === "1";
  }

  return { productIds, highlightDifferences };
}

export async function comparePhones(req: Request, res: Response): Promise<void> {
  const { productIds, highlightDifferences } = extractProductIds(req);
  const result = await comparisonService.comparePhones(productIds, highlightDifferences);
  res.json({
    success: true,
    ...result,
  });
}

export async function getComparisonSpecifications(req: Request, res: Response): Promise<void> {
  const { productIds, highlightDifferences } = extractProductIds(req);
  const result = await comparisonService.getComparisonSpecifications(productIds, highlightDifferences);
  res.json({
    success: true,
    ...result,
  });
}

export async function getComparisonData(req: Request, res: Response): Promise<void> {
  const { productIds } = extractProductIds(req);
  const result = await comparisonService.getComparisonData(productIds.length > 0 ? productIds : undefined);
  res.json({
    success: true,
    ...result,
  });
}
