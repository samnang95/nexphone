import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { config } from "./config/env";

export const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.corsOrigins.length === 0 ||
        config.corsOrigins.includes(origin) ||
        config.isDev
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] \x1b[35m${req.method}\x1b[0m ${req.url} - flavor:\x1b[32m${config.flavor}\x1b[0m`);
  next();
});

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    app: config.appName,
    flavor: config.flavor,
    status: "online",
    docs: "/api/info",
  });
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    flavor: config.flavor,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Flavor inspection endpoint
app.get("/api/flavor", (_req: Request, res: Response) => {
  res.json({
    flavor: config.flavor,
    isDev: config.isDev,
    isStaging: config.isStaging,
    isProd: config.isProd,
    appName: config.appName,
    port: config.port,
    corsOrigins: config.corsOrigins,
  });
});

// Mock Fleet devices endpoint (matching NexPhone Admin requirements)
app.get("/api/devices", (_req: Request, res: Response) => {
  const flavorPrefix = config.flavor === "prod" ? "NX" : `NX-${config.flavor.toUpperCase()}`;
  res.json([
    {
      id: "dev-001",
      serialNumber: `${flavorPrefix}-8821-A`,
      model: "NexPhone Pro Max X",
      firmwareVersion: "v2.4.12",
      status: "online",
      batteryLevel: 94,
      lastPingAt: new Date().toISOString(),
      location: "San Francisco, US",
      environment: config.flavor,
    },
    {
      id: "dev-002",
      serialNumber: `${flavorPrefix}-8821-B`,
      model: "NexPhone Enterprise",
      firmwareVersion: "v2.4.10",
      status: "online",
      batteryLevel: 82,
      lastPingAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      location: "Tokyo, JP",
      environment: config.flavor,
    },
    {
      id: "dev-003",
      serialNumber: `${flavorPrefix}-7200-E`,
      model: "NexPhone Lite",
      firmwareVersion: "v2.3.9",
      status: "maintenance",
      batteryLevel: 41,
      lastPingAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      location: "Berlin, DE",
      environment: config.flavor,
    },
    {
      id: "dev-004",
      serialNumber: `${flavorPrefix}-9000-X`,
      model: "NexPhone Pro Max X",
      firmwareVersion: "v2.5.0-rc1",
      status: "provisioning",
      batteryLevel: 100,
      lastPingAt: new Date().toISOString(),
      location: "Singapore, SG",
      environment: config.flavor,
    },
  ]);
});

// Dashboard metrics summary endpoint
app.get("/api/dashboard/metrics", (_req: Request, res: Response) => {
  const isProd = config.isProd;
  const isStaging = config.isStaging;

  res.json({
    totalSales: {
      value: isProd ? "$482,900" : isStaging ? "$184,920" : "$48,250",
      changePercentage: 18.4,
      trend: "up",
      periodLabel: "vs prior 30 days",
      secondaryLabel: isProd ? "+$68,400" : "+$24,800",
    },
    totalOrders: {
      value: isProd ? "3,842" : isStaging ? "1,428" : "392",
      changePercentage: 8.2,
      trend: "up",
      periodLabel: "99.2% fulfillment rate",
      secondaryLabel: "24 pending fulfillment",
    },
    totalCustomers: {
      value: isProd ? "9,250" : isStaging ? "3,940" : "840",
      changePercentage: 14.1,
      trend: "up",
      periodLabel: "412 new this month",
      secondaryLabel: "94.8% retention rate",
    },
    totalProducts: {
      value: "28",
      changePercentage: 7.1,
      trend: "up",
      periodLabel: "4 product lines active",
      secondaryLabel: "98.4% in-stock health",
    },
    totalRevenue: {
      value: isProd ? "$482,900" : isStaging ? "$184,920" : "$48,250",
      changePercentage: 14.8,
      trend: "up",
      periodLabel: `vs prior 30 days [${config.flavor.toUpperCase()}]`,
    },
    activeDevices: {
      value: isProd ? "8,420" : isStaging ? "1,250" : "42",
      changePercentage: 5.2,
      trend: "up",
      periodLabel: "98.2% fleet online",
    },
    systemHealth: {
      value: "99.98%",
      changePercentage: -0.01,
      trend: "down",
      periodLabel: "VoIP gateway uptime",
    },
    supportTickets: {
      value: "14",
      changePercentage: 0,
      trend: "neutral",
      periodLabel: "pending tier-2 triage",
    },
  });
});

// Revenue overview endpoint
app.get("/api/dashboard/revenue", (_req: Request, res: Response) => {
  res.json({
    totalYearToDate: "$1,842,500",
    projectedArr: "$2,210,000",
    avgOrderValue: "$1,289.40",
    monthlyPoints: [
      { label: "Mar", amount: 112000, hardwareAmount: 76000, serviceAmount: 36000, targetAmount: 100000 },
      { label: "Apr", amount: 128000, hardwareAmount: 85000, serviceAmount: 43000, targetAmount: 115000 },
      { label: "May", amount: 142000, hardwareAmount: 94000, serviceAmount: 48000, targetAmount: 130000 },
      { label: "Jun", amount: 139000, hardwareAmount: 89000, serviceAmount: 50000, targetAmount: 135000 },
      { label: "Jul", amount: 158000, hardwareAmount: 103000, serviceAmount: 55000, targetAmount: 145000 },
      { label: "Aug", amount: 169000, hardwareAmount: 110000, serviceAmount: 59000, targetAmount: 160000 },
      { label: "Sep", amount: 174000, hardwareAmount: 112000, serviceAmount: 62000, targetAmount: 170000 },
      { label: "Oct", amount: 184920, hardwareAmount: 118348, serviceAmount: 66572, targetAmount: 180000 },
    ],
    categoryBreakdown: [
      {
        category: "Hardware & Devices",
        amount: "$118,348",
        rawAmount: 118348,
        percentage: 64,
        color: "bg-indigo-500",
      },
      {
        category: "VoIP Subscriptions",
        amount: "$48,079",
        rawAmount: 48079,
        percentage: 26,
        color: "bg-emerald-500",
      },
      {
        category: "Care+ & Enterprise SLA",
        amount: "$18,493",
        rawAmount: 18493,
        percentage: 10,
        color: "bg-blue-400",
      },
    ],
  });
});

// Recent orders endpoint
app.get("/api/dashboard/orders", (_req: Request, res: Response) => {
  res.json([
    {
      id: "NX-ORD-9042",
      customerName: "Alex Vance",
      customerEmail: "a.vance@blackmesa.io",
      customerLocation: "Seattle, US",
      productName: "NexPhone Pro Max X (512GB Space Gray)",
      productSku: "NX-PRO-MAX-512-SG",
      quantity: 1,
      amount: "$1,299.00",
      status: "completed",
      paymentMethod: "Stripe •••• 4242",
      createdAt: "12 mins ago",
      trackingNumber: "TRK-9821-4821",
      shippingCarrier: "FedEx Priority",
    },
    {
      id: "NX-ORD-9041",
      customerName: "Sophia Tanaka",
      customerEmail: "s.tanaka@cyberdyne.co.jp",
      customerLocation: "Tokyo, JP",
      productName: "NexPhone Enterprise Edge Fleet Pack",
      productSku: "NX-ENT-EDGE-5PK",
      quantity: 5,
      amount: "$5,495.00",
      status: "processing",
      paymentMethod: "Corporate Wire Transfer",
      createdAt: "38 mins ago",
      trackingNumber: "Pending dispatch",
      shippingCarrier: "DHL Global Express",
    },
    {
      id: "NX-ORD-9040",
      customerName: "Marcus Sterling",
      customerEmail: "m.sterling@acmeholdings.com",
      customerLocation: "London, UK",
      productName: "NexPhone Pro Max X (256GB Silver)",
      productSku: "NX-PRO-MAX-256-SL",
      quantity: 2,
      amount: "$2,198.00",
      status: "shipped",
      paymentMethod: "Apple Pay",
      createdAt: "2 hours ago",
      trackingNumber: "TRK-4412-9901",
      shippingCarrier: "UPS Worldwide",
    },
    {
      id: "NX-ORD-9039",
      customerName: "Elena Rostova",
      customerEmail: "e.rostova@berlin-tech.de",
      customerLocation: "Berlin, DE",
      productName: "NexPhone Lite (128GB Midnight Blue)",
      productSku: "NX-LITE-128-MB",
      quantity: 1,
      amount: "$599.00",
      status: "completed",
      paymentMethod: "Stripe •••• 8821",
      createdAt: "5 hours ago",
      trackingNumber: "TRK-1209-7712",
      shippingCarrier: "DHL Express",
    },
    {
      id: "NX-ORD-9038",
      customerName: "David Chen",
      customerEmail: "d.chen@apexvoip.sg",
      customerLocation: "Singapore, SG",
      productName: "NexPhone Enterprise Desk Base Station",
      productSku: "NX-DESK-BASE-V2",
      quantity: 3,
      amount: "$1,497.00",
      status: "pending",
      paymentMethod: "Purchase Order #8812",
      createdAt: "Yesterday",
      trackingNumber: "Awaiting approval",
      shippingCarrier: "SingPost Courier",
    },
    {
      id: "NX-ORD-9037",
      customerName: "Sarah Connor",
      customerEmail: "s.connor@skyfleet.org",
      customerLocation: "Austin, US",
      productName: "NexPhone Pro Max X (1TB Titanium)",
      productSku: "NX-PRO-MAX-1TB-TI",
      quantity: 1,
      amount: "$1,499.00",
      status: "completed",
      paymentMethod: "Stripe •••• 9011",
      createdAt: "Yesterday",
      trackingNumber: "TRK-8812-4019",
      shippingCarrier: "FedEx Standard",
    },
  ]);
});

// Mock Products Catalog State
let productsCatalog = [
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
    status: "draft",
    basePrice: 1899,
    compareAtPrice: 2099,
    costPrice: 1100,
    rating: 5.0,
    isFeatured: true,
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
        chipset: "NexCore AI Fold Ultra (3nm)",
        cpu: "Octa-core 3.4GHz Extreme",
        gpu: "NexGraphics Ray-Tracing Duo",
        neuralEngine: "48 TOPS Generative AI Engine",
      },
      camera: {
        main: "50MP 1-inch Sony IMX989 Sensor OIS",
        ultrawide: "50MP 115° Freeform Distortion-Free",
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

// Product Catalog CRUD Endpoints
app.get("/api/products", (req: Request, res: Response) => {
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

app.get("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const product = productsCatalog.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found", id });
    return;
  }
  res.json(product);
});

app.post("/api/products", (req: Request, res: Response) => {
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

app.put("/api/products/:id", (req: Request, res: Response) => {
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

app.delete("/api/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = productsCatalog.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Product not found", id });
    return;
  }
  const [deleted] = productsCatalog.splice(index, 1);
  res.json({ success: true, deletedId: id, name: deleted?.name ?? "Phone" });
});


