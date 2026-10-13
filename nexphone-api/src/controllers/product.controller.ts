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
