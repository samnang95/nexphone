import type { Request, Response } from "express";
import { productService } from "../services/product.service";
import {
  serializeProduct,
  serializeProductList,
  serializePaginatedProducts,
} from "../views/product.view";

export async function getAllPhones(req: Request, res: Response): Promise<void> {
  const result = await productService.getProducts(req.query as any, req.auth?.user);
  res.setHeader("X-Total-Count", String(result.total));
  res.setHeader("X-Page", String(result.page));
  res.setHeader("X-Limit", String(result.limit));
  if (req.query.paginated === "true" || req.query.paginated === "1") {
    res.json(
      serializePaginatedProducts(
        result.products,
        result.total,
        result.page,
        result.limit,
        { isAdmin: result.isAdmin }
      )
    );
    return;
  }

  res.json(serializeProductList(result.products, { isAdmin: result.isAdmin }));
}

export async function getPhoneByIdOrSlug(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const { product, isAdmin } = await productService.getProductByIdOrSlug(idOrSlug, req.auth?.user);
  res.json(serializeProduct(product, { isAdmin }));
}

export async function searchPhones(req: Request, res: Response): Promise<void> {
  const query = String(req.query.q || req.query.search || "");
  const result = await productService.searchPhones(query, req.auth?.user);
  res.json(serializeProductList(result.products, { isAdmin: result.isAdmin }));
}

export async function getFeaturedPhones(req: Request, res: Response): Promise<void> {
  const result = await productService.getFeaturedPhones(req.auth?.user);
  res.json(serializeProductList(result.products, { isAdmin: result.isAdmin }));
}

export async function getNewArrivals(req: Request, res: Response): Promise<void> {
  const result = await productService.getNewArrivals(req.auth?.user);
  res.json(serializeProductList(result.products, { isAdmin: result.isAdmin }));
}

export async function getBestSellers(req: Request, res: Response): Promise<void> {
  const result = await productService.getBestSellers(req.auth?.user);
  res.json(serializeProductList(result.products, { isAdmin: result.isAdmin }));
}

export async function createPhone(req: Request, res: Response): Promise<void> {
  const newPhone = await productService.createPhone(req.body, req.auth?.user);
  res.status(201).json(serializeProduct(newPhone, { isAdmin: true }));
}

export async function updatePhone(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const updated = await productService.updatePhone(idOrSlug, req.body, req.auth?.user);
  res.json(serializeProduct(updated, { isAdmin: true }));
}

export async function deletePhone(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const result = await productService.deletePhone(idOrSlug, req.auth?.user);
  res.json(result);
}

// ==========================================
// Colors Management Handlers
// ==========================================
export async function getColors(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const colors = await productService.getColors(idOrSlug);
  res.json(colors);
}

export async function addColor(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const result = await productService.addColor(idOrSlug, req.body);
  res.status(201).json(result);
}

export async function updateColor(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const colorId = String(req.params.colorId || "");
  const result = await productService.updateColor(idOrSlug, colorId, req.body);
  res.json(result);
}

export async function deleteColor(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const colorId = String(req.params.colorId || "");
  const result = await productService.deleteColor(idOrSlug, colorId);
  res.json(result);
}

// ==========================================
// Storage & RAM Variants Handlers
// ==========================================
export async function getStorageOptions(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const options = await productService.getStorageOptions(idOrSlug);
  res.json(options);
}

export async function addStorageOption(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const result = await productService.addStorageOption(idOrSlug, req.body);
  res.status(201).json(result);
}

export async function updateStorageOption(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const storageId = String(req.params.storageId || req.params.variantId || "");
  const result = await productService.updateStorageOption(idOrSlug, storageId, req.body);
  res.json(result);
}

export async function deleteStorageOption(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const storageId = String(req.params.storageId || req.params.variantId || "");
  const result = await productService.deleteStorageOption(idOrSlug, storageId);
  res.json(result);
}

// ==========================================
// Pricing Handlers
// ==========================================
export async function getPricing(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const pricing = await productService.getPricing(idOrSlug, req.auth?.user);
  res.json(pricing);
}

export async function updatePricing(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const pricing = await productService.updatePricing(idOrSlug, req.body, req.auth?.user);
  res.json(pricing);
}

// ==========================================
// Specifications Handlers
// ==========================================
export async function getSpecifications(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const specs = await productService.getSpecifications(idOrSlug);
  res.json(specs);
}

export async function updateSpecifications(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const specs = await productService.updateSpecifications(idOrSlug, req.body);
  res.json(specs);
}

// ==========================================
// Product Images Handlers
// ==========================================
export async function getImages(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const images = await productService.getImages(idOrSlug);
  res.json(images);
}

export async function addImages(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const result = await productService.addImages(idOrSlug, req.body);
  res.status(201).json(result);
}

export async function deleteImage(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const imageUrl = String(req.body?.imageUrl || req.query?.imageUrl || "");
  const result = await productService.deleteImage(idOrSlug, imageUrl);
  res.json(result);
}

export async function setPrimaryImage(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const imageUrl = String(req.body?.imageUrl || "");
  const result = await productService.setPrimaryImage(idOrSlug, imageUrl);
  res.json(result);
}

// ==========================================
// 3D Model Handlers
// ==========================================
export async function getModel3D(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const model = await productService.getModel3D(idOrSlug);
  res.json(model);
}

export async function updateModel3D(req: Request, res: Response): Promise<void> {
  const idOrSlug = String(req.params.id || req.params.slug || "");
  const model = await productService.updateModel3D(idOrSlug, req.body);
  res.json(model);
}
