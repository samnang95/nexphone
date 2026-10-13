import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env";
import {
  authRouter,
  userRouter,
  systemRouter,
  dashboardRouter,
  productsRouter,
  brandsRouter,
  inventoryRouter,
  ordersRouter,
  customersRouter,
  reviewsRouter,
  promotionsRouter,
  contentRouter,
  notificationsRouter,
  settingsRouter,
  analyticsRouter,
  uploadRouter,
  cartRouter,
  wishlistRouter,
  comparisonRouter,
} from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

export const app = express();

// Behind a reverse proxy, set TRUST_PROXY (e.g. "1") so rate limiting sees real client IPs.
if (process.env.TRUST_PROXY) {
  const trustProxy = process.env.TRUST_PROXY;
  app.set("trust proxy", /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
}

// Middlewares
// Frontends run on other origins and will load uploaded media from this API, hence cross-origin CORP.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
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

// Feature modules
app.use(["/api/auth", "/auth"], authRouter);
app.use(["/api/user", "/api/users", "/user"], userRouter);
app.use(["/api/upload", "/api/uploads"], uploadRouter);
app.use(["/api/compare", "/compare", "/api/products/compare"], comparisonRouter);
app.use(["/api/products", "/api/phones"], productsRouter);
app.use("/api/brands", brandsRouter);
app.use(["/api/cart", "/cart"], cartRouter);
app.use(["/api/wishlist", "/wishlist"], wishlistRouter);

// Legacy in-memory feature modules (mounted at root; each router declares full paths).
// Order preserved from the original monolithic app.ts.
app.use(systemRouter);
app.use(dashboardRouter);
app.use(inventoryRouter);
app.use(ordersRouter);
app.use(customersRouter);
app.use(reviewsRouter);
app.use(promotionsRouter);
app.use(contentRouter);
app.use(notificationsRouter);
app.use(settingsRouter);
app.use(analyticsRouter);

// ==========================================
// Fallbacks (must stay last)
// ==========================================
app.use(notFound);
app.use(errorHandler);
