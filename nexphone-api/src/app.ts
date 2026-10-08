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




