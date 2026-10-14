import mongoose, { Schema, Document, Model } from "mongoose";

export interface StoreSettingsData {
  storeName: string;
  storeUrl: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  taxRate: number; // percentage e.g. 8.5
  taxInclusive: boolean;
  brandLogoUrl?: string;
  faviconUrl?: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enablePhoneComparison: boolean;
  enable3DViewer: boolean;
  inventoryLowStockThreshold: number;
}

export interface ShippingSettingsData {
  defaultCarrier: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  overnightShippingFee: number;
  estimatedDeliveryDays: {
    standard: string;
    express: string;
    overnight: string;
  };
  internationalShipping: {
    enabled: boolean;
    flatRate: number;
    restrictedCountries: string[];
  };
  pickupInStore: {
    enabled: boolean;
    locations: Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      phone: string;
      hours: string;
    }>;
  };
}

export interface PaymentGatewayStripe {
  enabled: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
}

export interface PaymentGatewayDigitalWallet {
  enabled: boolean;
  merchantId: string;
}

export interface PaymentGatewayCod {
  enabled: boolean;
  maxOrderLimit: number;
}

export interface PaymentGatewayBankTransfer {
  enabled: boolean;
  instructions: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftBic?: string;
}

export interface PaymentSettingsData {
  sandboxMode: boolean;
  defaultCurrency: string;
  supportedCurrencies: string[];
  autoCapture: boolean;
  fraudDetectionLevel: "standard" | "high" | "strict";
  gateways: {
    stripe: PaymentGatewayStripe;
    applePay: PaymentGatewayDigitalWallet;
    googlePay: PaymentGatewayDigitalWallet;
    cod: PaymentGatewayCod;
    bankTransfer: PaymentGatewayBankTransfer;
  };
}

export interface SystemSettingsDocument extends Document {
  key: string;
  store: StoreSettingsData;
  shipping: ShippingSettingsData;
  payment: PaymentSettingsData;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<SystemSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    store: {
      storeName: { type: String, default: "NexPhone Global Store" },
      storeUrl: { type: String, default: "https://nexphone.io" },
      supportEmail: { type: String, default: "support@nexphone.io" },
      supportPhone: { type: String, default: "+1 (800) 555-0199" },
      currency: { type: String, default: "USD" },
      currencySymbol: { type: String, default: "$" },
      timezone: { type: String, default: "America/Los_Angeles" },
      taxRate: { type: Number, default: 8.5 },
      taxInclusive: { type: Boolean, default: false },
      brandLogoUrl: { type: String, default: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
      faviconUrl: { type: String, default: "/favicon.ico" },
      maintenanceMode: { type: Boolean, default: false },
      allowGuestCheckout: { type: Boolean, default: true },
      enableReviews: { type: Boolean, default: true },
      enableWishlist: { type: Boolean, default: true },
      enablePhoneComparison: { type: Boolean, default: true },
      enable3DViewer: { type: Boolean, default: true },
      inventoryLowStockThreshold: { type: Number, default: 15 },
    },
    shipping: {
      defaultCarrier: { type: String, default: "FedEx Priority" },
      freeShippingThreshold: { type: Number, default: 500 },
      standardShippingFee: { type: Number, default: 15 },
      expressShippingFee: { type: Number, default: 35 },
      overnightShippingFee: { type: Number, default: 60 },
      estimatedDeliveryDays: {
        standard: { type: String, default: "3-5 business days" },
        express: { type: String, default: "1-2 business days" },
        overnight: { type: String, default: "Next business day" },
      },
      internationalShipping: {
        enabled: { type: Boolean, default: true },
        flatRate: { type: Number, default: 75 },
        restrictedCountries: { type: [String], default: ["KP", "IR", "SY"] },
      },
      pickupInStore: {
        enabled: { type: Boolean, default: true },
        locations: {
          type: [
            {
              id: { type: String, required: true },
              name: { type: String, required: true },
              address: { type: String, required: true },
              city: { type: String, required: true },
              phone: { type: String, required: true },
              hours: { type: String, default: "Mon-Sat: 10:00 - 20:00" },
            },
          ],
          default: [
            {
              id: "loc-01",
              name: "NexPhone Flagship Store (Union Square)",
              address: "350 Post St",
              city: "San Francisco, CA",
              phone: "+1 (415) 555-0199",
              hours: "Mon-Sat: 10:00 - 20:00, Sun: 11:00 - 18:00",
            },
            {
              id: "loc-02",
              name: "NexPhone Experience Center (Fifth Ave)",
              address: "767 5th Ave",
              city: "New York, NY",
              phone: "+1 (212) 555-0144",
              hours: "Mon-Sat: 10:00 - 21:00, Sun: 10:00 - 19:00",
            },
          ],
        },
      },
    },
    payment: {
      sandboxMode: { type: Boolean, default: true },
      defaultCurrency: { type: String, default: "USD" },
      supportedCurrencies: { type: [String], default: ["USD", "EUR", "GBP", "CAD", "JPY"] },
      autoCapture: { type: Boolean, default: true },
      fraudDetectionLevel: { type: String, enum: ["standard", "high", "strict"], default: "high" },
      gateways: {
        stripe: {
          enabled: { type: Boolean, default: true },
          publishableKey: { type: String, default: "pk_test_51NxPhoneLiveTestKeyPublic001" },
          secretKey: { type: String, default: "sk_test_51NxPhoneSecretKeyVaultMaster001" },
          webhookSecret: { type: String, default: "whsec_nxLiveTestSignature98124" },
        },
        applePay: {
          enabled: { type: Boolean, default: true },
          merchantId: { type: String, default: "merchant.io.nexphone.store" },
        },
        googlePay: {
          enabled: { type: Boolean, default: true },
          merchantId: { type: String, default: "BCR2DN6TXE4901" },
        },
        cod: {
          enabled: { type: Boolean, default: true },
          maxOrderLimit: { type: Number, default: 1500 },
        },
        bankTransfer: {
          enabled: { type: Boolean, default: true },
          instructions: { type: String, default: "Include order number in wire remittance reference." },
          accountName: { type: String, default: "NexPhone Systems Inc." },
          accountNumber: { type: String, default: "884109249120" },
          routingNumber: { type: String, default: "121000358" },
          swiftBic: { type: String, default: "NXPHUS6S" },
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSettings: Model<SystemSettingsDocument> =
  mongoose.models.SystemSettings ||
  mongoose.model<SystemSettingsDocument>("SystemSettings", SystemSettingsSchema);
