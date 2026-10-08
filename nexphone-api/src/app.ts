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

