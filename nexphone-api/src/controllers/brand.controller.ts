import type { Request, Response } from "express";
import { brandService } from "../services/brand.service";
import {
  serializeBrand,
  serializeBrandList,
  serializePaginatedBrands,
} from "../views/brand.view";

export async function getAllBrands(req: Request, res: Response): Promise<void> {
  const result = await brandService.getBrands(req.query as any, req.auth?.user);
  res.setHeader("X-Total-Count", String(result.total));
  res.setHeader("X-Page", String(result.page));
  res.setHeader("X-Limit", String(result.limit));
  if (req.query.paginated === "true" || req.query.paginated === "1") {
    res.json(serializePaginatedBrands(result.brands, result.total, result.page, result.limit));
    return;
  }

  res.json(serializeBrandList(result.brands));
}

export async function getBrandById(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const brand = await brandService.getBrandByIdOrSlug(idOrSlug, req.auth?.user);
  res.json(serializeBrand(brand));
}

export async function createBrand(req: Request, res: Response): Promise<void> {
  const newBrand = await brandService.createBrand(req.body, req.auth?.user);
  res.status(201).json(serializeBrand(newBrand));
}

export async function updateBrand(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const updated = await brandService.updateBrand(idOrSlug, req.body, req.auth?.user);
  res.json(serializeBrand(updated));
}

export async function deleteBrand(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const result = await brandService.deleteBrand(idOrSlug, req.auth?.user);
  res.json(result);
}
