import { Router, type Request, type Response } from "express";
import { productsCatalog } from "../data/products.data";

export const productsRouter = Router();

// Product Catalog CRUD Endpoints
productsRouter.get("/api/products", (req: Request, res: Response) => {
  const { series, status, search } = req.query;
  let filtered = [...productsCatalog];

  if (series && typeof series === "string" && series !== "all") {
    filtered = filtered.filter((p) => p.series.toLowerCase() === series.toLowerCase());
  }

  if (status && typeof status === "string" && status !== "all") {
    filtered = filtered.filter((p) => p.status.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query) ||
        p.storageOptions.some((s) => s.sku.toLowerCase().includes(query))
    );
  }

  res.json(filtered);
});

productsRouter.get("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const product = productsCatalog.find((p) => p.id === id || p.slug === id);
  if (!product) {
    res.status(404).json({ error: "Product not found", id });
    return;
  }
  res.json(product);
});

productsRouter.post("/api/products", (req: Request, res: Response) => {
  const body = req.body;
  const newProduct = {
    ...body,
    id: body.id || `prod-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  productsCatalog.unshift(newProduct);
  res.status(201).json(newProduct);
});

productsRouter.put("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = productsCatalog.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Product not found", id });
    return;
  }
  const updated = {
    ...productsCatalog[index],
    ...req.body,
    id, // ensure ID cannot be mutated
    updatedAt: new Date().toISOString(),
  };
  productsCatalog[index] = updated;
  res.json(updated);
});

productsRouter.delete("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = productsCatalog.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Product not found", id });
    return;
  }
  const [deleted] = productsCatalog.splice(index, 1);
  res.json({ success: true, deletedId: id, name: deleted?.name ?? "Phone" });
});
