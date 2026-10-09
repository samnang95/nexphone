import { appConfig } from "@/app/config/env";
import type { PhoneProduct, CatalogFilterState } from "@/types/product";

const API_BASE = appConfig.apiUrl.replace(/\/api\/?$/, "");

const FALLBACK_PRODUCTS: PhoneProduct[] = [
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
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    colors: [
      { id: "c1", name: "Tactical Matte Black", hex: "#0f172a", inStock: true },
      { id: "c2", name: "Gunmetal Gray", hex: "#475569", inStock: true },
    ],
    storageOptions: [
      { id: "s1", capacity: "512GB", ram: "16GB ECC LPDDR5X", price: 1499, comparePrice: 1699, stock: 78, sku: "NX-ENT-512" },
      { id: "s2", capacity: "1TB", ram: "24GB ECC LPDDR5X", price: 1799, comparePrice: 1999, stock: 35, sku: "NX-ENT-1TB" },
    ],
    specifications: {
      display: {
        size: "6.7 inch",
        resolution: "2778 x 1284 OLED Privacy Shield",
        panelType: "Anti-glare Matte Super AMOLED",
        refreshRate: "120Hz Constant",
        peakBrightness: "2,000 nits Sunlight Readability",
      },
      processor: {
        chipset: "NexCore Secure Enterprise v4",
        cpu: "Octa-core 3.3GHz Crypto-hardened",
        gpu: "NexGraphics Enterprise 16-Core",
        neuralEngine: "50 TOPS Isolated HSM NPU",
      },
      camera: {
        main: "108MP f/1.8 Security Cam with physical shutter",
        ultrawide: "48MP 120° Document Scanner",
        telephoto: "12MP 3x Optical Barcode Lens",
        front: "24MP Biometric FaceAuth 3D IR",
        features: ["Barcode/QR Rapid Reader", "Encrypted EXIF Metadata", "IR Night Inspection"],
      },
      battery: {
        capacity: "6,000 mAh Dual-Cell Hot-Swappable",
        wiredCharging: "80W SuperWired (Fleet Dock Ready)",
        wirelessCharging: "15W Qi Standard",
      },
      connectivity: {
        cellular: "Dual 5G SA/NSA Private APN support",
        wifi: "Wi-Fi 7 Enterprise 802.1X with WPA3",
        bluetooth: "Bluetooth 5.4 Industrial BLE Mesh",
        ports: "USB-C 3.2 + Pogo Pin Fleet Dock Connector",
        sim: "Dual Physical Nano-SIM + 4x Multi-eSIM",
      },
      dimensions: {
        height: "165.2 mm",
        width: "79.0 mm",
        thickness: "9.8 mm (Rugged Bumper)",
        weight: "254 g",
        waterResistance: "IP69K High-pressure steam & IP68 (MIL-STD-810H)",
      },
    },
    model3D: {
      enabled: true,
      modelUrl: "/models/nexphone-enterprise-edge.glb",
      fileFormat: "glb",
      fileSize: "6.2 MB",
      polygonCount: 68100,
      autoRotate: true,
      defaultColor: "#0f172a",
      wireframeSupported: true,
    },
    createdAt: "2026-08-20T10:30:00.000Z",
    updatedAt: "2026-10-06T11:15:00.000Z",
  },
  {
    id: "prod-003",
    name: "NexPhone Titanium Fold",
    slug: "nexphone-titanium-fold",
    subtitle: "Zero-gap teardrop flex hinge, 8.02-inch seamless inner display & stylus digitizer",
    series: "Foldable",
    status: "published",
    basePrice: 1899,
    compareAtPrice: 2099,
    costPrice: 1100,
    rating: 5.0,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80",
    colors: [
      { id: "c1", name: "Astral Obsidian", hex: "#18181b", inStock: true },
      { id: "c2", name: "Champagne Pearl", hex: "#fef3c7", inStock: true },
    ],
    storageOptions: [
      { id: "s1", capacity: "512GB", ram: "16GB LPDDR5X", price: 1899, comparePrice: 2099, stock: 24, sku: "NX-FOLD-512" },
      { id: "s2", capacity: "1TB", ram: "24GB LPDDR5X", price: 2199, comparePrice: 2399, stock: 12, sku: "NX-FOLD-1TB" },
    ],
    specifications: {
      display: {
        size: "8.02 inch Inner Foldable / 6.56 inch Outer Cover",
        resolution: "Inner: 2160 x 1916 / Outer: 2520 x 1080 FHD+",
        panelType: "Ultra-Thin Glass (UTG) Foldable AMOLED",
        refreshRate: "1-120Hz LTPO Dual adaptive screens",
        peakBrightness: "2,800 nits Peak HDR10+",
      },
      processor: {
        chipset: "NexCore Fold Ultra Elite (3nm)",
        cpu: "Octa-core 3.4GHz Extreme",
        gpu: "NexGraphics Ray-Tracing Dual VRAM",
        neuralEngine: "50 TOPS Dual-NPU Pipeline",
      },
      camera: {
        main: "50MP f/1.6 1/1.28\" Ultra-Sensor with Sensor-Shift",
        ultrawide: "48MP 12mm Ultra-Wide Macro",
        telephoto: "50MP 3.2x Portrait + 50MP 10x Periscope",
        front: "Under-Display 16MP Inner + 32MP Outer Punchhole",
        features: ["Flex Cam Tripod Mode", "Dual Preview Mode", "8K 24fps", "Stylus Annotation Cam"],
      },
      battery: {
        capacity: "5,000 mAh Dual Wing Split Battery",
        wiredCharging: "100W FlashCharge (0-100% in 28 min)",
        wirelessCharging: "50W Wireless Fast Charge",
      },
      connectivity: {
        cellular: "5G mmWave + Sub-6 Multi-Carrier",
        wifi: "Wi-Fi 7 Ready",
        bluetooth: "Bluetooth 5.4 Dual Audio",
        ports: "USB-C 3.2 Gen 2",
        sim: "Dual eSIM + Single Nano-SIM",
      },
      dimensions: {
        height: "161.8 mm",
        width: "Unfolded: 145.8 mm / Folded: 74.1 mm",
        thickness: "Unfolded: 4.9 mm / Folded: 10.4 mm",
        weight: "239 g",
        waterResistance: "IPX8 (1.5m fresh water, 30 min)",
      },
    },
    model3D: {
      enabled: true,
      modelUrl: "/models/nexphone-fold.glb",
      fileFormat: "glb",
      fileSize: "7.9 MB",
      polygonCount: 84200,
      autoRotate: true,
      defaultColor: "#18181b",
      wireframeSupported: true,
    },
    createdAt: "2026-09-28T16:00:00.000Z",
    updatedAt: "2026-10-07T18:40:00.000Z",
  },
  {
    id: "prod-004",
    name: "NexPhone Lite",
    slug: "nexphone-lite",
    subtitle: "Lightweight aluminum aero frame, full NexOS ecosystem compatibility, best value",
    series: "Lite",
    status: "published",
    basePrice: 599,
    compareAtPrice: 649,
    costPrice: 320,
    rating: 4.7,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
    colors: [
      { id: "c1", name: "Midnight Blue", hex: "#1e293b", inStock: true },
      { id: "c2", name: "Mint Emerald", hex: "#10b981", inStock: true },
      { id: "c3", name: "Blush Pink", hex: "#f472b6", inStock: true },
      { id: "c4", name: "Chalk White", hex: "#f8fafc", inStock: true },
    ],
    storageOptions: [
      { id: "s1", capacity: "128GB", ram: "8GB LPDDR5", price: 599, comparePrice: 649, stock: 310, sku: "NX-LITE-128" },
      { id: "s2", capacity: "256GB", ram: "8GB LPDDR5", price: 679, comparePrice: 729, stock: 145, sku: "NX-LITE-256" },
    ],
    specifications: {
      display: {
        size: "6.4 inch",
        resolution: "2400 x 1080 FHD+ (411 ppi)",
        panelType: "Fluid AMOLED 90Hz",
        refreshRate: "90Hz Smooth Motion",
        peakBrightness: "1,500 nits",
      },
      processor: {
        chipset: "NexCore Lite 7 Gen 2 (4nm)",
        cpu: "Octa-core 2.8GHz",
        gpu: "NexGraphics Core 8",
        neuralEngine: "24 TOPS AI Engine",
      },
      camera: {
        main: "64MP f/1.8 OIS Wide Angle",
        ultrawide: "12MP 118° Ultra-Wide",
        telephoto: "Not available (2x in-sensor crop)",
        front: "16MP HDR Selfie",
        features: ["4K 30fps Video", "Night Mode Lite", "Portrait Bokeh"],
      },
      battery: {
        capacity: "4,800 mAh High-Density",
        wiredCharging: "33W TurboCharge (50% in 25 min)",
        wirelessCharging: "Not supported",
      },
      connectivity: {
        cellular: "5G Sub-6 Worldwide",
        wifi: "Wi-Fi 6E Dual-Band",
        bluetooth: "Bluetooth 5.3",
        ports: "USB-C 2.0 Fast Transfer",
        sim: "Dual Nano-SIM",
      },
      dimensions: {
        height: "155.8 mm",
        width: "73.2 mm",
        thickness: "7.7 mm",
        weight: "172 g",
        waterResistance: "IP67 Splash & Dust Resistant",
      },
    },
    model3D: {
      enabled: false,
      modelUrl: "/models/nexphone-lite.glb",
      fileFormat: "glb",
      fileSize: "3.2 MB",
      polygonCount: 31500,
      autoRotate: false,
      defaultColor: "#1e293b",
      wireframeSupported: false,
    },
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-09-30T10:10:00.000Z",
  },
];

export const productService = {
  async getProducts(): Promise<PhoneProduct[]> {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return FALLBACK_PRODUCTS;

      // Ensure each product has an imageUrl attached
      return data.map((item: PhoneProduct, index: number) => {
        const fallback = FALLBACK_PRODUCTS[index % FALLBACK_PRODUCTS.length];
        return {
          ...item,
          imageUrl: item.imageUrl || fallback?.imageUrl,
        };
      });
    } catch {
      return FALLBACK_PRODUCTS;
    }
  },

  async getProductById(idOrSlug: string): Promise<PhoneProduct | null> {
    try {
      const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(idOrSlug)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      const fallback = FALLBACK_PRODUCTS.find(
        (p) => p.id === data.id || p.slug === data.slug
      );
      return {
        ...data,
        imageUrl: data.imageUrl || fallback?.imageUrl,
      };
    } catch {
      const found = FALLBACK_PRODUCTS.find(
        (p) => p.id === idOrSlug || p.slug === idOrSlug
      );
      return found || null;
    }
  },

  filterAndSort(
    products: PhoneProduct[],
    filters: CatalogFilterState
  ): PhoneProduct[] {
    let result = [...products];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.specifications.processor.chipset.toLowerCase().includes(q) ||
          p.specifications.camera.main.toLowerCase().includes(q)
      );
    }

    // 2. Series Filter
    if (filters.series !== "all") {
      result = result.filter((p) => {
        const s = p.series.toLowerCase();
        const target = filters.series.toLowerCase();
        return s.includes(target) || target.includes(s);
      });
    }

    // 3. Price Range Filter
    if (filters.priceRange !== "all") {
      switch (filters.priceRange) {
        case "under-700":
          result = result.filter((p) => p.basePrice < 700);
          break;
        case "700-1200":
          result = result.filter((p) => p.basePrice >= 700 && p.basePrice <= 1200);
          break;
        case "1200-1800":
          result = result.filter((p) => p.basePrice > 1200 && p.basePrice <= 1800);
          break;
        case "above-1800":
          result = result.filter((p) => p.basePrice > 1800);
          break;
      }
    }

    // 4. Rating Filter
    if (filters.minRating > 0) {
      result = result.filter((p) => p.rating >= filters.minRating);
    }

    // 5. In-Stock Only
    if (filters.inStockOnly) {
      result = result.filter((p) =>
        p.storageOptions.some((s) => s.stock > 0)
      );
    }

    // 6. Sorting
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "featured":
      default:
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.rating - a.rating;
        });
        break;
    }

    return result;
  },
};
