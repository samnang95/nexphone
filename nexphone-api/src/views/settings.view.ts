import type {
  StoreSettingsData,
  ShippingSettingsData,
  PaymentSettingsData,
} from "../models/settings.model";

function maskSecretKey(key?: string): string {
  if (!key) return "not_configured";
  if (key.length <= 8) return "••••••••";
  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

function maskAccountNumber(account?: string): string {
  if (!account) return "not_configured";
  if (account.length <= 4) return "••••";
  return `••••••••${account.slice(-4)}`;
}

export function serializeStoreSettings(store: StoreSettingsData, _isAdmin = false) {
  return {
    success: true,
    store,
    ...store,
  };
}

export function serializeShippingSettings(shipping: ShippingSettingsData) {
  return {
    success: true,
    shipping,
    ...shipping,
  };
}

export function serializePaymentSettings(payment: PaymentSettingsData, isAdmin = false) {
  if (!isAdmin) {
    // Public/Storefront view: only exposed gateways and public keys
    const availableGateways = Object.entries(payment.gateways)
      .filter(([_, gw]) => gw.enabled)
      .map(([name]) => name);

    return {
      success: true,
      sandboxMode: payment.sandboxMode,
      defaultCurrency: payment.defaultCurrency,
      supportedCurrencies: payment.supportedCurrencies,
      availableGateways,
      gateways: {
        stripe: {
          enabled: payment.gateways.stripe.enabled,
          publishableKey: payment.gateways.stripe.publishableKey,
        },
        applePay: {
          enabled: payment.gateways.applePay.enabled,
          merchantId: payment.gateways.applePay.merchantId,
        },
        googlePay: {
          enabled: payment.gateways.googlePay.enabled,
          merchantId: payment.gateways.googlePay.merchantId,
        },
        cod: {
          enabled: payment.gateways.cod.enabled,
          maxOrderLimit: payment.gateways.cod.maxOrderLimit,
        },
        bankTransfer: {
          enabled: payment.gateways.bankTransfer.enabled,
          instructions: payment.gateways.bankTransfer.instructions,
          accountName: payment.gateways.bankTransfer.accountName,
        },
      },
    };
  }

  // Admin view: include masked secret keys and webhook configuration indicators
  return {
    success: true,
    sandboxMode: payment.sandboxMode,
    defaultCurrency: payment.defaultCurrency,
    supportedCurrencies: payment.supportedCurrencies,
    autoCapture: payment.autoCapture,
    fraudDetectionLevel: payment.fraudDetectionLevel,
    gateways: {
      stripe: {
        enabled: payment.gateways.stripe.enabled,
        publishableKey: payment.gateways.stripe.publishableKey,
        secretKeyMasked: maskSecretKey(payment.gateways.stripe.secretKey),
        webhookSecretConfigured: Boolean(payment.gateways.stripe.webhookSecret),
      },
      applePay: {
        enabled: payment.gateways.applePay.enabled,
        merchantId: payment.gateways.applePay.merchantId,
      },
      googlePay: {
        enabled: payment.gateways.googlePay.enabled,
        merchantId: payment.gateways.googlePay.merchantId,
      },
      cod: {
        enabled: payment.gateways.cod.enabled,
        maxOrderLimit: payment.gateways.cod.maxOrderLimit,
      },
      bankTransfer: {
        enabled: payment.gateways.bankTransfer.enabled,
        instructions: payment.gateways.bankTransfer.instructions,
        accountName: payment.gateways.bankTransfer.accountName,
        accountNumberMasked: maskAccountNumber(payment.gateways.bankTransfer.accountNumber),
        routingNumber: payment.gateways.bankTransfer.routingNumber || null,
        swiftBic: payment.gateways.bankTransfer.swiftBic || null,
      },
    },
  };
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export function serializeHealthCheck(data: {
  flavor: string;
  uptimeSeconds: number;
  databaseConnected: boolean;
  readyState: number;
  cloudinaryConfigured: boolean;
}) {
  const mem = process.memoryUsage();
  const toMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return {
    status: data.databaseConnected || data.flavor === "dev" ? "ok" : "degraded",
    flavor: data.flavor,
    version: "1.0.0",
    uptimeSeconds: Math.floor(data.uptimeSeconds),
    formattedUptime: formatUptime(data.uptimeSeconds),
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: data.databaseConnected ? "connected" : "standalone",
        readyState: data.readyState,
      },
      memory: {
        heapUsed: toMB(mem.heapUsed),
        heapTotal: toMB(mem.heapTotal),
        rss: toMB(mem.rss),
      },
      storage: {
        cloudinaryConfigured: data.cloudinaryConfigured,
      },
    },
  };
}
