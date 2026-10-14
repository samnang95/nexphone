import type { Request, Response } from "express";
import { homepageService } from "../services/homepage.service";

// ==========================================
// 1. Homepage Banners
// ==========================================
export async function getBanners(req: Request, res: Response): Promise<void> {
  const status = req.query.status as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await homepageService.getHomepageBanners({ status, limit });
  res.json(result);
}

export async function getBannerById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.getBannerById(id);
  res.json(result);
}

export async function createBanner(req: Request, res: Response): Promise<void> {
  const result = await homepageService.createBanner(req.body, req.auth?.user);
  res.status(201).json(result);
}

export async function updateBanner(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.updateBanner(id, req.body, req.auth?.user);
  res.json(result);
}

export async function deleteBanner(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.deleteBanner(id, req.auth?.user);
  res.json(result);
}

// ==========================================
// 2. Featured Products
// ==========================================
export async function getFeaturedProducts(req: Request, res: Response): Promise<void> {
  const status = req.query.status as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const series = req.query.series as string | undefined;
  const result = await homepageService.getFeaturedProducts({ status, limit, series });
  res.json(result);
}

export async function createFeaturedProduct(req: Request, res: Response): Promise<void> {
  const result = await homepageService.createFeaturedProduct(req.body, req.auth?.user);
  res.status(201).json(result);
}

export async function updateFeaturedProduct(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.updateFeaturedProduct(id, req.body, req.auth?.user);
  res.json(result);
}

export async function deleteFeaturedProduct(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.deleteFeaturedProduct(id, req.auth?.user);
  res.json(result);
}

// ==========================================
// 3. Promotional Sections
// ==========================================
export async function getPromotionalSections(req: Request, res: Response): Promise<void> {
  const status = req.query.status as string | undefined;
  const result = await homepageService.getPromotionalSections({ status });
  res.json(result);
}

export async function getPromotionalSectionById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.getPromotionalSectionById(id);
  res.json(result);
}

export async function createPromotionalSection(req: Request, res: Response): Promise<void> {
  const result = await homepageService.createPromotionalSection(req.body, req.auth?.user);
  res.status(201).json(result);
}

export async function updatePromotionalSection(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.updatePromotionalSection(id, req.body, req.auth?.user);
  res.json(result);
}

export async function deletePromotionalSection(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.deletePromotionalSection(id, req.auth?.user);
  res.json(result);
}

export async function reorderPromotionalSections(req: Request, res: Response): Promise<void> {
  const result = await homepageService.reorderPromotionalSections(req.body, req.auth?.user);
  res.json(result);
}

// ==========================================
// 4. New Arrivals Management
// ==========================================
export async function getNewArrivals(req: Request, res: Response): Promise<void> {
  const status = req.query.status as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await homepageService.getNewArrivals({ status, limit });
  res.json(result);
}

export async function getNewArrivalById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.getNewArrivalById(id);
  res.json(result);
}

export async function createNewArrival(req: Request, res: Response): Promise<void> {
  const result = await homepageService.createNewArrival(req.body, req.auth?.user);
  res.status(201).json(result);
}

export async function updateNewArrival(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.updateNewArrival(id, req.body, req.auth?.user);
  res.json(result);
}

export async function deleteNewArrival(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.deleteNewArrival(id, req.auth?.user);
  res.json(result);
}

// ==========================================
// 5. Best Sellers Management
// ==========================================
export async function getBestSellers(req: Request, res: Response): Promise<void> {
  const status = req.query.status as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await homepageService.getBestSellers({ status, limit });
  res.json(result);
}

export async function getBestSellerById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.getBestSellerById(id);
  res.json(result);
}

export async function createBestSeller(req: Request, res: Response): Promise<void> {
  const result = await homepageService.createBestSeller(req.body, req.auth?.user);
  res.status(201).json(result);
}

export async function updateBestSeller(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.updateBestSeller(id, req.body, req.auth?.user);
  res.json(result);
}

export async function deleteBestSeller(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id || "");
  const result = await homepageService.deleteBestSeller(id, req.auth?.user);
  res.json(result);
}

// ==========================================
// 6. Composite Homepage Overview & Metrics
// ==========================================
export async function getHomepageOverview(_req: Request, res: Response): Promise<void> {
  const result = await homepageService.getHomepageOverview();
  res.json(result);
}

export async function getContentMetrics(_req: Request, res: Response): Promise<void> {
  const result = await homepageService.getContentMetrics();
  res.json(result);
}

