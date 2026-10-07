# NexPhone Multi-Flavor Architecture (Dev / Staging / Prod)

This document details the multi-flavor environment configuration implemented across the NexPhone fullstack platform (`nexphone-api`, `nexphone-admin`, and `nexphone-web`).

---

## 🎯 1. Flavor Overview & Ports

| Project | Dev Flavor | Staging Flavor | Production Flavor | Port Assignment |
| :--- | :--- | :--- | :--- | :--- |
| **`nexphone-api`** | Local DB (`nexphone_dev`) | Staging DB (`nexphone_staging`) | Cloud Mongo Cluster | `4000` (dev/prod), `4001` (staging) |
| **`nexphone-admin`** | Points to `http://localhost:4000/api` | Points to `http://localhost:4001/api` | Points to `https://api.nexphone.io/api` | `3001` |
| **`nexphone-web`** | Points to `http://localhost:4000/api` | Points to `http://localhost:4001/api` | Points to `https://api.nexphone.io/api` | `3000` |

---

## 🚀 2. Running Flavors

### Option A: From Monorepo Root

Run all services concurrently under a specific flavor:

```bash
# Development (Local API on 4000, Admin on 3001, Web on 3000)
npm run dev

# Staging (Staging API on 4001, Admin on 3001, Web on 3000)
npm run dev:staging

# Production flavor simulation
npm run dev:prod
```

Run individual services from root:
```bash
npm run dev:api           # API in Dev
npm run dev:api:staging   # API in Staging
npm run dev:admin         # Admin in Dev
npm run dev:web           # Web in Dev
```

---

### Option B: Within Individual Service Directories

#### Backend API (`nexphone-api`)
```bash
cd nexphone-api

# Dev flavor (Port 4000, hot reload with tsx watch)
npm run dev

# Staging flavor (Port 4001)
npm run dev:staging

# Production flavor (Port 4000)
npm run dev:prod

# Production build & start
npm run build
npm run start
```

#### Admin Dashboard (`nexphone-admin`)
```bash
cd nexphone-admin

# Development flavor
npm run dev

# Staging flavor
npm run dev:staging

# Production flavor
npm run dev:prod

# Flavor-specific builds
npm run build:dev
npm run build:staging
npm run build:prod
```

#### Web Portal (`nexphone-web`)
```bash
cd nexphone-web

# Development flavor
npm run dev

# Staging flavor
npm run dev:staging

# Production flavor
npm run dev:prod

# Flavor-specific builds
npm run build:dev
npm run build:staging
npm run build:prod
```

---

## 📁 3. Environment Files Structure

Each sub-project maintains dedicated, isolated flavor configuration files:

```
nexphone/
├── package.json               # Root monorepo flavor orchestration
├── FLAVORS.md                 # Flavor documentation & usage guide
├── nexphone-api/
│   ├── .env.dev               # Dev flavor (port 4000, local mongodb)
│   ├── .env.staging           # Staging flavor (port 4001, staging db)
│   ├── .env.prod              # Prod flavor (port 4000, cloud db)
│   ├── .env.example           # Example template
│   └── src/config/env.ts      # Cascading flavor loader & type-safe config
├── nexphone-admin/
│   ├── .env.dev               # Dev flavor (points to http://localhost:4000/api)
│   ├── .env.staging           # Staging flavor (points to http://localhost:4001/api)
│   ├── .env.prod              # Prod flavor (points to https://api.nexphone.io/api)
│   ├── .env.example           # Example template
│   └── src/config/env.ts      # Typed appConfig object
└── nexphone-web/
    ├── .env.dev               # Dev flavor (points to http://localhost:4000/api)
    ├── .env.staging           # Staging flavor (points to http://localhost:4001/api)
    ├── .env.prod              # Prod flavor (points to https://api.nexphone.io/api)
    ├── .env.example           # Example template
    └── app/config/env.ts      # Typed appConfig object
```

---

## 🔍 4. Flavor Diagnostics Endpoints

When running `nexphone-api`, you can verify active flavor configuration using:

- **Flavor Inspection**: `GET /api/flavor`
  ```json
  {
    "flavor": "dev",
    "isDev": true,
    "isStaging": false,
    "isProd": false,
    "appName": "NexPhone API (Dev)",
    "port": 4000,
    "corsOrigins": ["http://localhost:3000", "http://localhost:3001"]
  }
  ```
- **Health Check**: `GET /api/health`
- **Devices List**: `GET /api/devices`
- **Dashboard Metrics**: `GET /api/dashboard/metrics`

In **`nexphone-admin`**, the active flavor is prominently displayed in the top header as an interactive status pill (`DEV`, `STAGING`, `PROD`).
