import type { PhoneProduct } from "@/types/product";
import { appConfig } from "@/config/env";

/**
 * Initial standard catalog of NexPhone devices with specifications,
 * storage/color matrices, pricing tiers, and 3D model assets.
 */
let memoryProducts: PhoneProduct[] = [
  {
    id: "prod-001",
    name: "NexPhone Pro Max X",
    slug: "nexphone-pro-max-x",
    subtitle: "Grade-5 Titanium chassis, 200MP Quad Optical Matrix & NexCore AI Gen 3",
    series: "Pro Series",
    status: "published",
    basePrice: 1199,
    compareAtPrice: 1299,
    costPrice: 680,
    rating: 4.9,
    isFeatured: true,
    colors: [
      { id: "c1", name: "Titanium Space Gray", hex: "#2b2d42", inStock: true },
      { id: "c2", name: "Silver Frost", hex: "#e2e8f0", inStock: true },
      { id: "c3", name: "Deep Cobalt", hex: "#1e3a8a", inStock: true },
      { id: "c4", name: "Desert Sand Gold", hex: "#d4af37", inStock: false },
    ],
    storageOptions: [
      { id: "s1", capacity: "256GB", ram: "12GB LPDDR5X", price: 1199, comparePrice: 1299, stock: 184, sku: "NX-PRO-256" },
      { id: "s2", capacity: "512GB", ram: "16GB LPDDR5X", price: 1399, comparePrice: 1499, stock: 96, sku: "NX-PRO-512" },
      { id: "s3", capacity: "1TB", ram: "16GB LPDDR5X", price: 1599, comparePrice: 1699, stock: 42, sku: "NX-PRO-1TB" },
    ],
    specifications: {
      display: {
        size: "6.8 inch",
        resolution: "3120 x 1440 QHD+ (505 ppi)",
        panelType: "Dynamic LTPO AMOLED 2X",
        refreshRate: "1-120Hz Adaptive",
        peakBrightness: "2,600 nits Outdoor Vision",
      },
      processor: {
        chipset: "NexCore AI Pro (3nm TSMC N3E)",
        cpu: "Octa-core (1x 3.4GHz Cortex-X4 + 5x 3.2GHz + 2x 2.3GHz)",
        gpu: "NexGraphics Ray-Tracing v2",
        neuralEngine: "45 TOPS Hexagon NPU",
      },
      camera: {
        main: "200MP f/1.7 1/1.3\" Sensor, Dual OIS",
        ultrawide: "50MP 122° Ultra-Wide Macro",
        telephoto: "50MP 5x Periscope Optical (100x Space Zoom)",
        front: "32MP Dual Pixel PDAF 4K60",
        features: ["8K 30fps CinemaLog", "ProRAW 16-bit", "Night Vision Pro 3.0", "Action SteadiCam"],
      },
      battery: {
        capacity: "5,400 mAh Silicon-Carbon",
        wiredCharging: "65W HyperCharge (0-80% in 22 min)",
        wirelessCharging: "25W Qi2 / MagSafe certified",
      },
      connectivity: {
        cellular: "5G mmWave + Sub-6 (Global 24 bands)",
        wifi: "Wi-Fi 7 (802.11be tri-band 320MHz)",
        bluetooth: "Bluetooth 5.4 Low Energy Audio",
        ports: "USB-C 3.2 Gen 2 (10Gbps DisplayPort)",
        sim: "Dual Nano-SIM + Dual eSIM standby",
      },
      dimensions: {
        height: "163.4 mm",
        width: "78.1 mm",
        thickness: "8.6 mm",
        weight: "228 g",
        waterResistance: "IP68 Submersible (6m, 30 min)",
      },
    },
    model3D: {
      enabled: true,
      modelUrl: "/models/nexphone-pro-max.glb",
      fileFormat: "glb",
      fileSize: "4.8 MB",
      polygonCount: 52400,
      autoRotate: true,
      defaultColor: "#2b2d42",
      wireframeSupported: true,
    },
    createdAt: "2026-09-15T08:00:00.000Z",
    updatedAt: "2026-10-07T14:20:00.000Z",
  },
  {
    id: "prod-002",
    name: "NexPhone Enterprise Edge",
    slug: "nexphone-enterprise-edge",
    subtitle: "Hardware-isolated cryptoprocessor, dual eSIM enterprise routing, VoIP fleet ready",
    series: "Enterprise",
    status: "published",
    basePrice: 1499,
    compareAtPrice: 1699,
    costPrice: 850,
    rating: 4.8,
    isFeatured: true,
    colors: [
      { id: "c1", name: "Tactical Matte Black", hex: "#0f172a", inStock: true },
      { id: "c2", name: "Gunmetal Gray", hex: "#475569", inStock: true },
    ],
    storageOptions: [
      { id: "s1", capacity: "512GB", ram: "16GB ECC LPDDR5X", price: 1499, comparePrice: 1699, stock: 240, sku: "NX-ENT-512" },
      { id: "s2", capacity: "1TB", ram: "24GB ECC LPDDR5X", price: 1899, comparePrice: 2099, stock: 85, sku: "NX-ENT-1TB" },
    ],
    specifications: {
      display: {
        size: "6.7 inch",
        resolution: "2778 x 1284 OLED",
        panelType: "Privacy-Filtered Gorilla Glass Armor",
        refreshRate: "120Hz ProMotion",
        peakBrightness: "2,000 nits",
      },
      processor: {
        chipset: "NexCore Enterprise E-3 (Dual Titan Enclave)",
        cpu: "Octa-core 3.3GHz Secure Core",
        gpu: "NexGraphics Secure Virtual GPU",
        neuralEngine: "Hardware KMS & Quantum-Resistant Keygen",
      },
      camera: {
        main: "64MP Optical Sensor f/1.8",
        ultrawide: "48MP Document & Whiteboard Scanner",
        telephoto: "12MP 3x Optical",
        front: "24MP Privacy Shutter-Ready",
        features: ["Watermarked Evidence Mode", "Zero Cloud Exfiltration", "Encrypted EXIF"],
      },
      battery: {
        capacity: "5,800 mAh Heavy Duty",
        wiredCharging: "45W Fast PD 3.0",
        wirelessCharging: "15W Qi Standard",
      },
      connectivity: {
        cellular: "Dedicated Private 5G Band 48 (CBRS)",
        wifi: "Wi-Fi 7 Enterprise WPA3 192-bit",
        bluetooth: "Bluetooth 5.4 Enterprise Mesh",
        ports: "Hardened USB-C with Data-Kill Switch",
        sim: "Triple eSIM + Hardware Tamper Wire",
      },
      dimensions: {
        height: "162.0 mm",
        width: "77.5 mm",
        thickness: "9.2 mm",
        weight: "245 g",
        waterResistance: "MIL-STD-810H & IP69K High-Pressure Jet",
      },
    },
    model3D: {
      enabled: true,
      modelUrl: "/models/nexphone-enterprise.glb",
      fileFormat: "glb",
      fileSize: "6.2 MB",
      polygonCount: 68100,
      autoRotate: false,
      defaultColor: "#0f172a",
      wireframeSupported: true,
    },
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-10-06T11:45:00.000Z",
  },
  {
    id: "prod-003",
    name: "NexPhone Titanium Fold",
    slug: "nexphone-titanium-fold",
    subtitle: "Zero-gap titanium hinge, 8.0-inch inner canvas with stylus & split-multitasking",
    series: "Foldable",
    status: "published",
    basePrice: 1899,
    compareAtPrice: 1999,
    costPrice: 1100,
    rating: 4.9,
    isFeatured: true,
    colors: [
      { id: "c1", name: "Midnight Obsidian", hex: "#111827", inStock: true },
      { id: "c2", name: "Titanium Gold Horizon", hex: "#b45309", inStock: true },
      { id: "c3", name: "Emerald Mirror", hex: "#065f46", inStock: false },
    ],
    storageOptions: [
      { id: "s1", capacity: "512GB", ram: "16GB LPDDR5X", price: 1899, comparePrice: 1999, stock: 65, sku: "NX-FOLD-512" },
      { id: "s2", capacity: "1TB", ram: "16GB LPDDR5X", price: 2199, comparePrice: 2299, stock: 28, sku: "NX-FOLD-1TB" },
    ],
    specifications: {
      display: {
        size: "8.0 inch Inner / 6.4 inch Outer",
        resolution: "Inner: 2480 x 2200 / Outer: 2376 x 1060",
        panelType: "Foldable LTPO Ultra-Thin Glass (UTG)",
        refreshRate: "1-120Hz Dual Synchronized",
        peakBrightness: "2,800 nits Inner",
      },
      processor: {
        chipset: "NexCore AI Pro (3nm)",
        cpu: "Octa-core 3.4GHz",
        gpu: "NexGraphics Ray-Tracing Dual Display Engine",
        neuralEngine: "45 TOPS Real-time Translation NPU",
      },
      camera: {
        main: "108MP UltraClear f/1.8 OIS",
        ultrawide: "50MP 123° Panoramic",
        telephoto: "48MP 5x Optical Periscope",
        front: "Dual 16MP Under-Display Cameras",
        features: ["Hover Cam 90° tripod-free", "Dual-Preview Mirror", "Flex Director"],
      },
      battery: {
        capacity: "5,000 mAh Dual-Cell Balanced",
        wiredCharging: "65W HyperCharge",
        wirelessCharging: "20W Wireless",
      },
      connectivity: {
        cellular: "5G Global Bands Dual Standby",
        wifi: "Wi-Fi 7",
        bluetooth: "Bluetooth 5.4",
        ports: "USB-C 3.2 Gen 2",
        sim: "Dual SIM + Dual eSIM",
      },
      dimensions: {
        height: "159.2 mm",
        width: "Folded: 72.8 mm / Unfolded: 143.5 mm",
        thickness: "Folded: 11.2 mm / Unfolded: 5.4 mm",
        weight: "239 g",
        waterResistance: "IPX8 (Water-resistant 2m)",
      },
    },
    model3D: {
      enabled: true,
      modelUrl: "/models/nexphone-fold.glb",
      fileFormat: "glb",
      fileSize: "7.1 MB",
      polygonCount: 74200,
      autoRotate: true,
      defaultColor: "#111827",
      wireframeSupported: true,
    },
    createdAt: "2026-09-01T09:30:00.000Z",
    updatedAt: "2026-10-07T16:00:00.000Z",
  },
  {
    id: "prod-004",
    name: "NexPhone Lite",
    slug: "nexphone-lite",
    subtitle: "Ultra-slim 7.1mm profile, 50MP Sony sensor, 2-day battery life for everyday users",
    series: "Lite",
    status: "published",
    basePrice: 599,
    compareAtPrice: 649,
    costPrice: 320,
    rating: 4.7,
    isFeatured: false,
    colors: [
      { id: "c1", name: "Midnight Blue", hex: "#1e3a8a", inStock: true },
      { id: "c2", name: "Blush Coral", hex: "#f43f5e", inStock: true },
      { id: "c3", name: "Ice White", hex: "#f8fafc", inStock: true },
    ],
    storageOptions: [
      { id: "s1", capacity: "128GB", ram: "8GB LPDDR5", price: 599, comparePrice: 649, stock: 320, sku: "NX-LITE-128" },
      { id: "s2", capacity: "256GB", ram: "8GB LPDDR5", price: 699, comparePrice: 749, stock: 195, sku: "NX-LITE-256" },
    ],
    specifications: {
      display: {
        size: "6.36 inch",
        resolution: "2400 x 1080 FHD+",
        panelType: "OLED 120Hz HDR10+",
        refreshRate: "60-120Hz Dynamic",
        peakBrightness: "1,600 nits",
      },
      processor: {
        chipset: "NexCore Lite Gen 2 (4nm)",
        cpu: "Octa-core 2.8GHz Efficiency",
        gpu: "NexGraphics Lite",
        neuralEngine: "24 TOPS NPU",
      },
      camera: {
        main: "50MP Sony IMX890 OIS",
        ultrawide: "12MP 118° Ultra-Wide",
        telephoto: "Not equipped (2x sensor zoom)",
        front: "16MP Selfie",
        features: ["4K 60fps HDR", "Super Night Mode", "Portrait Bokeh"],
      },
      battery: {
        capacity: "4,600 mAh High Density",
        wiredCharging: "45W TurboCharge",
        wirelessCharging: "15W Qi",
      },
      connectivity: {
        cellular: "5G Sub-6",
        wifi: "Wi-Fi 6E (802.11ax)",
        bluetooth: "Bluetooth 5.3",
        ports: "USB-C 2.0",
        sim: "Dual Nano-SIM",
      },
      dimensions: {
        height: "152.8 mm",
        width: "71.2 mm",
        thickness: "7.1 mm",
        weight: "172 g",
        waterResistance: "IP67 (1m, 30 min)",
      },
    },
    model3D: {
      enabled: true,
      modelUrl: "/models/nexphone-lite.glb",
      fileFormat: "glb",
      fileSize: "3.4 MB",
      polygonCount: 38200,
      autoRotate: false,
      defaultColor: "#1e3a8a",
      wireframeSupported: true,
    },
    createdAt: "2026-07-20T12:00:00.000Z",
    updatedAt: "2026-09-30T10:15:00.000Z",
  },
];

/**
 * Fetch all phones in product catalog.
 */
export async function getProducts(): Promise<readonly PhoneProduct[]> {
  try {
    const res = await fetch(`${appConfig.apiUrl}/products`);
    if (res.ok) {
      return (await res.json()) as readonly PhoneProduct[];
    }
  } catch {
    // Fallback to local memory products
  }
  return memoryProducts;
}

/**
 * Fetch a single phone by ID or slug.
 */
export async function getProductById(idOrSlug: string): Promise<PhoneProduct | null> {
  const products = await getProducts();
  return (
    products.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null
  );
}

/**
 * Add a new phone model to the catalog.
 */
export async function createProduct(
  data: Omit<PhoneProduct, "id" | "createdAt" | "updatedAt">
): Promise<PhoneProduct> {
  const newProduct: PhoneProduct = {
    ...data,
    id: `prod-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${appConfig.apiUrl}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) {
      return (await res.json()) as PhoneProduct;
    }
  } catch {
    // Local memory update
  }

  memoryProducts = [newProduct, ...memoryProducts];
  return newProduct;
}

/**
 * Update an existing phone model by ID.
 */
export async function updateProduct(
  id: string,
  updates: Partial<PhoneProduct>
): Promise<PhoneProduct> {
  try {
    const res = await fetch(`${appConfig.apiUrl}/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      return (await res.json()) as PhoneProduct;
    }
  } catch {
    // Local memory update
  }

  const index = memoryProducts.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Product with ID ${id} not found.`);
  }

  const current = memoryProducts[index];
  if (!current) {
    throw new Error(`Product with ID ${id} not found.`);
  }

  const updated: PhoneProduct = {
    id: current.id,
    name: updates.name ?? current.name,
    slug: updates.slug ?? current.slug,
    subtitle: updates.subtitle ?? current.subtitle,
    series: updates.series ?? current.series,
    status: updates.status ?? current.status,
    basePrice: updates.basePrice ?? current.basePrice,
    compareAtPrice: updates.compareAtPrice !== undefined ? updates.compareAtPrice : current.compareAtPrice,
    costPrice: updates.costPrice !== undefined ? updates.costPrice : current.costPrice,
    rating: updates.rating ?? current.rating,
    isFeatured: updates.isFeatured ?? current.isFeatured,
    colors: updates.colors ? [...updates.colors] : current.colors,
    storageOptions: updates.storageOptions ? [...updates.storageOptions] : current.storageOptions,
    specifications: updates.specifications ? { ...updates.specifications } : current.specifications,
    model3D: updates.model3D ? { ...updates.model3D } : current.model3D,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  memoryProducts = [
    ...memoryProducts.slice(0, index),
    updated,
    ...memoryProducts.slice(index + 1),
  ];

  return updated;
}

/**
 * Delete a phone model from the catalog by ID.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${appConfig.apiUrl}/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return true;
    }
  } catch {
    // Local memory update
  }

  const initialLength = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  return memoryProducts.length < initialLength;
}
