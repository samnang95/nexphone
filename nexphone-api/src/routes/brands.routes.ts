import { Router, type Request, type Response } from "express";
import { BrandRecord, brandsCatalog } from "../data/brands.data";

export const brandsRouter = Router();

// Brand CRUD Endpoints
brandsRouter.get("/api/brands", (req: Request, res: Response) => {
  const { status, tier, search } = req.query;
  let filtered = [...brandsCatalog];

  if (status && typeof status === "string" && status !== "all") {
    filtered = filtered.filter((b) => b.status.toLowerCase() === status.toLowerCase());
  }

  if (tier && typeof tier === "string" && tier !== "all") {
    filtered = filtered.filter((b) => b.tier.toLowerCase() === tier.toLowerCase());
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.code.toLowerCase().includes(query) ||
        b.country.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query)
    );
  }

  res.json(filtered);
});

brandsRouter.get("/api/brands/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const brand = brandsCatalog.find((b) => b.id === id);
  if (!brand) {
    res.status(404).json({ error: "Brand not found", id });
    return;
  }
  res.json(brand);
});

brandsRouter.post("/api/brands", (req: Request, res: Response) => {
  const body = req.body;
  const newBrand: BrandRecord = {
    ...body,
    id: body.id || `brand-${Date.now().toString(36)}`,
    deviceCount: body.deviceCount ?? 0,
    marketShare: body.marketShare || "0.0%",
    rating: body.rating ?? 5.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  brandsCatalog.unshift(newBrand);
  res.status(201).json(newBrand);
});

brandsRouter.put("/api/brands/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = brandsCatalog.findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Brand not found", id });
    return;
  }
  const updated: BrandRecord = {
    ...brandsCatalog[index],
    ...req.body,
    id, // ensure ID cannot be mutated
    updatedAt: new Date().toISOString(),
  };
  brandsCatalog[index] = updated;
  res.json(updated);
});

brandsRouter.delete("/api/brands/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = brandsCatalog.findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Brand not found", id });
    return;
  }
  const [deleted] = brandsCatalog.splice(index, 1);
  res.json({ success: true, deletedId: id, name: deleted?.name ?? "Brand" });
});
