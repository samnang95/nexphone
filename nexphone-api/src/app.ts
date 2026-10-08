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

// Brands Catalog Data & CRUD Endpoints
interface BrandRecord {
  id: string;
  name: string;
  slug: string;
  code: string;
  logoUrl?: string;
  logoIcon?: "shield" | "sparkles" | "cpu" | "globe" | "zap" | "gem" | "layers";
  accentColor: string;
  description: string;
  country: string;
  headquarters: string;
  foundedYear: number;
  website: string;
  supportEmail: string;
  status: "active" | "inactive" | "pending";
  tier: "Flagship" | "Enterprise" | "OEM Partner" | "Strategic";
  isFeatured: boolean;
  deviceCount: number;
  marketShare: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const brandsCatalog: BrandRecord[] = [
  {
    id: "brand-001",
    name: "NexPhone Labs",
    slug: "nexphone-labs",
    code: "NX",
    logoIcon: "sparkles",
    accentColor: "#6366f1",
    description: "Pioneering next-generation quantum-accelerated smartphones with native NexOS intelligence, titanium precision architecture, and enterprise VoIP encryption.",
    country: "United States",
    headquarters: "San Francisco, CA",
    foundedYear: 2024,
    website: "https://nexphone.io",
    supportEmail: "engineering@nexphone.io",
    status: "active",
    tier: "Flagship",
    isFeatured: true,
    deviceCount: 4,
    marketShare: "38.4%",
    rating: 4.9,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-10-07T12:00:00.000Z",
  },
  {
    id: "brand-002",
    name: "Titanium Dynamics",
    slug: "titanium-dynamics",
    code: "TTN",
    logoIcon: "shield",
    accentColor: "#0ea5e9",
    description: "Specialized in ultra-rugged aerospace grade titanium alloys, mil-spec drops, extreme environment survival, and secure satellite communications.",
    country: "Germany",
    headquarters: "Munich, Bavaria",
    foundedYear: 2021,
    website: "https://titanium-dynamics.de",
    supportEmail: "partner-support@titanium-dynamics.de",
    status: "active",
    tier: "Flagship",
    isFeatured: true,
    deviceCount: 2,
    marketShare: "22.1%",
    rating: 4.8,
    createdAt: "2026-08-10T14:30:00.000Z",
    updatedAt: "2026-10-06T15:20:00.000Z",
  },
  {
    id: "brand-003",
    name: "Aero Dynamic Tech",
    slug: "aero-dynamic-tech",
    code: "AERO",
    logoIcon: "zap",
    accentColor: "#10b981",
    description: "Engineers of featherweight aeronautical composites, carbon fiber unibody enclosures, and high-efficiency thermal vapor chamber architecture.",
    country: "Japan",
    headquarters: "Tokyo, Chiyoda",
    foundedYear: 2019,
    website: "https://aerotech.co.jp",
    supportEmail: "contact@aerotech.co.jp",
    status: "active",
    tier: "OEM Partner",
    isFeatured: false,
    deviceCount: 1,
    marketShare: "14.8%",
    rating: 4.7,
    createdAt: "2026-08-15T09:15:00.000Z",
    updatedAt: "2026-10-05T11:45:00.000Z",
  },
  {
    id: "brand-004",
    name: "Quantum Devices Inc",
    slug: "quantum-devices",
    code: "QTM",
    logoIcon: "cpu",
    accentColor: "#8b5cf6",
    description: "Enterprise grade communications hardware, zero-trust hardware security modules (HSM), biometric defense clusters, and dedicated private APN modems.",
    country: "United Kingdom",
    headquarters: "London, City",
    foundedYear: 2020,
    website: "https://quantumdevices.co.uk",
    supportEmail: "fleet-sales@quantumdevices.co.uk",
    status: "active",
    tier: "Enterprise",
    isFeatured: true,
    deviceCount: 3,
    marketShare: "11.2%",
    rating: 4.8,
    createdAt: "2026-08-20T16:00:00.000Z",
    updatedAt: "2026-10-04T17:10:00.000Z",
  },
  {
    id: "brand-005",
    name: "Apex Mobile Systems",
    slug: "apex-mobile-systems",
    code: "APX",
    logoIcon: "gem",
    accentColor: "#f59e0b",
    description: "Next-generation foldable displays, zero-gap flex teardrop hinge patents, and ultra-high dynamic range micro-lens array OLED technologies.",
    country: "South Korea",
    headquarters: "Seoul, Gangnam",
    foundedYear: 2023,
    website: "https://apexmobile.kr",
    supportEmail: "bd@apexmobile.kr",
    status: "pending",
    tier: "Strategic",
    isFeatured: false,
    deviceCount: 0,
    marketShare: "8.5%",
    rating: 4.6,
    createdAt: "2026-09-01T11:00:00.000Z",
    updatedAt: "2026-10-02T13:30:00.000Z",
  },
  {
    id: "brand-006",
    name: "Lumina Telecom",
    slug: "lumina-telecom",
    code: "LMN",
    logoIcon: "globe",
    accentColor: "#ec4899",
    description: "Carrier infrastructure grade handsets, optimized for massive low-earth orbit satellite direct-to-cell links and high-bandwidth millimeter wave antennas.",
    country: "Singapore",
    headquarters: "Marina Bay Financial Centre",
    foundedYear: 2022,
    website: "https://luminatelecom.sg",
    supportEmail: "support@luminatelecom.sg",
    status: "inactive",
    tier: "Enterprise",
    isFeatured: false,
    deviceCount: 1,
    marketShare: "5.0%",
    rating: 4.4,
    createdAt: "2026-09-10T08:20:00.000Z",
    updatedAt: "2026-09-28T09:15:00.000Z",
  },
];

// Brand CRUD Endpoints
app.get("/api/brands", (req: Request, res: Response) => {
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

app.get("/api/brands/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const brand = brandsCatalog.find((b) => b.id === id);
  if (!brand) {
    res.status(404).json({ error: "Brand not found", id });
    return;
  }
  res.json(brand);
});

app.post("/api/brands", (req: Request, res: Response) => {
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

app.put("/api/brands/:id", (req: Request, res: Response) => {
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

app.delete("/api/brands/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = brandsCatalog.findIndex((b) => b.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Brand not found", id });
    return;
  }
  const [deleted] = brandsCatalog.splice(index, 1);
  res.json({ success: true, deletedId: id, name: deleted?.name ?? "Brand" });
});

// Inventory Management Data & CRUD Endpoints
interface InventoryItemRecord {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  sku: string;
  variantCapacity: string;
  variantRam: string;
  colorFinishes: string[];
  warehouse: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  unitCost: number;
  retailPrice: number;
  totalValue: number;
  status: "in_stock" | "low_stock" | "out_of_stock" | "overstocked";
  lastRestocked: string;
  updatedAt: string;
}

interface InventoryMovementRecord {
  id: string;
  inventoryItemId: string;
  sku: string;
  productName: string;
  changeAmount: number;
  previousStock: number;
  newStock: number;
  reason: "restock_po" | "audit_correction" | "damage_writeoff" | "customer_return" | "warehouse_transfer";
  notes: string;
  performedBy: string;
  createdAt: string;
}

function calculateStockStatus(qty: number, threshold: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (qty <= 0) return "out_of_stock";
  if (qty <= threshold) return "low_stock";
  return "in_stock";
}

const inventoryCatalog: InventoryItemRecord[] = [
  {
    id: "inv-nx-pro-256",
    productId: "prod-001",
    productName: "NexPhone Pro Max X",
    brandName: "NexPhone Labs",
    sku: "NX-PRO-256",
    variantCapacity: "256GB",
    variantRam: "12GB LPDDR5X",
    colorFinishes: ["Titanium Space Gray", "Silver Frost", "Deep Cobalt"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 184,
    reservedQuantity: 14,
    availableQuantity: 170,
    lowStockThreshold: 30,
    reorderPoint: 50,
    unitCost: 680,
    retailPrice: 1199,
    totalValue: 125120,
    status: "in_stock",
    lastRestocked: "2026-10-02T14:30:00.000Z",
    updatedAt: "2026-10-07T18:00:00.000Z",
  },
  {
    id: "inv-nx-pro-512",
    productId: "prod-001",
    productName: "NexPhone Pro Max X",
    brandName: "NexPhone Labs",
    sku: "NX-PRO-512",
    variantCapacity: "512GB",
    variantRam: "16GB LPDDR5X",
    colorFinishes: ["Titanium Space Gray", "Silver Frost", "Deep Cobalt"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 96,
    reservedQuantity: 8,
    availableQuantity: 88,
    lowStockThreshold: 25,
    reorderPoint: 40,
    unitCost: 750,
    retailPrice: 1399,
    totalValue: 72000,
    status: "in_stock",
    lastRestocked: "2026-09-28T09:15:00.000Z",
    updatedAt: "2026-10-06T12:00:00.000Z",
  },
  {
    id: "inv-nx-pro-1tb",
    productId: "prod-001",
    productName: "NexPhone Pro Max X",
    brandName: "NexPhone Labs",
    sku: "NX-PRO-1TB",
    variantCapacity: "1TB",
    variantRam: "16GB LPDDR5X",
    colorFinishes: ["Titanium Space Gray", "Desert Sand Gold"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 18,
    reservedQuantity: 5,
    availableQuantity: 13,
    lowStockThreshold: 25,
    reorderPoint: 35,
    unitCost: 890,
    retailPrice: 1599,
    totalValue: 16020,
    status: "low_stock",
    lastRestocked: "2026-09-15T11:00:00.000Z",
    updatedAt: "2026-10-07T16:45:00.000Z",
  },
  {
    id: "inv-nx-ent-256",
    productId: "prod-002",
    productName: "NexPhone Enterprise Secure",
    brandName: "NexPhone Labs",
    sku: "NX-ENT-256",
    variantCapacity: "256GB",
    variantRam: "16GB ECC LPDDR5X",
    colorFinishes: ["Tactical Matte Black", "Armor Gunmetal"],
    warehouse: "EU-Central Hub (FRA)",
    stockQuantity: 520,
    reservedQuantity: 65,
    availableQuantity: 455,
    lowStockThreshold: 80,
    reorderPoint: 120,
    unitCost: 790,
    retailPrice: 1399,
    totalValue: 410800,
    status: "in_stock",
    lastRestocked: "2026-10-04T10:00:00.000Z",
    updatedAt: "2026-10-07T08:30:00.000Z",
  },
  {
    id: "inv-nx-ent-512",
    productId: "prod-002",
    productName: "NexPhone Enterprise Secure",
    brandName: "NexPhone Labs",
    sku: "NX-ENT-512",
    variantCapacity: "512GB",
    variantRam: "16GB ECC LPDDR5X",
    colorFinishes: ["Tactical Matte Black", "Armor Gunmetal"],
    warehouse: "EU-Central Hub (FRA)",
    stockQuantity: 310,
    reservedQuantity: 40,
    availableQuantity: 270,
    lowStockThreshold: 60,
    reorderPoint: 100,
    unitCost: 860,
    retailPrice: 1599,
    totalValue: 266600,
    status: "in_stock",
    lastRestocked: "2026-09-29T16:20:00.000Z",
    updatedAt: "2026-10-06T14:10:00.000Z",
  },
  {
    id: "inv-nx-fold-512",
    productId: "prod-003",
    productName: "NexPhone Titanium Fold",
    brandName: "Titanium Dynamics",
    sku: "NX-FOLD-512",
    variantCapacity: "512GB",
    variantRam: "16GB LPDDR5X",
    colorFinishes: ["Astral Obsidian", "Champagne Pearl"],
    warehouse: "APAC Hub (HND)",
    stockQuantity: 14,
    reservedQuantity: 4,
    availableQuantity: 10,
    lowStockThreshold: 20,
    reorderPoint: 30,
    unitCost: 1100,
    retailPrice: 1899,
    totalValue: 15400,
    status: "low_stock",
    lastRestocked: "2026-09-18T13:40:00.000Z",
    updatedAt: "2026-10-07T11:20:00.000Z",
  },
  {
    id: "inv-nx-fold-1tb",
    productId: "prod-003",
    productName: "NexPhone Titanium Fold",
    brandName: "Titanium Dynamics",
    sku: "NX-FOLD-1TB",
    variantCapacity: "1TB",
    variantRam: "24GB LPDDR5X",
    colorFinishes: ["Astral Obsidian"],
    warehouse: "APAC Hub (HND)",
    stockQuantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    lowStockThreshold: 15,
    reorderPoint: 25,
    unitCost: 1250,
    retailPrice: 2199,
    totalValue: 0,
    status: "out_of_stock",
    lastRestocked: "2026-08-30T09:00:00.000Z",
    updatedAt: "2026-10-07T09:00:00.000Z",
  },
  {
    id: "inv-nx-lite-128",
    productId: "prod-004",
    productName: "NexPhone Lite",
    brandName: "Aero Dynamic Tech",
    sku: "NX-LITE-128",
    variantCapacity: "128GB",
    variantRam: "8GB LPDDR5",
    colorFinishes: ["Midnight Blue", "Mint Emerald", "Chalk White"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 310,
    reservedQuantity: 28,
    availableQuantity: 282,
    lowStockThreshold: 50,
    reorderPoint: 75,
    unitCost: 320,
    retailPrice: 599,
    totalValue: 99200,
    status: "in_stock",
    lastRestocked: "2026-10-01T15:10:00.000Z",
    updatedAt: "2026-10-06T17:00:00.000Z",
  },
  {
    id: "inv-nx-lite-256",
    productId: "prod-004",
    productName: "NexPhone Lite",
    brandName: "Aero Dynamic Tech",
    sku: "NX-LITE-256",
    variantCapacity: "256GB",
    variantRam: "8GB LPDDR5",
    colorFinishes: ["Midnight Blue", "Blush Pink"],
    warehouse: "US-West Central Hub (SFO)",
    stockQuantity: 145,
    reservedQuantity: 12,
    availableQuantity: 133,
    lowStockThreshold: 40,
    reorderPoint: 60,
    unitCost: 360,
    retailPrice: 679,
    totalValue: 52200,
    status: "in_stock",
    lastRestocked: "2026-09-25T12:00:00.000Z",
    updatedAt: "2026-10-05T19:30:00.000Z",
  },
  {
    id: "inv-qtm-shield-512",
    productId: "prod-005",
    productName: "Quantum Cipher Sentinel",
    brandName: "Quantum Devices Inc",
    sku: "QTM-CIPHER-512",
    variantCapacity: "512GB",
    variantRam: "16GB CryptoRAM",
    colorFinishes: ["Obsidian Shield"],
    warehouse: "EU-Central Hub (FRA)",
    stockQuantity: 8,
    reservedQuantity: 2,
    availableQuantity: 6,
    lowStockThreshold: 15,
    reorderPoint: 25,
    unitCost: 1150,
    retailPrice: 1950,
    totalValue: 9200,
    status: "low_stock",
    lastRestocked: "2026-09-10T14:00:00.000Z",
    updatedAt: "2026-10-07T15:00:00.000Z",
  },
];

const inventoryMovements: InventoryMovementRecord[] = [
  {
    id: "mov-001",
    inventoryItemId: "inv-nx-pro-256",
    sku: "NX-PRO-256",
    productName: "NexPhone Pro Max X",
    changeAmount: 50,
    previousStock: 134,
    newStock: 184,
    reason: "restock_po",
    notes: "PO-8491 shipment received from Fremont Advanced Manufacturing facility",
    performedBy: "Alex Chen (Logistics Mgr)",
    createdAt: "2026-10-02T14:30:00.000Z",
  },
  {
    id: "mov-002",
    inventoryItemId: "inv-nx-fold-1tb",
    sku: "NX-FOLD-1TB",
    productName: "NexPhone Titanium Fold",
    changeAmount: -4,
    previousStock: 4,
    newStock: 0,
    reason: "warehouse_transfer",
    notes: "Expedited transfer to Tokyo Flagship Store VIP showroom demo fleet",
    performedBy: "Kenji Sato (APAC Ops)",
    createdAt: "2026-10-07T09:00:00.000Z",
  },
  {
    id: "mov-003",
    inventoryItemId: "inv-qtm-shield-512",
    sku: "QTM-CIPHER-512",
    productName: "Quantum Cipher Sentinel",
    changeAmount: -2,
    previousStock: 10,
    newStock: 8,
    reason: "damage_writeoff",
    notes: "Package damaged in transit during air freight security clearance",
    performedBy: "Marcus Vance (Security Auditing)",
    createdAt: "2026-10-07T15:00:00.000Z",
  },
];

// Inventory Endpoints
app.get("/api/inventory", (req: Request, res: Response) => {
  const { search, status, warehouse, onlyAlerts } = req.query;
  let items = [...inventoryCatalog];

  if (status && typeof status === "string" && status !== "all") {
    items = items.filter((item) => item.status === status);
  }

  if (warehouse && typeof warehouse === "string" && warehouse !== "all") {
    items = items.filter((item) => item.warehouse.toLowerCase().includes(warehouse.toLowerCase()));
  }

  if (onlyAlerts === "true") {
    items = items.filter((item) => item.status === "low_stock" || item.status === "out_of_stock");
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.brandName.toLowerCase().includes(q) ||
        item.warehouse.toLowerCase().includes(q)
    );
  }

  res.json(items);
});

app.get("/api/inventory/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const item = inventoryCatalog.find((i) => i.id === id);
  if (!item) {
    res.status(404).json({ error: "Inventory item not found", id });
    return;
  }
  res.json(item);
});

app.post("/api/inventory/adjust", (req: Request, res: Response) => {
  const { inventoryItemId, type, quantity, reason, notes, performedBy } = req.body;
  const index = inventoryCatalog.findIndex((i) => i.id === inventoryItemId);
  const current = inventoryCatalog[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Inventory item not found", inventoryItemId });
    return;
  }

  const prevStock = current.stockQuantity;
  let newStock = prevStock;
  const changeAmountNum = Number(quantity) || 0;

  if (type === "add") {
    newStock = prevStock + changeAmountNum;
  } else if (type === "subtract") {
    newStock = Math.max(0, prevStock - changeAmountNum);
  } else if (type === "set") {
    newStock = Math.max(0, changeAmountNum);
  }

  const changeDelta = newStock - prevStock;
  const newStatus = calculateStockStatus(newStock, current.lowStockThreshold);
  const newAvailable = Math.max(0, newStock - current.reservedQuantity);
  const newTotalVal = newStock * current.unitCost;

  const updated: InventoryItemRecord = {
    ...current,
    stockQuantity: newStock,
    availableQuantity: newAvailable,
    totalValue: newTotalVal,
    status: newStatus,
    lastRestocked: type === "add" ? new Date().toISOString() : current.lastRestocked,
    updatedAt: new Date().toISOString(),
  };

  inventoryCatalog[index] = updated;

  const movement: InventoryMovementRecord = {
    id: `mov-${Date.now().toString(36)}`,
    inventoryItemId,
    sku: current.sku,
    productName: current.productName,
    changeAmount: changeDelta,
    previousStock: prevStock,
    newStock,
    reason: reason || "audit_correction",
    notes: notes || "Manual inventory adjustment via Admin console",
    performedBy: performedBy || "System Admin",
    createdAt: new Date().toISOString(),
  };

  inventoryMovements.unshift(movement);

  res.json({ item: updated, movement });
});

app.put("/api/inventory/:id/threshold", (req: Request, res: Response) => {
  const { id } = req.params;
  const { lowStockThreshold, reorderPoint } = req.body;
  const index = inventoryCatalog.findIndex((i) => i.id === id);
  const current = inventoryCatalog[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Inventory item not found", id });
    return;
  }

  const newThreshold = Number(lowStockThreshold) ?? current.lowStockThreshold;
  const newReorder = Number(reorderPoint) ?? current.reorderPoint;
  const newStatus = calculateStockStatus(current.stockQuantity, newThreshold);

  const updated: InventoryItemRecord = {
    ...current,
    lowStockThreshold: newThreshold,
    reorderPoint: newReorder,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  inventoryCatalog[index] = updated;
  res.json(updated);
});

app.get("/api/inventory-movements", (req: Request, res: Response) => {
  const { itemId } = req.query;
  let movements = [...inventoryMovements];

  if (itemId && typeof itemId === "string") {
    movements = movements.filter((m) => m.inventoryItemId === itemId);
  }

  res.json(movements);
});

// ==========================================
// FEATURE: ORDER MANAGEMENT SUITE
// ==========================================

interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    variantCapacity?: string;
    variantRam?: string;
    colorName?: string;
    colorHex?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  payment: {
    status: "paid" | "pending" | "refunded" | "failed";
    method: "credit_card" | "stripe" | "apple_pay" | "corporate_wire" | "purchase_order";
    methodLabel: string;
    transactionId?: string;
    paidAt?: string;
    amount: number;
    currency: string;
  };
  shipping: {
    carrier: string;
    service: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  timeline: Array<{
    id: string;
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    label: string;
    description: string;
    timestamp: string;
    actor: string;
  }>;
  notes?: string;
  cancelReason?: string;
}

const ordersStore: OrderRecord[] = [
  {
    id: "NX-ORD-9042",
    orderNumber: "NX-ORD-9042",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: "delivered",
    customer: {
      id: "cust-001",
      name: "Alex Vance",
      email: "a.vance@blackmesa.io",
      phone: "+1 (206) 555-0194",
      company: "Black Mesa Aerospace",
      shippingAddress: {
        street: "742 Evergreen Terrace",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        country: "United States",
      },
    },
    items: [
      {
        id: "item-001",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-512-SG",
        variantCapacity: "512GB",
        variantRam: "16GB LPDDR5X",
        colorName: "Titanium Space Gray",
        colorHex: "#2b2d42",
        quantity: 1,
        unitPrice: 1299,
        totalPrice: 1299,
      },
    ],
    subtotal: 1299,
    tax: 110.42,
    shippingFee: 0,
    discount: 0,
    totalAmount: 1409.42,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Stripe •••• 4242",
      transactionId: "ch_3MvY8k2eZvKYlo2C192",
      paidAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      amount: 1409.42,
      currency: "USD",
    },
    shipping: {
      carrier: "FedEx",
      service: "FedEx Priority Overnight",
      trackingNumber: "TRK-9821-4821",
      trackingUrl: "https://fedex.com/track?trk=TRK-9821-4821",
      estimatedDelivery: "Delivered",
      shippedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      deliveredAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    timeline: [
      {
        id: "tl-01",
        status: "pending",
        label: "Order Placed",
        description: "Customer completed checkout via NexPhone Web Store",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        actor: "System",
      },
      {
        id: "tl-02",
        status: "confirmed",
        label: "Payment Verified",
        description: "Payment confirmed via Stripe Gateway",
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        actor: "Stripe Gateway",
      },
      {
        id: "tl-03",
        status: "processing",
        label: "Allocated at US-West Hub",
        description: "Order batched for dispatch at SFO Central Hub",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        actor: "Warehouse Dispatch",
      },
      {
        id: "tl-04",
        status: "delivered",
        label: "Delivered & Signed",
        description: "Package received and signed by recipient",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        actor: "FedEx Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9041",
    orderNumber: "NX-ORD-9041",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "processing",
    customer: {
      id: "cust-002",
      name: "Sophia Tanaka",
      email: "s.tanaka@cyberdyne.co.jp",
      phone: "+81 3 5555 0188",
      company: "Cyberdyne Systems Tokyo",
      shippingAddress: {
        street: "2-11-3 Roppongi Hills Mori Tower",
        city: "Minato-ku",
        state: "Tokyo",
        zipCode: "106-6108",
        country: "Japan",
      },
    },
    items: [
      {
        id: "item-002",
        productId: "prod-002",
        productName: "NexPhone Enterprise Edge Fleet Pack",
        sku: "NX-ENT-EDGE-5PK",
        variantCapacity: "256GB ECC",
        variantRam: "16GB RAM",
        colorName: "Obsidian Black",
        colorHex: "#0f172a",
        quantity: 5,
        unitPrice: 1099,
        totalPrice: 5495,
      },
    ],
    subtotal: 5495,
    tax: 439.6,
    shippingFee: 150,
    discount: 250,
    totalAmount: 5834.6,
    payment: {
      status: "paid",
      method: "corporate_wire",
      methodLabel: "Corporate Wire Transfer",
      transactionId: "WIRE-JP-901844",
      paidAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      amount: 5834.6,
      currency: "USD",
    },
    shipping: {
      carrier: "DHL",
      service: "DHL Global Express Worldwide",
      trackingNumber: "DHL-8419-0021",
      trackingUrl: "https://dhl.com/track?id=DHL-8419-0021",
      estimatedDelivery: "2 Business Days",
    },
    timeline: [
      {
        id: "tl-11",
        status: "pending",
        label: "Purchase Order Initiated",
        description: "Enterprise bulk order received for 5 hardware units",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        actor: "Enterprise Portal",
      },
      {
        id: "tl-12",
        status: "confirmed",
        label: "Wire Cleared",
        description: "Corporate treasury confirmed receipt of funds",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        actor: "Finance Ops",
      },
      {
        id: "tl-13",
        status: "processing",
        label: "Custom Hardware Provisioning",
        description: "Flashing custom enterprise cryptographic certificates",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        actor: "APAC Tech Ops",
      },
    ],
  },
  {
    id: "NX-ORD-9040",
    orderNumber: "NX-ORD-9040",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "shipped",
    customer: {
      id: "cust-003",
      name: "Marcus Sterling",
      email: "m.sterling@acmeholdings.com",
      phone: "+44 20 7946 0912",
      company: "Acme Capital Holdings",
      shippingAddress: {
        street: "25 Bank Street, Canary Wharf",
        city: "London",
        state: "Greater London",
        zipCode: "E14 5JP",
        country: "United Kingdom",
      },
    },
    items: [
      {
        id: "item-003",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-256-SL",
        variantCapacity: "256GB",
        variantRam: "12GB LPDDR5X",
        colorName: "Silver Frost",
        colorHex: "#e2e8f0",
        quantity: 2,
        unitPrice: 1099,
        totalPrice: 2198,
      },
    ],
    subtotal: 2198,
    tax: 439.6,
    shippingFee: 45,
    discount: 0,
    totalAmount: 2682.6,
    payment: {
      status: "paid",
      method: "apple_pay",
      methodLabel: "Apple Pay (Mastercard •••• 9102)",
      transactionId: "AP-MC-0029318",
      paidAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      amount: 2682.6,
      currency: "USD",
    },
    shipping: {
      carrier: "UPS",
      service: "UPS Worldwide Saver",
      trackingNumber: "TRK-4412-9901",
      trackingUrl: "https://ups.com/track?id=TRK-4412-9901",
      estimatedDelivery: "Tomorrow by 12:00 PM",
      shippedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    timeline: [
      {
        id: "tl-21",
        status: "pending",
        label: "Order Created",
        description: "Customer purchased 2 units of NexPhone Pro Max X",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        actor: "System",
      },
      {
        id: "tl-22",
        status: "confirmed",
        label: "Order Approved",
        description: "Payment verified via Apple Pay",
        timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
        actor: "System Admin",
      },
      {
        id: "tl-23",
        status: "shipped",
        label: "In Transit with Carrier",
        description: "Parcel dispatched from Frankfurt Central Hub",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        actor: "UPS Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9039",
    orderNumber: "NX-ORD-9039",
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: "delivered",
    customer: {
      id: "cust-004",
      name: "Elena Rostova",
      email: "e.rostova@berlin-tech.de",
      phone: "+49 30 89012345",
      company: "Berlin Quantum Labs",
      shippingAddress: {
        street: "Friedrichstraße 180",
        city: "Berlin",
        state: "Berlin",
        zipCode: "10117",
        country: "Germany",
      },
    },
    items: [
      {
        id: "item-004",
        productId: "prod-004",
        productName: "NexPhone Lite",
        sku: "NX-LITE-128-MB",
        variantCapacity: "128GB",
        variantRam: "8GB LPDDR5",
        colorName: "Midnight Blue",
        colorHex: "#1e3a8a",
        quantity: 1,
        unitPrice: 599,
        totalPrice: 599,
      },
    ],
    subtotal: 599,
    tax: 113.81,
    shippingFee: 0,
    discount: 0,
    totalAmount: 712.81,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Stripe •••• 8821",
      transactionId: "ch_3NzK81992",
      paidAt: new Date(Date.now() - 1000 * 60 * 295).toISOString(),
      amount: 712.81,
      currency: "USD",
    },
    shipping: {
      carrier: "DHL",
      service: "DHL Express Domestic",
      trackingNumber: "TRK-1209-7712",
      trackingUrl: "https://dhl.com/track?id=TRK-1209-7712",
      estimatedDelivery: "Delivered",
      shippedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      deliveredAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    timeline: [
      {
        id: "tl-31",
        status: "pending",
        label: "Order Received",
        description: "Retail checkout completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        actor: "System",
      },
      {
        id: "tl-32",
        status: "delivered",
        label: "Delivered",
        description: "Handed over to customer",
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        actor: "DHL Courier",
      },
    ],
  },
  {
    id: "NX-ORD-9038",
    orderNumber: "NX-ORD-9038",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: "pending",
    customer: {
      id: "cust-005",
      name: "David Chen",
      email: "d.chen@apexvoip.sg",
      phone: "+65 6789 0123",
      company: "Apex Telecom Singapore",
      shippingAddress: {
        street: "10 Marina Boulevard, Marina Bay Financial Centre",
        city: "Singapore",
        state: "Central",
        zipCode: "018983",
        country: "Singapore",
      },
    },
    items: [
      {
        id: "item-005",
        productId: "prod-003",
        productName: "NexPhone Enterprise Desk Base Station",
        sku: "NX-DESK-BASE-V2",
        variantCapacity: "Standard Edition",
        variantRam: "Gigabit PoE+",
        colorName: "Matte Slate",
        colorHex: "#334155",
        quantity: 3,
        unitPrice: 499,
        totalPrice: 1497,
      },
    ],
    subtotal: 1497,
    tax: 119.76,
    shippingFee: 65,
    discount: 0,
    totalAmount: 1681.76,
    payment: {
      status: "pending",
      method: "purchase_order",
      methodLabel: "Purchase Order #8812 (Net 30)",
      transactionId: "PO-8812-PENDING",
      amount: 1681.76,
      currency: "USD",
    },
    shipping: {
      carrier: "SingPost",
      service: "Speedpost Priority International",
      estimatedDelivery: "Pending Dispatch",
    },
    timeline: [
      {
        id: "tl-41",
        status: "pending",
        label: "Awaiting Admin Confirmation",
        description: "Enterprise purchase order submitted. Requires account verification.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        actor: "System",
      },
    ],
    notes: "Customer requested commercial invoice sent to accounts@apexvoip.sg",
  },
  {
    id: "NX-ORD-9037",
    orderNumber: "NX-ORD-9037",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    status: "confirmed",
    customer: {
      id: "cust-006",
      name: "Sarah Connor",
      email: "s.connor@skyfleet.org",
      phone: "+1 (512) 555-0812",
      company: "Skyfleet Research",
      shippingAddress: {
        street: "8800 Technology Blvd",
        city: "Austin",
        state: "TX",
        zipCode: "78759",
        country: "United States",
      },
    },
    items: [
      {
        id: "item-006",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-1TB-TI",
        variantCapacity: "1TB",
        variantRam: "16GB LPDDR5X",
        colorName: "Titanium Gold",
        colorHex: "#d4af37",
        quantity: 1,
        unitPrice: 1499,
        totalPrice: 1499,
      },
    ],
    subtotal: 1499,
    tax: 123.67,
    shippingFee: 0,
    discount: 0,
    totalAmount: 1622.67,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Stripe •••• 9011",
      transactionId: "ch_3Klo881023",
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 17).toISOString(),
      amount: 1622.67,
      currency: "USD",
    },
    shipping: {
      carrier: "FedEx",
      service: "FedEx Standard Overnight",
      estimatedDelivery: "Tomorrow",
    },
    timeline: [
      {
        id: "tl-51",
        status: "pending",
        label: "Order Created",
        description: "Customer ordered 1TB Flagship Titanium",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        actor: "System",
      },
      {
        id: "tl-52",
        status: "confirmed",
        label: "Confirmed by Logistics",
        description: "Stock allocated from Fremont Hub, pending packing",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
        actor: "Logistics Admin",
      },
    ],
  },
  {
    id: "NX-ORD-9036",
    orderNumber: "NX-ORD-9036",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    status: "cancelled",
    cancelReason: "Customer requested cancellation prior to packaging",
    customer: {
      id: "cust-007",
      name: "Robert Thorne",
      email: "r.thorne@thornegroup.ca",
      phone: "+1 (416) 555-0391",
      company: "The Thorne Financial Group",
      shippingAddress: {
        street: "100 King Street West",
        city: "Toronto",
        state: "ON",
        zipCode: "M5X 1A9",
        country: "Canada",
      },
    },
    items: [
      {
        id: "item-007",
        productId: "prod-003",
        productName: "NexPhone Titanium Fold",
        sku: "NX-FOLD-512-TI",
        variantCapacity: "512GB",
        variantRam: "16GB LPDDR5X",
        colorName: "Titanium Shadow",
        colorHex: "#1e293b",
        quantity: 1,
        unitPrice: 1999,
        totalPrice: 1999,
      },
    ],
    subtotal: 1999,
    tax: 259.87,
    shippingFee: 40,
    discount: 100,
    totalAmount: 2198.87,
    payment: {
      status: "refunded",
      method: "credit_card",
      methodLabel: "Mastercard •••• 5519",
      transactionId: "TXN-REFUNDED-0912",
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      amount: 2198.87,
      currency: "USD",
    },
    shipping: {
      carrier: "Canada Post",
      service: "Xpresspost International",
    },
    timeline: [
      {
        id: "tl-61",
        status: "pending",
        label: "Order Placed",
        description: "Foldable flagship ordered with priority courier",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
        actor: "System",
      },
      {
        id: "tl-62",
        status: "cancelled",
        label: "Order Cancelled & Refunded",
        description: "Customer requested cancellation; full refund processed.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        actor: "Support Staff (Emma L.)",
      },
    ],
  },
  {
    id: "NX-ORD-9035",
    orderNumber: "NX-ORD-9035",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    status: "pending",
    customer: {
      id: "cust-008",
      name: "Liam O'Connor",
      email: "liam.oc@dublin-iot.ie",
      phone: "+353 1 496 0192",
      company: "Dublin IoT Innovations",
      shippingAddress: {
        street: "Grand Canal Square, Docklands",
        city: "Dublin",
        state: "Leinster",
        zipCode: "D02 P820",
        country: "Ireland",
      },
    },
    items: [
      {
        id: "item-008",
        productId: "prod-001",
        productName: "NexPhone Pro Max X",
        sku: "NX-PRO-MAX-256-SG",
        variantCapacity: "256GB",
        variantRam: "12GB LPDDR5X",
        colorName: "Titanium Space Gray",
        colorHex: "#2b2d42",
        quantity: 1,
        unitPrice: 1199,
        totalPrice: 1199,
      },
    ],
    subtotal: 1199,
    tax: 275.77,
    shippingFee: 25,
    discount: 0,
    totalAmount: 1499.77,
    payment: {
      status: "pending",
      method: "corporate_wire",
      methodLabel: "Bank Wire (IBAN IE29...)",
      amount: 1499.77,
      currency: "EUR",
    },
    shipping: {
      carrier: "An Post",
      service: "Express Tracked International",
      estimatedDelivery: "Pending Confirmation",
    },
    timeline: [
      {
        id: "tl-71",
        status: "pending",
        label: "Awaiting Confirmation",
        description: "New enterprise order pending payment review",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        actor: "System",
      },
    ],
  },
  {
    id: "NX-ORD-9034",
    orderNumber: "NX-ORD-9034",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "shipped",
    customer: {
      id: "cust-009",
      name: "Chloe Dubois",
      email: "c.dubois@paristech.fr",
      phone: "+33 1 42 68 55 00",
      company: "Paris Cloud Services",
      shippingAddress: {
        street: "14 Rue Royale",
        city: "Paris",
        state: "Île-de-France",
        zipCode: "75008",
        country: "France",
      },
    },
    items: [
      {
        id: "item-009",
        productId: "prod-002",
        productName: "NexPhone Enterprise Secure",
        sku: "NX-ENT-SEC-512",
        variantCapacity: "512GB",
        variantRam: "16GB ECC",
        colorName: "Graphite",
        colorHex: "#1e293b",
        quantity: 1,
        unitPrice: 1399,
        totalPrice: 1399,
      },
    ],
    subtotal: 1399,
    tax: 279.8,
    shippingFee: 0,
    discount: 0,
    totalAmount: 1678.8,
    payment: {
      status: "paid",
      method: "stripe",
      methodLabel: "Visa •••• 1049",
      transactionId: "ch_3Pla9912093",
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
      amount: 1678.8,
      currency: "EUR",
    },
    shipping: {
      carrier: "Chronopost",
      service: "Chronopost 13 Express",
      trackingNumber: "CP-9901-8841-FR",
      trackingUrl: "https://chronopost.fr/tracking?id=CP-9901-8841-FR",
      estimatedDelivery: "In Transit",
      shippedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    timeline: [
      {
        id: "tl-81",
        status: "pending",
        label: "Order Placed",
        description: "Enterprise Secure device purchase",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        actor: "System",
      },
      {
        id: "tl-82",
        status: "shipped",
        label: "Dispatched from EU Central Hub",
        description: "Parcel in transit with Chronopost",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        actor: "Logistics Hub (FRA)",
      },
    ],
  },
];

// Orders List with Filtering
app.get("/api/orders", (req: Request, res: Response) => {
  const { search, status, paymentStatus } = req.query;
  let result = [...ordersStore];

  if (status && typeof status === "string" && status !== "all") {
    result = result.filter((o) => o.status === status);
  }

  if (paymentStatus && typeof paymentStatus === "string" && paymentStatus !== "all") {
    result = result.filter((o) => o.payment.status === paymentStatus);
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.shippingAddress.country.toLowerCase().includes(q) ||
        o.items.some(
          (item) =>
            item.productName.toLowerCase().includes(q) ||
            item.sku.toLowerCase().includes(q)
        )
    );
  }

  // Sort descending by creation date
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(result);
});

// Single Order Detail
app.get("/api/orders/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const order = ordersStore.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }
  res.json(order);
});

// Confirm Order
app.post("/api/orders/:id/confirm", (req: Request, res: Response) => {
  const { id } = req.params;
  const { performedBy } = req.body || {};
  const index = ordersStore.findIndex((o) => o.id === id || o.orderNumber === id);
  const current = ordersStore[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }

  const now = new Date().toISOString();
  const updated: OrderRecord = {
    ...current,
    status: "confirmed",
    updatedAt: now,
    timeline: [
      {
        id: `tl-${Date.now().toString(36)}`,
        status: "confirmed",
        label: "Order Confirmed",
        description: "Order confirmed by administration. Stock reserved for fulfillment.",
        timestamp: now,
        actor: performedBy || "System Admin",
      },
      ...current.timeline,
    ],
  };

  ordersStore[index] = updated;
  res.json(updated);
});

// Update Order Status (Confirmed -> Processing -> Shipped -> Delivered)
app.put("/api/orders/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, carrier, trackingNumber, note, performedBy } = req.body || {};
  const index = ordersStore.findIndex((o) => o.id === id || o.orderNumber === id);
  const current = ordersStore[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }

  const now = new Date().toISOString();
  const updatedShipping = {
    ...current.shipping,
    ...(carrier ? { carrier } : {}),
    ...(trackingNumber ? { trackingNumber, trackingUrl: `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}` } : {}),
    ...(status === "shipped" && !current.shipping.shippedAt ? { shippedAt: now } : {}),
    ...(status === "delivered" && !current.shipping.deliveredAt ? { deliveredAt: now, estimatedDelivery: "Delivered" } : {}),
  };

  const statusLabels: Record<string, string> = {
    confirmed: "Order Confirmed",
    processing: "Processing & Warehousing",
    shipped: "Shipped & Dispatched",
    delivered: "Delivered to Customer",
    cancelled: "Order Cancelled",
  };

  const updated: OrderRecord = {
    ...current,
    status,
    shipping: updatedShipping,
    updatedAt: now,
    timeline: [
      {
        id: `tl-${Date.now().toString(36)}`,
        status,
        label: statusLabels[status] || `Status updated to ${status}`,
        description: note || (trackingNumber ? `Shipment tracking assigned: ${trackingNumber} (${carrier || "Carrier"})` : `Order status transitioned to ${status}`),
        timestamp: now,
        actor: performedBy || "Operations Team",
      },
      ...current.timeline,
    ],
  };

  ordersStore[index] = updated;
  res.json(updated);
});

// Cancel Order
app.post("/api/orders/:id/cancel", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, note, refundPayment, performedBy } = req.body || {};
  const index = ordersStore.findIndex((o) => o.id === id || o.orderNumber === id);
  const current = ordersStore[index];

  if (index === -1 || !current) {
    res.status(404).json({ error: "Order not found", id });
    return;
  }

  const now = new Date().toISOString();
  const newPaymentStatus = refundPayment || current.payment.status === "paid" ? "refunded" : current.payment.status;

  const updated: OrderRecord = {
    ...current,
    status: "cancelled",
    cancelReason: reason || "Administrative cancellation",
    updatedAt: now,
    payment: {
      ...current.payment,
      status: newPaymentStatus,
      transactionId: newPaymentStatus === "refunded" ? `REF-${Date.now().toString(36).toUpperCase()}` : current.payment.transactionId,
    },
    timeline: [
      {
        id: `tl-${Date.now().toString(36)}`,
        status: "cancelled",
        label: "Order Cancelled",
        description: `Reason: ${reason || "Cancelled by admin"}${note ? ` • Note: ${note}` : ""}${newPaymentStatus === "refunded" ? " • Payment marked as refunded" : ""}`,
        timestamp: now,
        actor: performedBy || "Admin Staff",
      },
      ...current.timeline,
    ],
  };

  ordersStore[index] = updated;
  res.json(updated);
});

// Order Summary Metrics
app.get("/api/orders-metrics", (_req: Request, res: Response) => {
  const totalOrders = ordersStore.length;
  const pendingOrders = ordersStore.filter((o) => o.status === "pending").length;
  const confirmedOrders = ordersStore.filter((o) => o.status === "confirmed").length;
  const processingOrders = ordersStore.filter((o) => o.status === "processing").length;
  const shippedOrders = ordersStore.filter((o) => o.status === "shipped").length;
  const deliveredOrders = ordersStore.filter((o) => o.status === "delivered").length;
  const cancelledOrders = ordersStore.filter((o) => o.status === "cancelled").length;
  const totalRevenue = ordersStore
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / (totalOrders - cancelledOrders || 1) : 0;
  const paidOrdersCount = ordersStore.filter((o) => o.payment.status === "paid").length;
  const pendingPaymentCount = ordersStore.filter((o) => o.payment.status === "pending").length;

  res.json({
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    avgOrderValue,
    paidOrdersCount,
    pendingPaymentCount,
  });
});

// ==========================================
// CUSTOMER MANAGEMENT API
// ==========================================

export interface CustomerRecord {
  id: string;
  customerNumber: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatarUrl?: string;
  status: "active" | "disabled";
  tier: "VIP" | "Enterprise" | "Pro" | "Regular";
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  metrics: {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrderDate: string;
  };
  security: {
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt: string;
    lastLoginIp: string;
  };
  notes?: string;
  disabledReason?: string;
  disabledAt?: string;
  disabledBy?: string;
  createdAt: string;
  updatedAt: string;
}

const customersStore: CustomerRecord[] = [
  {
    id: "cust-001",
    customerNumber: "CUST-8021",
    name: "Alex Vance",
    email: "a.vance@blackmesa.io",
    phone: "+1 (206) 555-0194",
    company: "Black Mesa Aerospace",
    status: "active",
    tier: "VIP",
    address: {
      street: "742 Evergreen Terrace",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "United States",
    },
    metrics: {
      totalOrders: 4,
      totalSpent: 4218.42,
      avgOrderValue: 1054.6,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      lastLoginIp: "198.51.100.42 (Seattle, US)",
    },
    notes: "Executive partner at Black Mesa. Eligible for priority express courier dispatch.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "cust-002",
    customerNumber: "CUST-8022",
    name: "Sophia Tanaka",
    email: "s.tanaka@cyberdyne.co.jp",
    phone: "+81 3-5555-0182",
    company: "Cyberdyne Systems Tokyo",
    status: "active",
    tier: "Enterprise",
    address: {
      street: "Minato-ku, Roppongi Hills Mori Tower 28F",
      city: "Tokyo",
      state: "Tokyo",
      postalCode: "106-6108",
      country: "Japan",
    },
    metrics: {
      totalOrders: 3,
      totalSpent: 3897.0,
      avgOrderValue: 1299.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      lastLoginIp: "203.0.113.88 (Tokyo, JP)",
    },
    notes: "Requires DHL Global Express priority tracking with commercial duty documentation.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "cust-003",
    customerNumber: "CUST-8023",
    name: "Marcus Sterling",
    email: "m.sterling@acmeholdings.com",
    phone: "+44 20 7946 0912",
    company: "Acme Holdings Ltd",
    status: "active",
    tier: "Enterprise",
    address: {
      street: "124 Bishopsgate, Level 14",
      city: "London",
      state: "Greater London",
      postalCode: "EC2N 4BQ",
      country: "United Kingdom",
    },
    metrics: {
      totalOrders: 2,
      totalSpent: 2825.82,
      avgOrderValue: 1412.91,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: false,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
      lastLoginIp: "195.55.80.12 (London, UK)",
    },
    notes: "Fleet expansion account. Considers 50+ enterprise rollouts in Q4.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "cust-004",
    customerNumber: "CUST-8024",
    name: "Elena Rostova",
    email: "e.rostova@berlin-tech.de",
    phone: "+49 30 1234567",
    company: "Berlin Tech Labs GmbH",
    status: "active",
    tier: "Pro",
    address: {
      street: "Friedrichstraße 42",
      city: "Berlin",
      state: "Berlin",
      postalCode: "10117",
      country: "Germany",
    },
    metrics: {
      totalOrders: 3,
      totalSpent: 3097.0,
      avgOrderValue: 1032.33,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      lastLoginIp: "91.198.174.192 (Berlin, DE)",
    },
    notes: "Requires EU VAT compliance receipts.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "cust-005",
    customerNumber: "CUST-8025",
    name: "David Chen",
    email: "d.chen@apexvoip.sg",
    phone: "+65 6789 0123",
    company: "Apex Telecom Singapore",
    status: "active",
    tier: "VIP",
    address: {
      street: "8 Marina Boulevard, Marina Bay Financial Centre",
      city: "Singapore",
      state: "Central",
      postalCode: "018981",
      country: "Singapore",
    },
    metrics: {
      totalOrders: 5,
      totalSpent: 6495.0,
      avgOrderValue: 1299.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      lastLoginIp: "202.166.192.10 (Singapore, SG)",
    },
    notes: "VIP corporate partner. Commercial invoices sent directly to accounts@apexvoip.sg.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: "cust-006",
    customerNumber: "CUST-8026",
    name: "Sarah Connor",
    email: "s.connor@skyfleet.org",
    phone: "+1 (512) 555-8391",
    company: "SkyFleet Security Systems",
    status: "active",
    tier: "Regular",
    address: {
      street: "1000 Congress Avenue, Suite 400",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "United States",
    },
    metrics: {
      totalOrders: 1,
      totalSpent: 1299.0,
      avgOrderValue: 1299.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: false,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
      lastLoginIp: "104.28.19.44 (Austin, US)",
    },
    notes: "Customer cancelled first order due to unexpected travel schedule; invited to reorder.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
  },
  {
    id: "cust-007",
    customerNumber: "CUST-8027",
    name: "Liam O'Connor",
    email: "l.oconnor@dublin-comm.ie",
    phone: "+353 1 496 0192",
    company: "Celtic Communications",
    status: "active",
    tier: "Pro",
    address: {
      street: "Grand Canal Quay, Docklands",
      city: "Dublin",
      state: "Leinster",
      postalCode: "D02 Y890",
      country: "Ireland",
    },
    metrics: {
      totalOrders: 2,
      totalSpent: 2198.0,
      avgOrderValue: 1099.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      lastLoginIp: "89.101.240.11 (Dublin, IE)",
    },
    notes: "Hardware developer testing NexPhone custom firmware builds.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "cust-008",
    customerNumber: "CUST-8028",
    name: "Victor Vance",
    email: "v.vance@vice-logistics.com",
    phone: "+1 (305) 555-0149",
    company: "Vice Logistics Inc",
    status: "disabled",
    tier: "Regular",
    address: {
      street: "1400 Ocean Drive, Suite 801",
      city: "Miami",
      state: "FL",
      postalCode: "33139",
      country: "United States",
    },
    metrics: {
      totalOrders: 1,
      totalSpent: 0,
      avgOrderValue: 0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    security: {
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      lastLoginIp: "198.51.100.99 (Miami, US)",
    },
    notes: "Account suspended due to 5 consecutive failed card authorizations and mismatched billing address.",
    disabledReason: "Suspected card testing / fraudulent transaction activity",
    disabledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    disabledBy: "Compliance & Security Bot",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "cust-009",
    customerNumber: "CUST-8029",
    name: "Amara Okafor",
    email: "a.okafor@lagos-fintech.ng",
    phone: "+234 1 234 5678",
    company: "Lagos FinTech Systems",
    status: "active",
    tier: "VIP",
    address: {
      street: "14 Admiralty Way, Lekki Phase 1",
      city: "Lagos",
      state: "Lagos State",
      postalCode: "105102",
      country: "Nigeria",
    },
    metrics: {
      totalOrders: 4,
      totalSpent: 4896.0,
      avgOrderValue: 1224.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      lastLoginIp: "102.89.23.11 (Lagos, NG)",
    },
    notes: "Preferred partner in West Africa region. High-volume purchaser.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "cust-010",
    customerNumber: "CUST-8030",
    name: "Hiroshi Sato",
    email: "h.sato@kyoto-robotics.jp",
    phone: "+81 75 555 0199",
    company: "Kyoto Robotics R&D",
    status: "active",
    tier: "Enterprise",
    address: {
      street: "Shimogyo-ku, Karasuma-dori 12",
      city: "Kyoto",
      state: "Kyoto",
      postalCode: "600-8216",
      country: "Japan",
    },
    metrics: {
      totalOrders: 3,
      totalSpent: 3697.0,
      avgOrderValue: 1232.33,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      lastLoginIp: "133.242.18.90 (Kyoto, JP)",
    },
    notes: "Conducts hardware stress-testing on robotics automated docks.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: "cust-011",
    customerNumber: "CUST-8031",
    name: "Chloe Dubois",
    email: "c.dubois@paris-telecom.fr",
    phone: "+33 1 42 68 55 00",
    company: "Hexagone Telecom Paris",
    status: "active",
    tier: "Pro",
    address: {
      street: "28 Boulevard Haussmann",
      city: "Paris",
      state: "Île-de-France",
      postalCode: "75009",
      country: "France",
    },
    metrics: {
      totalOrders: 2,
      totalSpent: 2398.0,
      avgOrderValue: 1199.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      lastLoginIp: "195.154.120.4 (Paris, FR)",
    },
    notes: "Requires French localized compliance and CE test documentation.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "cust-012",
    customerNumber: "CUST-8032",
    name: "Carlos Mendez",
    email: "c.mendez@sol-technologies.mx",
    phone: "+52 55 5123 4567",
    company: "Sol Technologies CDMX",
    status: "active",
    tier: "Regular",
    address: {
      street: "Paseo de la Reforma 222",
      city: "Mexico City",
      state: "CDMX",
      postalCode: "06600",
      country: "Mexico",
    },
    metrics: {
      totalOrders: 1,
      totalSpent: 1199.0,
      avgOrderValue: 1199.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: false,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      lastLoginIp: "187.189.44.12 (CDMX, MX)",
    },
    notes: "LATAM trial user for dual-eSIM enterprise deployment.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "cust-013",
    customerNumber: "CUST-8033",
    name: "Astrid Lindgren",
    email: "a.lindgren@nordic-cellular.se",
    phone: "+46 8 123 4567",
    company: "Nordic Cellular Networks",
    status: "active",
    tier: "VIP",
    address: {
      street: "Kungsgatan 44",
      city: "Stockholm",
      state: "Stockholm",
      postalCode: "111 35",
      country: "Sweden",
    },
    metrics: {
      totalOrders: 5,
      totalSpent: 5795.0,
      avgOrderValue: 1159.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      lastLoginIp: "85.224.90.15 (Stockholm, SE)",
    },
    notes: "Top Nordic partner. Fast-track logistics via DHL Express Arlanda hub.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: "cust-014",
    customerNumber: "CUST-8034",
    name: "Tariq Al-Mansoor",
    email: "t.almansoor@dubai-cloud.ae",
    phone: "+971 4 362 7000",
    company: "Dubai Cloud Horizons",
    status: "active",
    tier: "Enterprise",
    address: {
      street: "DIFC Gate Building, Level 8",
      city: "Dubai",
      state: "Dubai",
      postalCode: "506500",
      country: "United Arab Emirates",
    },
    metrics: {
      totalOrders: 3,
      totalSpent: 3897.0,
      avgOrderValue: 1299.0,
      lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    },
    security: {
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      lastLoginIp: "94.200.12.88 (Dubai, AE)",
    },
    notes: "Regional enterprise procurement account.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 110).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
  {
    id: "cust-015",
    customerNumber: "CUST-8035",
    name: "Kavita Rao",
    email: "k.rao@bangalore-robotics.in",
    phone: "+91 80 4123 4567",
    company: "Bangalore Robotics Corp",
    status: "active",
    tier: "Enterprise",
    address: { street: "100 Feet Rd, Indiranagar", city: "Bangalore", state: "Karnataka", postalCode: "560038", country: "India" },
    metrics: { totalOrders: 5, totalSpent: 6490.0, avgOrderValue: 1298.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), lastLoginIp: "103.21.124.50 (Bangalore, IN)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 160).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "cust-016",
    customerNumber: "CUST-8036",
    name: "Lucas Meyer",
    email: "l.meyer@zurich-quant.ch",
    phone: "+41 44 211 4455",
    company: "Zurich Quant Systems",
    status: "active",
    tier: "VIP",
    address: { street: "Bahnhofstrasse 45", city: "Zurich", state: "Zurich", postalCode: "8001", country: "Switzerland" },
    metrics: { totalOrders: 7, totalSpent: 9240.0, avgOrderValue: 1320.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), lastLoginIp: "193.134.25.10 (Zurich, CH)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 210).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "cust-017",
    customerNumber: "CUST-8037",
    name: "Camila Santos",
    email: "c.santos@saopaulo-media.br",
    phone: "+55 11 98765-4321",
    company: "Santos Digital Media",
    status: "active",
    tier: "Pro",
    address: { street: "Av. Paulista 1000, 12º andar", city: "São Paulo", state: "SP", postalCode: "01310-100", country: "Brazil" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
    security: { emailVerified: true, phoneVerified: false, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), lastLoginIp: "177.18.200.4 (São Paulo, BR)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "cust-018",
    customerNumber: "CUST-8038",
    name: "Hassan Al-Mansoor",
    email: "hassan@doha-ventures.qa",
    phone: "+974 4455 6677",
    company: "Al-Mansoor Tech Holdings",
    status: "active",
    tier: "VIP",
    address: { street: "West Bay Commercial Tower 19", city: "Doha", state: "Doha", postalCode: "24411", country: "Qatar" },
    metrics: { totalOrders: 6, totalSpent: 8790.0, avgOrderValue: 1465.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), lastLoginIp: "82.148.96.12 (Doha, QA)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "cust-019",
    customerNumber: "CUST-8039",
    name: "Astrid Lindholm",
    email: "astrid.l@stockholm-design.se",
    phone: "+46 8 123 4567",
    company: "Nordic Clean Tech AB",
    status: "active",
    tier: "Pro",
    address: { street: "Sveavägen 44", city: "Stockholm", state: "Stockholm", postalCode: "111 34", country: "Sweden" },
    metrics: { totalOrders: 2, totalSpent: 1798.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), lastLoginIp: "194.236.10.8 (Stockholm, SE)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "cust-020",
    customerNumber: "CUST-8040",
    name: "Mateo Rossi",
    email: "m.rossi@milano-telecom.it",
    phone: "+39 02 8765 4321",
    company: "Rossi Mobili SpA",
    status: "active",
    tier: "Enterprise",
    address: { street: "Via Montenapoleone 8", city: "Milan", state: "Lombardy", postalCode: "20121", country: "Italy" },
    metrics: { totalOrders: 4, totalSpent: 5196.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), lastLoginIp: "151.15.44.89 (Milan, IT)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 140).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "cust-021",
    customerNumber: "CUST-8041",
    name: "Nadia Petrova",
    email: "n.petrova@vienna-logic.at",
    phone: "+43 1 512 3456",
    company: "Petrova Dynamics GmbH",
    status: "disabled",
    tier: "Regular",
    address: { street: "Kärntner Ring 12", city: "Vienna", state: "Vienna", postalCode: "1010", country: "Austria" },
    metrics: { totalOrders: 1, totalSpent: 599.0, avgOrderValue: 599.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString() },
    security: { emailVerified: true, phoneVerified: false, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(), lastLoginIp: "193.170.80.2 (Vienna, AT)" },
    disabledReason: "Suspected credit card dispute chargeback",
    disabledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    disabledBy: "Compliance Team",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
  {
    id: "cust-022",
    customerNumber: "CUST-8042",
    name: "Ethan Wright",
    email: "e.wright@austin-chip.com",
    phone: "+1 (512) 555-0143",
    company: "Wright Semiconductor",
    status: "active",
    tier: "VIP",
    address: { street: "500 W 2nd St, Suite 1900", city: "Austin", state: "TX", postalCode: "78701", country: "United States" },
    metrics: { totalOrders: 8, totalSpent: 11450.0, avgOrderValue: 1431.25, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), lastLoginIp: "136.56.24.11 (Austin, US)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "cust-023",
    customerNumber: "CUST-8043",
    name: "Mei-Ling Zhou",
    email: "zhou.ml@taipei-photonics.tw",
    phone: "+886 2 2345 6789",
    company: "Taipei Photonics Ltd",
    status: "active",
    tier: "Enterprise",
    address: { street: "Xinyi Rd Sec 5, No 7", city: "Taipei", state: "Taipei", postalCode: "110", country: "Taiwan" },
    metrics: { totalOrders: 5, totalSpent: 6890.0, avgOrderValue: 1378.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), lastLoginIp: "140.112.30.9 (Taipei, TW)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 170).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "cust-024",
    customerNumber: "CUST-8044",
    name: "Sebastian Becker",
    email: "s.becker@munich-auto.de",
    phone: "+49 89 987654",
    company: "Bavaria Auto Systems",
    status: "active",
    tier: "Pro",
    address: { street: "Leopoldstraße 110", city: "Munich", state: "Bavaria", postalCode: "80802", country: "Germany" },
    metrics: { totalOrders: 3, totalSpent: 2997.0, avgOrderValue: 999.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), lastLoginIp: "188.192.40.15 (Munich, DE)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 115).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id: "cust-025",
    customerNumber: "CUST-8045",
    name: "Chloe Dubois",
    email: "c.dubois@lyon-biotech.fr",
    phone: "+33 4 72 00 11 22",
    company: "Lyon Biotech Research",
    status: "active",
    tier: "Pro",
    address: { street: "Rue de la République 18", city: "Lyon", state: "Rhône", postalCode: "69002", country: "France" },
    metrics: { totalOrders: 2, totalSpent: 1898.0, avgOrderValue: 949.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), lastLoginIp: "90.84.120.3 (Lyon, FR)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 85).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: "cust-026",
    customerNumber: "CUST-8046",
    name: "Kenji Sato",
    email: "k.sato@osaka-optics.jp",
    phone: "+81 6 6123 4567",
    company: "Kansai Optics Corp",
    status: "active",
    tier: "Enterprise",
    address: { street: "Umeda 1-1-3, Kita-ku", city: "Osaka", state: "Osaka", postalCode: "530-0001", country: "Japan" },
    metrics: { totalOrders: 4, totalSpent: 5196.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), lastLoginIp: "133.242.18.99 (Osaka, JP)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 130).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: "cust-027",
    customerNumber: "CUST-8047",
    name: "Amara Okonjo",
    email: "a.okonjo@lagos-fintech.ng",
    phone: "+234 1 234 5678",
    company: "West Africa Digital Pay",
    status: "active",
    tier: "Regular",
    address: { street: "Adetokunbo Ademola St", city: "Lagos", state: "Lagos", postalCode: "101241", country: "Nigeria" },
    metrics: { totalOrders: 2, totalSpent: 1198.0, avgOrderValue: 599.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), lastLoginIp: "105.112.45.6 (Lagos, NG)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: "cust-028",
    customerNumber: "CUST-8048",
    name: "Viktor Novak",
    email: "v.novak@prague-cyber.cz",
    phone: "+420 221 456 789",
    company: "Bohemia Cyber Security",
    status: "active",
    tier: "Pro",
    address: { street: "Wenceslas Square 22", city: "Prague", state: "Prague", postalCode: "110 00", country: "Czech Republic" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), lastLoginIp: "195.113.80.12 (Prague, CZ)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "cust-029",
    customerNumber: "CUST-8049",
    name: "Zara Chen",
    email: "zara.chen@melbourne-health.au",
    phone: "+61 3 9876 5432",
    company: "Southern Cross Health Tech",
    status: "active",
    tier: "VIP",
    address: { street: "Collins Street 101", city: "Melbourne", state: "VIC", postalCode: "3000", country: "Australia" },
    metrics: { totalOrders: 6, totalSpent: 7794.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), lastLoginIp: "139.130.4.5 (Melbourne, AU)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "cust-030",
    customerNumber: "CUST-8050",
    name: "Dmitri Volkov",
    email: "d.volkov@helsinki-cloud.fi",
    phone: "+358 9 1234 5678",
    company: "Nordic Aurora Cloud",
    status: "disabled",
    tier: "Regular",
    address: { street: "Mannerheimintie 14", city: "Helsinki", state: "Uusimaa", postalCode: "00100", country: "Finland" },
    metrics: { totalOrders: 1, totalSpent: 499.0, avgOrderValue: 499.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString() },
    security: { emailVerified: true, phoneVerified: false, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), lastLoginIp: "193.166.4.1 (Helsinki, FI)" },
    disabledReason: "Inactive account flagged by automated security audit",
    disabledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    disabledBy: "System Guard",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
  {
    id: "cust-031",
    customerNumber: "CUST-8051",
    name: "Priya Sharma",
    email: "priya@mumbai-fin.in",
    phone: "+91 22 2654 3210",
    company: "Maharashtra Capital Advisory",
    status: "active",
    tier: "Pro",
    address: { street: "BKC Complex, Bandra East", city: "Mumbai", state: "Maharashtra", postalCode: "400051", country: "India" },
    metrics: { totalOrders: 4, totalSpent: 3596.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(), lastLoginIp: "115.114.80.20 (Mumbai, IN)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 125).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "cust-032",
    customerNumber: "CUST-8052",
    name: "Gabriel Garcia",
    email: "g.garcia@madrid-energy.es",
    phone: "+34 91 555 4321",
    company: "Iberia Solar & Energy",
    status: "active",
    tier: "Enterprise",
    address: { street: "Paseo de la Castellana 200", city: "Madrid", state: "Madrid", postalCode: "28046", country: "Spain" },
    metrics: { totalOrders: 5, totalSpent: 6495.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), lastLoginIp: "88.2.140.55 (Madrid, ES)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 155).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "cust-033",
    customerNumber: "CUST-8053",
    name: "Ananya Patel",
    email: "ananya.p@singapore-data.sg",
    phone: "+65 6789 0123",
    company: "Lion City Data Systems",
    status: "active",
    tier: "VIP",
    address: { street: "Marina Boulevard 8A", city: "Singapore", state: "Central", postalCode: "018981", country: "Singapore" },
    metrics: { totalOrders: 7, totalSpent: 9793.0, avgOrderValue: 1399.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), lastLoginIp: "202.166.4.12 (Singapore, SG)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 220).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "cust-034",
    customerNumber: "CUST-8054",
    name: "Liam O'Connor",
    email: "l.oconnor@dublin-pay.ie",
    phone: "+353 1 496 0123",
    company: "Emerald Isle Cloud Labs",
    status: "active",
    tier: "Pro",
    address: { street: "Grand Canal Square 2", city: "Dublin", state: "Leinster", postalCode: "D02 A342", country: "Ireland" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(), lastLoginIp: "89.101.40.18 (Dublin, IE)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
  },
  {
    id: "cust-035",
    customerNumber: "CUST-8055",
    name: "Fatima Zahra",
    email: "f.zahra@casablanca-tech.ma",
    phone: "+212 522 123 456",
    company: "Atlas Telecommunications",
    status: "active",
    tier: "Regular",
    address: { street: "Boulevard d'Anfa 88", city: "Casablanca", state: "Grand Casablanca", postalCode: "20000", country: "Morocco" },
    metrics: { totalOrders: 2, totalSpent: 1198.0, avgOrderValue: 599.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(), lastLoginIp: "196.200.4.15 (Casablanca, MA)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 65).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  },
  {
    id: "cust-036",
    customerNumber: "CUST-8056",
    name: "Noah Takahashi",
    email: "noah.t@kyoto-craft.jp",
    phone: "+81 75 345 6789",
    company: "Kyoto Robotics Studio",
    status: "active",
    tier: "Enterprise",
    address: { street: "Shijo Karasuma 12", city: "Kyoto", state: "Kyoto", postalCode: "600-8009", country: "Japan" },
    metrics: { totalOrders: 4, totalSpent: 5196.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), lastLoginIp: "118.238.10.88 (Kyoto, JP)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 145).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "cust-037",
    customerNumber: "CUST-8057",
    name: "Isabella Rossi",
    email: "i.rossi@florence-design.it",
    phone: "+39 055 234 5678",
    company: "Firenze Luxury Tech",
    status: "active",
    tier: "Pro",
    address: { street: "Piazza della Signoria 5", city: "Florence", state: "Tuscany", postalCode: "50122", country: "Italy" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(), lastLoginIp: "93.45.12.80 (Florence, IT)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 105).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
  },
  {
    id: "cust-038",
    customerNumber: "CUST-8058",
    name: "Benjamin Hughes",
    email: "b.hughes@toronto-ai.ca",
    phone: "+1 (416) 555-0188",
    company: "Great Lakes Neural Network",
    status: "active",
    tier: "VIP",
    address: { street: "100 King St W, Suite 4000", city: "Toronto", state: "ON", postalCode: "M5X 1A9", country: "Canada" },
    metrics: { totalOrders: 6, totalSpent: 8394.0, avgOrderValue: 1399.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), lastLoginIp: "142.214.10.4 (Toronto, CA)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 230).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "cust-039",
    customerNumber: "CUST-8059",
    name: "Sora Hayashi",
    email: "s.hayashi@sapporo-sensor.jp",
    phone: "+81 11 234 5678",
    company: "Hokkaido Thermal Systems",
    status: "active",
    tier: "Regular",
    address: { street: "Odori Nishi 4-chome", city: "Sapporo", state: "Hokkaido", postalCode: "060-0042", country: "Japan" },
    metrics: { totalOrders: 2, totalSpent: 1198.0, avgOrderValue: 599.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 95).toISOString(), lastLoginIp: "219.100.8.12 (Sapporo, JP)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  },
  {
    id: "cust-040",
    customerNumber: "CUST-8060",
    name: "Oliver Smith",
    email: "oliver.s@manchester-iot.co.uk",
    phone: "+44 161 234 5678",
    company: "Pennine Industrial IoT",
    status: "active",
    tier: "Pro",
    address: { street: "Peter House, Oxford St", city: "Manchester", state: "Greater Manchester", postalCode: "M1 5AN", country: "United Kingdom" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), lastLoginIp: "82.44.18.90 (Manchester, UK)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 110).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "cust-041",
    customerNumber: "CUST-8061",
    name: "Emma Watson",
    email: "e.watson@oxford-genomics.org",
    phone: "+44 1865 270000",
    company: "Oxford BioCompute",
    status: "active",
    tier: "Enterprise",
    address: { street: "Parks Road 14", city: "Oxford", state: "Oxfordshire", postalCode: "OX1 3PJ", country: "United Kingdom" },
    metrics: { totalOrders: 5, totalSpent: 6495.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(), lastLoginIp: "129.67.1.5 (Oxford, UK)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 165).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "cust-042",
    customerNumber: "CUST-8062",
    name: "Lucas Silva",
    email: "lucas.s@lisbon-startups.pt",
    phone: "+351 21 345 6789",
    company: "Tejo Silicon Valley",
    status: "active",
    tier: "Pro",
    address: { street: "Avenida da Liberdade 180", city: "Lisbon", state: "Lisbon", postalCode: "1250-146", country: "Portugal" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
    security: { emailVerified: true, phoneVerified: false, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), lastLoginIp: "193.136.2.8 (Lisbon, PT)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    id: "cust-043",
    customerNumber: "CUST-8063",
    name: "Mia Zhang",
    email: "mia.zhang@auckland-tele.co.nz",
    phone: "+64 9 379 1234",
    company: "Aotearoa Cloud Connect",
    status: "active",
    tier: "VIP",
    address: { street: "Queen Street 205", city: "Auckland", state: "Auckland", postalCode: "1010", country: "New Zealand" },
    metrics: { totalOrders: 6, totalSpent: 8394.0, avgOrderValue: 1399.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(), lastLoginIp: "210.55.12.8 (Auckland, NZ)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 250).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "cust-044",
    customerNumber: "CUST-8064",
    name: "Alexander Müller",
    email: "a.mueller@frankfurt-fin.de",
    phone: "+49 69 7654 3210",
    company: "Main River Financial",
    status: "active",
    tier: "Enterprise",
    address: { street: "Taunusanlage 8", city: "Frankfurt", state: "Hesse", postalCode: "60329", country: "Germany" },
    metrics: { totalOrders: 5, totalSpent: 6495.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(), lastLoginIp: "194.138.1.10 (Frankfurt, DE)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 175).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "cust-045",
    customerNumber: "CUST-8065",
    name: "Aria Montgomery",
    email: "aria.m@vancouver-clean.ca",
    phone: "+1 (604) 555-0177",
    company: "Pacific Hydrogen Dynamics",
    status: "active",
    tier: "Pro",
    address: { street: "Burrard St 1055, Suite 2100", city: "Vancouver", state: "BC", postalCode: "V6E 3P3", country: "Canada" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 55).toISOString(), lastLoginIp: "199.116.115.1 (Vancouver, CA)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 115).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
  },
  {
    id: "cust-046",
    customerNumber: "CUST-8066",
    name: "Leo Hernandez",
    email: "leo.h@bogota-fintech.co",
    phone: "+57 1 234 5678",
    company: "Andes Digital Banking",
    status: "active",
    tier: "Regular",
    address: { street: "Carrera 7 No 71-21", city: "Bogotá", state: "Cundinamarca", postalCode: "110221", country: "Colombia" },
    metrics: { totalOrders: 2, totalSpent: 1198.0, avgOrderValue: 599.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(), lastLoginIp: "186.28.40.12 (Bogotá, CO)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 80).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
  },
  {
    id: "cust-047",
    customerNumber: "CUST-8067",
    name: "Zoe Kravitz",
    email: "zoe.k@amsterdam-creative.nl",
    phone: "+31 20 123 4567",
    company: "Keizersgracht Media Lab",
    status: "active",
    tier: "Pro",
    address: { street: "Keizersgracht 421", city: "Amsterdam", state: "North Holland", postalCode: "1016 EK", country: "Netherlands" },
    metrics: { totalOrders: 4, totalSpent: 3596.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), lastLoginIp: "145.100.2.14 (Amsterdam, NL)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 135).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "cust-048",
    customerNumber: "CUST-8068",
    name: "Julian Brandt",
    email: "j.brandt@copenhagen-green.dk",
    phone: "+45 33 12 34 56",
    company: "Ørsted Green Logistics",
    status: "active",
    tier: "Enterprise",
    address: { street: "Kongens Nytorv 8", city: "Copenhagen", state: "Capital Region", postalCode: "1050", country: "Denmark" },
    metrics: { totalOrders: 5, totalSpent: 6495.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(), lastLoginIp: "192.38.10.2 (Copenhagen, DK)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 160).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "cust-049",
    customerNumber: "CUST-8069",
    name: "Hannah Abbott",
    email: "h.abbott@edinburgh-biotech.ac.uk",
    phone: "+44 131 650 1000",
    company: "Lothian BioLabs",
    status: "active",
    tier: "Pro",
    address: { street: "George Square 18", city: "Edinburgh", state: "Midlothian", postalCode: "EH8 9JZ", country: "United Kingdom" },
    metrics: { totalOrders: 3, totalSpent: 2697.0, avgOrderValue: 899.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: false, lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(), lastLoginIp: "129.215.10.8 (Edinburgh, UK)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
  },
  {
    id: "cust-050",
    customerNumber: "CUST-8070",
    name: "Finnian MacLeod",
    email: "f.macleod@belfast-photon.co.uk",
    phone: "+44 28 9097 5555",
    company: "Antrim Quantum Sensors",
    status: "active",
    tier: "VIP",
    address: { street: "Titanic Quarter, Queen's Rd", city: "Belfast", state: "Antrim", postalCode: "BT3 9DT", country: "United Kingdom" },
    metrics: { totalOrders: 7, totalSpent: 9093.0, avgOrderValue: 1299.0, lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    security: { emailVerified: true, phoneVerified: true, twoFactorEnabled: true, lastLoginAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(), lastLoginIp: "143.117.1.4 (Belfast, UK)" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 260).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

// Helper to attach orders to customer
function getCustomerRecentOrders(customerEmail: string) {
  return ordersStore
    .filter((o) => o.customer.email.toLowerCase() === customerEmail.toLowerCase())
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentStatus: o.payment.status,
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    }));
}

// GET all customers with search and filters
app.get("/api/customers", (req: Request, res: Response) => {
  const { search, status, tier, sortBy } = req.query;
  let results = [...customersStore];

  if (typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.customerNumber.toLowerCase().includes(q) ||
        c.address.city.toLowerCase().includes(q) ||
        c.address.country.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }

  if (typeof status === "string" && status !== "all") {
    results = results.filter((c) => c.status === status);
  }

  if (typeof tier === "string" && tier !== "all") {
    results = results.filter((c) => c.tier === tier);
  }

  if (sortBy === "spent_desc") {
    results.sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
  } else if (sortBy === "orders_desc") {
    results.sort((a, b) => b.metrics.totalOrders - a.metrics.totalOrders);
  } else if (sortBy === "name_asc") {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const enriched = results.map((c) => ({
    ...c,
    recentOrders: getCustomerRecentOrders(c.email),
  }));

  res.json(enriched);
});

// GET single customer by ID
app.get("/api/customers/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const customer = customersStore.find((c) => c.id === id || c.customerNumber === id);

  if (!customer) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }

  res.json({
    ...customer,
    recentOrders: getCustomerRecentOrders(customer.email),
  });
});

// PATCH toggle customer account status (Enable / Disable)
app.patch("/api/customers/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason, note, performedBy = "Admin Staff" } = req.body || {};
  const index = customersStore.findIndex((c) => c.id === id || c.customerNumber === id);

  if (index === -1) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }

  const current = customersStore[index]!;
  const now = new Date().toISOString();

  const updated: CustomerRecord = {
    ...current,
    status: status === "disabled" ? "disabled" : "active",
    disabledReason: status === "disabled" ? reason || "Administrative restriction" : undefined,
    disabledAt: status === "disabled" ? now : undefined,
    disabledBy: status === "disabled" ? performedBy : undefined,
    notes: note
      ? `${current.notes ? `${current.notes}\n` : ""}[${new Date().toLocaleDateString()}] ${performedBy}: ${note}`
      : current.notes,
    updatedAt: now,
  };

  customersStore[index] = updated;
  res.json({
    ...updated,
    recentOrders: getCustomerRecentOrders(updated.email),
  });
});

// PUT fallback for status update
app.put("/api/customers/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason, note, performedBy = "Admin Staff" } = req.body || {};
  const index = customersStore.findIndex((c) => c.id === id || c.customerNumber === id);

  if (index === -1) {
    res.status(404).json({ error: "Customer not found", id });
    return;
  }

  const current = customersStore[index]!;
  const now = new Date().toISOString();

  const updated: CustomerRecord = {
    ...current,
    status: status === "disabled" ? "disabled" : "active",
    disabledReason: status === "disabled" ? reason || "Administrative restriction" : undefined,
    disabledAt: status === "disabled" ? now : undefined,
    disabledBy: status === "disabled" ? performedBy : undefined,
    notes: note
      ? `${current.notes ? `${current.notes}\n` : ""}[${new Date().toLocaleDateString()}] ${performedBy}: ${note}`
      : current.notes,
    updatedAt: now,
  };

  customersStore[index] = updated;
  res.json({
    ...updated,
    recentOrders: getCustomerRecentOrders(updated.email),
  });
});

// GET customer high-level metrics
app.get("/api/customers-metrics", (_req: Request, res: Response) => {
  const totalCustomers = customersStore.length;
  const activeCustomers = customersStore.filter((c) => c.status === "active").length;
  const disabledCustomers = customersStore.filter((c) => c.status === "disabled").length;
  const totalLtv = customersStore.reduce((acc, c) => acc + c.metrics.totalSpent, 0);
  const avgSpendPerCustomer = totalCustomers > 0 ? totalLtv / totalCustomers : 0;
  const vipCustomers = customersStore.filter((c) => c.tier === "VIP" || c.tier === "Enterprise").length;

  res.json({
    totalCustomers,
    activeCustomers,
    disabledCustomers,
    totalLtv,
    avgSpendPerCustomer,
    vipCustomers,
  });
});

// ==========================================
// REVIEW MANAGEMENT SYSTEM
// ==========================================

export interface ReviewRecord {
  id: string;
  reviewNumber: string;
  productId: string;
  productName: string;
  productSku: string;
  productBrand: string;
  productImage?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  status: "published" | "pending" | "flagged" | "rejected";
  isReported: boolean;
  reportsCount: number;
  reports?: {
    id: string;
    reporterName: string;
    reporterEmail?: string;
    reason: string;
    comment?: string;
    reportedAt: string;
  }[];
  moderationHistory?: {
    moderatedBy: string;
    moderatedAt: string;
    action: "approved" | "dismissed_flag" | "rejected" | "deleted";
    reason?: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const reviewsStore: ReviewRecord[] = [
  {
    id: "rev-001",
    reviewNumber: "REV-9011",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-001",
    customerName: "Alex Vance",
    customerEmail: "a.vance@blackmesa.io",
    rating: 5,
    title: "Best enterprise grade hardware on the market",
    comment: "Deployed 20 units across our Black Mesa engineering team. VoIP call clarity is crystal clear over satellite, and the titanium chassis feels virtually indestructible. Battery lasts 2 full business days with heavy telemetry usage.",
    isVerifiedPurchase: true,
    helpfulVotes: 34,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "rev-002",
    reviewNumber: "REV-9012",
    productId: "p2",
    productName: "NexPhone Enterprise Edge Fleet Pack",
    productSku: "NX-ENT-EDGE-5PK",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-002",
    customerName: "Sophia Tanaka",
    customerEmail: "s.tanaka@cyberdyne.co.jp",
    rating: 5,
    title: "Seamless fleet provisioning in Tokyo",
    comment: "The remote eSIM bulk activation took less than 4 minutes for our entire department. High-bandwidth 5G mmWave connectivity performs flawlessly in Shinjuku and Roppongi. Highly recommended for corporate fleets.",
    isVerifiedPurchase: true,
    helpfulVotes: 21,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "rev-003",
    reviewNumber: "REV-9013",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-256-SL",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-003",
    customerName: "Marcus Sterling",
    customerEmail: "m.sterling@acmeholdings.com",
    rating: 4,
    title: "Superb display, slightly heavy charging dock",
    comment: "The 120Hz ProMotion OLED screen is stunning under direct UK sunlight. The only minor gripe is that the multi-device inductive charger dock is somewhat heavy for frequent international carry-on luggage.",
    isVerifiedPurchase: true,
    helpfulVotes: 16,
    unhelpfulVotes: 2,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "rev-004",
    reviewNumber: "REV-9014",
    productId: "p3",
    productName: "NexPhone Lite",
    productSku: "NX-LITE-128-MB",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-099",
    customerName: "Anonymous Spammer",
    customerEmail: "free-coupons-bot99@scamdeal.xyz",
    rating: 1,
    title: "DO NOT BUY HERE!! GET 90% OFF AT SCAMDEAL.XYZ/NEXPHONE",
    comment: "Why pay full price when you can get cheap refurbished phones and $500 gift cards by clicking http://scamdeal.xyz/nexphone-promo right now!!! Limited codes available enter code FREE90.",
    isVerifiedPurchase: false,
    helpfulVotes: 0,
    unhelpfulVotes: 48,
    status: "flagged",
    isReported: true,
    reportsCount: 6,
    reports: [
      {
        id: "rep-001",
        reporterName: "Elena Rostova",
        reporterEmail: "e.rostova@berlin-tech.de",
        reason: "spam_promotion",
        comment: "Obvious phishing and malware URL spam link.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: "rep-002",
        reporterName: "Marcus Sterling",
        reporterEmail: "m.sterling@acmeholdings.com",
        reason: "spam_promotion",
        comment: "Automated bot spam promoting suspicious coupon site.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      },
      {
        id: "rep-003",
        reporterName: "Alex Vance",
        reporterEmail: "a.vance@blackmesa.io",
        reason: "fake_review",
        comment: "Spam account not a verified purchaser.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "rev-005",
    reviewNumber: "REV-9015",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-098",
    customerName: "Raging Troll",
    customerEmail: "troll_gamer42@trashmail.com",
    rating: 1,
    title: "GARBAGE PHONE AND YOU ARE ALL STUPID IDIOTS",
    comment: "This company is run by absolute morons and clowns. Anyone who buys this should go jump in a ditch and learn a lesson. Worst phone ever made in human history, trash trash trash!",
    isVerifiedPurchase: false,
    helpfulVotes: 0,
    unhelpfulVotes: 62,
    status: "flagged",
    isReported: true,
    reportsCount: 4,
    reports: [
      {
        id: "rep-004",
        reporterName: "Lucas Meyer",
        reporterEmail: "l.meyer@zurich-quant.ch",
        reason: "offensive_language",
        comment: "Hate speech and personal insults without any product feedback.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
      {
        id: "rep-005",
        reporterName: "Chloe Dubois",
        reporterEmail: "c.dubois@lyon-biotech.fr",
        reason: "offensive_language",
        comment: "Violates community policy against harassment and abusive conduct.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
  },
  {
    id: "rev-006",
    reviewNumber: "REV-9016",
    productId: "p4",
    productName: "NexPhone Ultra Fold",
    productSku: "NX-FOLD-512",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-097",
    customerName: "Apex Rival Brand Rep",
    customerEmail: "pr-rival@competitortech.cn",
    rating: 1,
    title: "DO NOT BUY! Hinge snapped in half on day 1 and exploded",
    comment: "The foldable screen crease broke into sharp pieces and literally caught fire in my pocket. Buy Brand X instead, it has better chips and costs half the price. NexPhone is a danger to families.",
    isVerifiedPurchase: false,
    helpfulVotes: 1,
    unhelpfulVotes: 39,
    status: "flagged",
    isReported: true,
    reportsCount: 3,
    reports: [
      {
        id: "rep-006",
        reporterName: "Astrid Lindholm",
        reporterEmail: "astrid.l@stockholm-design.se",
        reason: "competitor_defamation",
        comment: "Fabricated safety hazard claims by competitor marketing agent.",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: "rev-007",
    reviewNumber: "REV-9017",
    productId: "p4",
    productName: "NexPhone Ultra Fold",
    productSku: "NX-FOLD-512",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-004",
    customerName: "Elena Rostova",
    customerEmail: "e.rostova@berlin-tech.de",
    rating: 5,
    title: "The zero-gap hinge engineering is miraculous",
    comment: "Having used foldable devices from various manufacturers over 4 years, NexPhone's zero-gap hinge and micro-polymer screen layer are completely unmatched. Split-screen multi-tasking runs without lag.",
    isVerifiedPurchase: true,
    helpfulVotes: 29,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "rev-008",
    reviewNumber: "REV-9018",
    productId: "p3",
    productName: "NexPhone Lite",
    productSku: "NX-LITE-128-MB",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-005",
    customerName: "Viktor Novak",
    customerEmail: "v.novak@prague-cyber.cz",
    rating: 4,
    title: "Terrific value for money for field personnel",
    comment: "Equipped 50 mobile technicians with the Lite edition. The IP68 water resistance held up during heavy rain testing, and the custom encryption chip provides peace of mind for sensitive telemetry logs.",
    isVerifiedPurchase: true,
    helpfulVotes: 18,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "rev-009",
    reviewNumber: "REV-9019",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-1TB-TI",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-096",
    customerName: "Doxxing Offender",
    customerEmail: "leaks_exposer@tempmail.io",
    rating: 1,
    title: "Admin personal phone number leaked here",
    comment: "This company employee lives at 123 Elm St and their direct cell number is 555-0199 call them at 3 AM to demand discounts.",
    isVerifiedPurchase: false,
    helpfulVotes: 0,
    unhelpfulVotes: 75,
    status: "rejected",
    isReported: true,
    reportsCount: 8,
    reports: [
      {
        id: "rep-007",
        reporterName: "System Guard",
        reason: "personal_data",
        comment: "Publishing personally identifiable information (PII).",
        reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ],
    moderationHistory: [
      {
        moderatedBy: "Security Lead",
        moderatedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
        action: "deleted",
        reason: "Doxxing and PII violation",
        note: "Content removed immediately under emergency privacy safety policy. IP address permanently blacklisted.",
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
  },
  {
    id: "rev-010",
    reviewNumber: "REV-9020",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-016",
    customerName: "Lucas Meyer",
    customerEmail: "l.meyer@zurich-quant.ch",
    rating: 5,
    title: "Sub-millisecond biometric response and satellite link",
    comment: "Financial trading telemetry on this phone executes with lowest jitter we have measured. The secure hardware enclave allows rapid biometric authorization without cloud dependency.",
    isVerifiedPurchase: true,
    helpfulVotes: 42,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: "rev-011",
    reviewNumber: "REV-9021",
    productId: "p2",
    productName: "NexPhone Enterprise Edge Fleet Pack",
    productSku: "NX-ENT-EDGE-5PK",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-018",
    customerName: "Hassan Al-Mansoor",
    customerEmail: "hassan@doha-ventures.qa",
    rating: 5,
    title: "Exceptional thermal dissipation in high ambient heat",
    comment: "Tested under 45°C ambient desert conditions in Qatar. No thermal throttling observed during continuous 4K video conferencing and GPS tracking.",
    isVerifiedPurchase: true,
    helpfulVotes: 31,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id: "rev-012",
    reviewNumber: "REV-9022",
    productId: "p4",
    productName: "NexPhone Ultra Fold",
    productSku: "NX-FOLD-512",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-029",
    customerName: "Zara Chen",
    customerEmail: "zara.chen@melbourne-health.au",
    rating: 5,
    title: "Ideal for healthcare diagnostics and PACS viewer",
    comment: "The expansive 7.8-inch unfolded canvas allows our clinical radiologists to inspect CT scan slices with remarkable fidelity while on rounds.",
    isVerifiedPurchase: true,
    helpfulVotes: 25,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "rev-013",
    reviewNumber: "REV-9023",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-256-SL",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-033",
    customerName: "Ananya Patel",
    customerEmail: "ananya.p@singapore-data.sg",
    rating: 4,
    title: "Impressive optics and computational photography",
    comment: "Low-light night mode and LiDAR depth capture are phenomenal. Camera software UI has minor learning curve but results speak for themselves.",
    isVerifiedPurchase: true,
    helpfulVotes: 19,
    unhelpfulVotes: 2,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
  },
  {
    id: "rev-014",
    reviewNumber: "REV-9024",
    productId: "p3",
    productName: "NexPhone Lite",
    productSku: "NX-LITE-128-MB",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-041",
    customerName: "Emma Watson",
    customerEmail: "e.watson@oxford-genomics.org",
    rating: 5,
    title: "Compact, durable, and highly dependable",
    comment: "Clean Android enterprise build without bloatware. Clean quarterly security updates and solid build quality make this our standard lab device.",
    isVerifiedPurchase: true,
    helpfulVotes: 15,
    unhelpfulVotes: 0,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
  },
  {
    id: "rev-015",
    reviewNumber: "REV-9025",
    productId: "p1",
    productName: "NexPhone 15 Pro Max",
    productSku: "NX-PRO-MAX-512-SG",
    productBrand: "NexPhone Labs",
    productImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
    customerId: "cust-047",
    customerName: "Zoe Kravitz",
    customerEmail: "zoe.k@amsterdam-creative.nl",
    rating: 5,
    title: "Audio recording and stereo microphones are studio quality",
    comment: "The 3D spatial audio recording handles live concert acoustics without distortion or peaking. Exporting raw ProRes files directly over USB-C 40Gbps is a lifesaver.",
    isVerifiedPurchase: true,
    helpfulVotes: 23,
    unhelpfulVotes: 1,
    status: "published",
    isReported: false,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

// GET /api/reviews
app.get("/api/reviews", (req: Request, res: Response) => {
  const {
    search = "",
    status = "all",
    rating = "all",
    reportedOnly = "false",
    sortBy = "recent",
  } = req.query as Record<string, string>;

  let results = [...reviewsStore];

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.reviewNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerEmail.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.productSku.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (status !== "all") {
    results = results.filter((r) => r.status === status);
  }

  // Rating filter
  if (rating !== "all") {
    const numRating = Number(rating);
    if (!isNaN(numRating)) {
      results = results.filter((r) => r.rating === numRating);
    }
  }

  // Reported only filter
  if (reportedOnly === "true") {
    results = results.filter((r) => r.isReported && r.status !== "rejected");
  }

  // Sorting
  if (sortBy === "rating_desc") {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "rating_asc") {
    results.sort((a, b) => a.rating - b.rating);
  } else if (sortBy === "reports_desc") {
    results.sort((a, b) => b.reportsCount - a.reportsCount);
  } else if (sortBy === "helpful_desc") {
    results.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(results);
});

// GET /api/reviews/:id
app.get("/api/reviews/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const review = reviewsStore.find((r) => r.id === id || r.reviewNumber === id);
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  res.json(review);
});

// DELETE /api/reviews/:id (Delete/Reject inappropriate review)
app.delete("/api/reviews/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason = "Inappropriate content", moderationNote, moderatedBy = "Admin Moderator" } = req.body || {};

  const index = reviewsStore.findIndex((r) => r.id === id || r.reviewNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const current = reviewsStore[index]!;
  const now = new Date().toISOString();

  const moderationEntry = {
    moderatedBy,
    moderatedAt: now,
    action: "deleted" as const,
    reason,
    note: moderationNote,
  };

  const updated: ReviewRecord = {
    ...current,
    status: "rejected",
    isReported: false,
    moderationHistory: [...(current.moderationHistory || []), moderationEntry],
    updatedAt: now,
  };

  reviewsStore[index] = updated;
  res.json({ message: "Review deleted successfully", review: updated });
});

// PATCH /api/reviews/:id/status (Change status: published, flagged, rejected)
app.patch("/api/reviews/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason, note, moderatedBy = "Admin Moderator" } = req.body || {};

  const index = reviewsStore.findIndex((r) => r.id === id || r.reviewNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const current = reviewsStore[index]!;
  const now = new Date().toISOString();

  const moderationEntry = {
    moderatedBy,
    moderatedAt: now,
    action: (status === "published" ? "approved" : status === "rejected" ? "rejected" : "dismissed_flag") as any,
    reason,
    note,
  };

  const updated: ReviewRecord = {
    ...current,
    status,
    isReported: status === "flagged",
    moderationHistory: [...(current.moderationHistory || []), moderationEntry],
    updatedAt: now,
  };

  reviewsStore[index] = updated;
  res.json(updated);
});

// POST /api/reviews/:id/dismiss-report (Dismiss flagged report and keep published)
app.post("/api/reviews/:id/dismiss-report", (req: Request, res: Response) => {
  const { id } = req.params;
  const { note, moderatedBy = "Admin Moderator" } = req.body || {};

  const index = reviewsStore.findIndex((r) => r.id === id || r.reviewNumber === id);
  if (index === -1) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const current = reviewsStore[index]!;
  const now = new Date().toISOString();

  const moderationEntry = {
    moderatedBy,
    moderatedAt: now,
    action: "dismissed_flag" as const,
    reason: "Report reviewed and dismissed as compliant with policy",
    note,
  };

  const updated: ReviewRecord = {
    ...current,
    status: "published",
    isReported: false,
    reportsCount: 0,
    moderationHistory: [...(current.moderationHistory || []), moderationEntry],
    updatedAt: now,
  };

  reviewsStore[index] = updated;
  res.json({ message: "Report dismissed, review restored to published", review: updated });
});

// GET /api/reviews-metrics
app.get("/api/reviews-metrics", (_req: Request, res: Response) => {
  const totalReviews = reviewsStore.length;
  const publishedCount = reviewsStore.filter((r) => r.status === "published").length;
  const reportedCount = reviewsStore.filter((r) => r.isReported && r.status !== "rejected").length;
  const rejectedCount = reviewsStore.filter((r) => r.status === "rejected").length;

  const validRatings = reviewsStore.filter((r) => r.status !== "rejected");
  const averageRating =
    validRatings.length > 0
      ? Number((validRatings.reduce((acc, r) => acc + r.rating, 0) / validRatings.length).toFixed(1))
      : 5.0;

  const verifiedCount = reviewsStore.filter((r) => r.isVerifiedPurchase).length;
  const verifiedPurchaseRate = totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 100;

  const ratingDistribution = {
    5: reviewsStore.filter((r) => r.rating === 5).length,
    4: reviewsStore.filter((r) => r.rating === 4).length,
    3: reviewsStore.filter((r) => r.rating === 3).length,
    2: reviewsStore.filter((r) => r.rating === 2).length,
    1: reviewsStore.filter((r) => r.rating === 1).length,
  };

  res.json({
    totalReviews,
    averageRating,
    publishedCount,
    reportedCount,
    rejectedCount,
    verifiedPurchaseRate,
    ratingDistribution,
  });
});

// ==========================================
// PROMOTION MANAGEMENT STORE & ENDPOINTS
// ==========================================

export interface PromotionRecord {
  id: string;
  code?: string;
  title: string;
  description: string;
  type: "promo_code" | "sale_campaign" | "automatic";
  discountType: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  scope: "all_products" | "specific_products" | "specific_brands" | "min_order_value";
  targetItems?: string[];
  status: "active" | "scheduled" | "expired" | "disabled";
  startDate: string;
  endDate: string | null;
  usageLimit?: number | null;
  usedCount: number;
  customerLimit?: number;
  campaignTag?: string;
  bannerColor?: "indigo" | "rose" | "amber" | "emerald" | "purple" | "cyan";
  revenueGenerated: number;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

const nowTime = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;

export const promotionsStore: PromotionRecord[] = [
  {
    id: "promo-001",
    code: "NEXLAUNCH20",
    title: "NexPhone 15 Pro Commercial Launch",
    description: "Launch coupon providing 20% discount on all NexPhone 15 Pro Max and Enterprise hardware configurations.",
    type: "promo_code",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 800,
    maxDiscountAmount: 400,
    scope: "specific_products",
    targetItems: ["NexPhone 15 Pro Max", "NexPhone Enterprise Edge Fleet Pack"],
    status: "active",
    startDate: new Date(nowTime - 7 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 21 * ONE_DAY).toISOString(),
    usageLimit: 1000,
    usedCount: 342,
    customerLimit: 1,
    campaignTag: "Flagship Launch",
    bannerColor: "indigo",
    revenueGenerated: 348500,
    ordersCount: 342,
    createdAt: new Date(nowTime - 7 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-002",
    code: "FLEETVIP100",
    title: "Enterprise Fleet Upgrade Voucher",
    description: "Instant $100 off bulk orders exceeding $1,500 for corporate verified accounts.",
    type: "promo_code",
    discountType: "fixed_amount",
    discountValue: 100,
    minOrderValue: 1500,
    scope: "all_products",
    targetItems: ["All Catalog Products"],
    status: "active",
    startDate: new Date(nowTime - 14 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 45 * ONE_DAY).toISOString(),
    usageLimit: 250,
    usedCount: 89,
    customerLimit: 2,
    campaignTag: "Enterprise VIP",
    bannerColor: "purple",
    revenueGenerated: 168200,
    ordersCount: 89,
    createdAt: new Date(nowTime - 14 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 2 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-003",
    code: "FREESHIP",
    title: "Global Express Courier Shipping",
    description: "Complimentary worldwide express air dispatch on all mobile fleets over $300.",
    type: "promo_code",
    discountType: "free_shipping",
    discountValue: 0,
    minOrderValue: 300,
    scope: "all_products",
    targetItems: ["All Catalog Products"],
    status: "active",
    startDate: new Date(nowTime - 30 * ONE_DAY).toISOString(),
    endDate: null,
    usageLimit: null,
    usedCount: 1280,
    customerLimit: 5,
    campaignTag: "Shipping Perk",
    bannerColor: "emerald",
    revenueGenerated: 940000,
    ordersCount: 1280,
    createdAt: new Date(nowTime - 30 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-004",
    title: "NexPhone Spring Fleet Expo 2026",
    description: "Sitewide seasonal commercial campaign offering 12% off entire order plus 1 year free Satellite VoIP service trial.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 12,
    minOrderValue: 500,
    maxDiscountAmount: 350,
    scope: "all_products",
    targetItems: ["Entire Hardware Catalog"],
    status: "active",
    startDate: new Date(nowTime - 3 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 4 * ONE_DAY).toISOString(),
    usageLimit: null,
    usedCount: 512,
    campaignTag: "Spring Expo",
    bannerColor: "cyan",
    revenueGenerated: 624000,
    ordersCount: 512,
    createdAt: new Date(nowTime - 5 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-005",
    title: "Titanium Premiere Accessories Flash Sale",
    description: "Exclusive 25% reduction on high-durability titanium cases, MagSafe power hubs, and encrypted audio accessories.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 25,
    scope: "specific_brands",
    targetItems: ["NexPhone Labs Titanium Series", "Encrypted Peripherals"],
    status: "active",
    startDate: new Date(nowTime - 1 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 2 * ONE_DAY).toISOString(),
    usageLimit: 300,
    usedCount: 214,
    campaignTag: "Flash Sale",
    bannerColor: "rose",
    revenueGenerated: 42800,
    ordersCount: 214,
    createdAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime).toISOString(),
  },
  {
    id: "promo-006",
    code: "CYBEREARLY",
    title: "Cyber Surge VIP Early Bird Access",
    description: "Exclusive pre-launch promo code granting 15% discount for registered fleet managers prior to public Cyber Week.",
    type: "promo_code",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 1000,
    maxDiscountAmount: 600,
    scope: "all_products",
    targetItems: ["All Catalog Products"],
    status: "scheduled",
    startDate: new Date(nowTime + 7 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 21 * ONE_DAY).toISOString(),
    usageLimit: 500,
    usedCount: 0,
    customerLimit: 1,
    campaignTag: "Cyber Surge",
    bannerColor: "indigo",
    revenueGenerated: 0,
    ordersCount: 0,
    createdAt: new Date(nowTime - 2 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 2 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-007",
    title: "Black Friday Global Fleet Surge 2026",
    description: "Massive upcoming sitewide hardware sale with up to 30% off tier 2 bulk orders and subsidized data roaming.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 30,
    minOrderValue: 2000,
    maxDiscountAmount: 1200,
    scope: "all_products",
    targetItems: ["Enterprise Fleet Bundles"],
    status: "scheduled",
    startDate: new Date(nowTime + 18 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 25 * ONE_DAY).toISOString(),
    usageLimit: null,
    usedCount: 0,
    campaignTag: "Black Friday",
    bannerColor: "amber",
    revenueGenerated: 0,
    ordersCount: 0,
    createdAt: new Date(nowTime - 4 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 4 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-008",
    title: "Enterprise Tier 3 Volume Auto-Rebate",
    description: "Automatic checkout reduction of $600 for enterprise purchase orders totaling over $5,000.",
    type: "automatic",
    discountType: "fixed_amount",
    discountValue: 600,
    minOrderValue: 5000,
    scope: "min_order_value",
    targetItems: ["Orders above $5,000 USD"],
    status: "active",
    startDate: new Date(nowTime - 60 * ONE_DAY).toISOString(),
    endDate: null,
    usageLimit: null,
    usedCount: 76,
    campaignTag: "Volume Rebate",
    bannerColor: "emerald",
    revenueGenerated: 485000,
    ordersCount: 76,
    createdAt: new Date(nowTime - 60 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 10 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-009",
    code: "SUMMER50",
    title: "Mid-Year Mid-Summer Upgrade Voucher",
    description: "Summer promotional discount of $50 off on select NexPhone Lite models.",
    type: "promo_code",
    discountType: "fixed_amount",
    discountValue: 50,
    minOrderValue: 400,
    scope: "specific_products",
    targetItems: ["NexPhone Lite"],
    status: "expired",
    startDate: new Date(nowTime - 90 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime - 15 * ONE_DAY).toISOString(),
    usageLimit: 200,
    usedCount: 200,
    customerLimit: 1,
    campaignTag: "Summer Promo",
    bannerColor: "amber",
    revenueGenerated: 98000,
    ordersCount: 200,
    createdAt: new Date(nowTime - 90 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 15 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-010",
    title: "Q3 Inventory Deprecation Clearance",
    description: "Final clearance event for Gen 11 devices with 35% clearance markdown.",
    type: "sale_campaign",
    discountType: "percentage",
    discountValue: 35,
    scope: "specific_products",
    targetItems: ["NexPhone Gen 11 Refurbished"],
    status: "expired",
    startDate: new Date(nowTime - 45 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime - 5 * ONE_DAY).toISOString(),
    usageLimit: 150,
    usedCount: 148,
    campaignTag: "Clearance",
    bannerColor: "rose",
    revenueGenerated: 74200,
    ordersCount: 148,
    createdAt: new Date(nowTime - 45 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 5 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-011",
    code: "DEVTEST10",
    title: "Sandbox Testing Voucher",
    description: "Internal engineering test discount code for automated telemetry pipelines.",
    type: "promo_code",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 100,
    scope: "all_products",
    targetItems: ["Sandbox Environments"],
    status: "disabled",
    startDate: new Date(nowTime - 20 * ONE_DAY).toISOString(),
    endDate: new Date(nowTime + 100 * ONE_DAY).toISOString(),
    usageLimit: 50,
    usedCount: 12,
    customerLimit: 1,
    campaignTag: "Internal QA",
    bannerColor: "purple",
    revenueGenerated: 2400,
    ordersCount: 12,
    createdAt: new Date(nowTime - 20 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 1 * ONE_DAY).toISOString(),
  },
  {
    id: "promo-012",
    title: "Gov & Education Fleet Starter Rebate",
    description: "Automatic $300 equipment subsidy for verified academic laboratories and municipal agencies.",
    type: "automatic",
    discountType: "fixed_amount",
    discountValue: 300,
    minOrderValue: 2500,
    scope: "specific_brands",
    targetItems: ["NexPhone Education Labs"],
    status: "active",
    startDate: new Date(nowTime - 40 * ONE_DAY).toISOString(),
    endDate: null,
    usageLimit: 100,
    usedCount: 41,
    campaignTag: "Public Sector",
    bannerColor: "cyan",
    revenueGenerated: 145000,
    ordersCount: 41,
    createdAt: new Date(nowTime - 40 * ONE_DAY).toISOString(),
    updatedAt: new Date(nowTime - 3 * ONE_DAY).toISOString(),
  }
];

// GET /api/promotions
app.get("/api/promotions", (req: Request, res: Response) => {
  const { search, type, status, sortBy } = req.query;
  let result = [...promotionsStore];

  if (typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.campaignTag && p.campaignTag.toLowerCase().includes(q)) ||
        (p.targetItems && p.targetItems.some((t) => t.toLowerCase().includes(q)))
    );
  }

  if (typeof type === "string" && type !== "all") {
    result = result.filter((p) => p.type === type);
  }

  if (typeof status === "string" && status !== "all") {
    result = result.filter((p) => p.status === status);
  }

  if (sortBy === "highest_discount") {
    result.sort((a, b) => b.discountValue - a.discountValue);
  } else if (sortBy === "most_used") {
    result.sort((a, b) => b.usedCount - a.usedCount);
  } else if (sortBy === "revenue_desc") {
    result.sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  } else if (sortBy === "ending_soon") {
    result.sort((a, b) => {
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });
  } else {
    // Default: recent
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(result);
});

// GET /api/promotions/:id
app.get("/api/promotions/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const promo = promotionsStore.find((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (!promo) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }
  res.json(promo);
});

// POST /api/promotions (Create discount/promo code/sale campaign)
app.post("/api/promotions", (req: Request, res: Response) => {
  const body = req.body || {};
  if (!body.title || !body.discountType) {
    res.status(400).json({ error: "Title and discountType are required fields" });
    return;
  }

  // Format code if promo_code
  let formattedCode: string | undefined = undefined;
  if (body.type === "promo_code" || body.code) {
    formattedCode = String(body.code || `NEX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`).trim().toUpperCase();
    const existing = promotionsStore.find((p) => p.code === formattedCode);
    if (existing) {
      res.status(409).json({ error: `Promo code "${formattedCode}" already exists. Please choose a unique code.` });
      return;
    }
  }

  const now = new Date().toISOString();
  const newId = `promo-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;

  const newPromo: PromotionRecord = {
    id: newId,
    code: formattedCode,
    title: String(body.title).trim(),
    description: String(body.description || "Active promotion").trim(),
    type: body.type || (formattedCode ? "promo_code" : "sale_campaign"),
    discountType: body.discountType,
    discountValue: Number(body.discountValue) || 0,
    minOrderValue: body.minOrderValue ? Number(body.minOrderValue) : undefined,
    maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined,
    scope: body.scope || "all_products",
    targetItems: Array.isArray(body.targetItems) ? body.targetItems : (body.targetItems ? [body.targetItems] : ["All Products"]),
    status: body.status || "active",
    startDate: body.startDate || now,
    endDate: body.endDate || null,
    usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
    usedCount: 0,
    customerLimit: body.customerLimit ? Number(body.customerLimit) : 1,
    campaignTag: body.campaignTag || (body.type === "sale_campaign" ? "Sale Campaign" : "Promo Code"),
    bannerColor: body.bannerColor || "indigo",
    revenueGenerated: 0,
    ordersCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  promotionsStore.unshift(newPromo);
  res.status(201).json(newPromo);
});

// PUT /api/promotions/:id (Edit discount)
app.put("/api/promotions/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const index = promotionsStore.findIndex((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (index === -1) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }

  const current = promotionsStore[index]!;
  const body = req.body || {};

  // Check code uniqueness if changing code
  if (body.code && body.code.toUpperCase() !== current.code) {
    const newCode = body.code.toUpperCase().trim();
    const existing = promotionsStore.find((p) => p.code === newCode && p.id !== current.id);
    if (existing) {
      res.status(409).json({ error: `Promo code "${newCode}" already in use by another promotion.` });
      return;
    }
  }

  const updated: PromotionRecord = {
    ...current,
    title: body.title !== undefined ? String(body.title).trim() : current.title,
    code: body.code !== undefined ? (body.code ? String(body.code).trim().toUpperCase() : undefined) : current.code,
    description: body.description !== undefined ? String(body.description).trim() : current.description,
    type: body.type || current.type,
    discountType: body.discountType || current.discountType,
    discountValue: body.discountValue !== undefined ? Number(body.discountValue) : current.discountValue,
    minOrderValue: body.minOrderValue !== undefined ? Number(body.minOrderValue) : current.minOrderValue,
    maxDiscountAmount: body.maxDiscountAmount !== undefined ? Number(body.maxDiscountAmount) : current.maxDiscountAmount,
    scope: body.scope || current.scope,
    targetItems: body.targetItems !== undefined ? (Array.isArray(body.targetItems) ? body.targetItems : [body.targetItems]) : current.targetItems,
    status: body.status || current.status,
    startDate: body.startDate || current.startDate,
    endDate: body.endDate !== undefined ? body.endDate : current.endDate,
    usageLimit: body.usageLimit !== undefined ? (body.usageLimit ? Number(body.usageLimit) : null) : current.usageLimit,
    customerLimit: body.customerLimit !== undefined ? Number(body.customerLimit) : current.customerLimit,
    campaignTag: body.campaignTag !== undefined ? String(body.campaignTag).trim() : current.campaignTag,
    bannerColor: body.bannerColor || current.bannerColor,
    updatedAt: new Date().toISOString(),
  };

  promotionsStore[index] = updated;
  res.json(updated);
});

// DELETE /api/promotions/:id (Delete discount)
app.delete("/api/promotions/:id", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const index = promotionsStore.findIndex((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (index === -1) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }

  const [deleted] = promotionsStore.splice(index, 1);
  res.json({ message: "Promotion removed successfully", promotion: deleted });
});

// PATCH /api/promotions/:id/status (Toggle active/disabled/scheduled)
app.patch("/api/promotions/:id/status", (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  const idUpper = id.toUpperCase();
  const { status } = req.body || {};
  const index = promotionsStore.findIndex((p) => p.id === id || (p.code && p.code.toUpperCase() === idUpper));
  if (index === -1) {
    res.status(404).json({ error: "Promotion not found" });
    return;
  }

  if (!["active", "scheduled", "expired", "disabled"].includes(status)) {
    res.status(400).json({ error: "Invalid status value" });
    return;
  }

  promotionsStore[index] = {
    ...promotionsStore[index]!,
    status,
    updatedAt: new Date().toISOString(),
  };

  res.json(promotionsStore[index]);
});

// GET /api/promotions-metrics
app.get("/api/promotions-metrics", (_req: Request, res: Response) => {
  const totalPromotions = promotionsStore.length;
  const activePromotions = promotionsStore.filter((p) => p.status === "active").length;
  const scheduledCampaigns = promotionsStore.filter((p) => p.status === "scheduled").length;
  const expiredPromotions = promotionsStore.filter((p) => p.status === "expired").length;

  const totalRedemptions = promotionsStore.reduce((acc, p) => acc + (p.usedCount || 0), 0);
  const totalRevenueGenerated = promotionsStore.reduce((acc, p) => acc + (p.revenueGenerated || 0), 0);

  // Calculate approximate discount given
  const totalDiscountGiven = promotionsStore.reduce((acc, p) => {
    if (p.discountType === "fixed_amount") {
      return acc + p.discountValue * (p.usedCount || 0);
    } else if (p.discountType === "percentage") {
      // average ~15% on attributed sales
      return acc + Math.round((p.revenueGenerated || 0) * (p.discountValue / 100));
    } else {
      // free shipping (~$35 saved per order)
      return acc + (p.usedCount || 0) * 35;
    }
  }, 0);

  const activePromoCodesCount = promotionsStore.filter(
    (p) => p.type === "promo_code" && p.status === "active"
  ).length;

  res.json({
    totalPromotions,
    activePromotions,
    scheduledCampaigns,
    expiredPromotions,
    totalRedemptions,
    totalDiscountGiven,
    totalRevenueGenerated,
    activePromoCodesCount,
  });
});








