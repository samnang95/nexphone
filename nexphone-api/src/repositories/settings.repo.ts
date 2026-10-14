import {
  SystemSettings,
  type SystemSettingsDocument,
  type StoreSettingsData,
  type ShippingSettingsData,
  type PaymentSettingsData,
} from "../models/settings.model";
import { isDatabaseConnected } from "../config/database";

export const defaultStoreSettings: StoreSettingsData = {
  storeName: "NexPhone Global Store",
  storeUrl: "https://nexphone.io",
  supportEmail: "support@nexphone.io",
  supportPhone: "+1 (800) 555-0199",
  currency: "USD",
  currencySymbol: "$",
  timezone: "America/Los_Angeles",
  taxRate: 8.5,
  taxInclusive: false,
  brandLogoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
  faviconUrl: "/favicon.ico",
  maintenanceMode: false,
  allowGuestCheckout: true,
  enableReviews: true,
  enableWishlist: true,
  enablePhoneComparison: true,
  enable3DViewer: true,
  inventoryLowStockThreshold: 15,
};

export const defaultShippingSettings: ShippingSettingsData = {
  defaultCarrier: "FedEx Priority",
  freeShippingThreshold: 500,
  standardShippingFee: 15,
  expressShippingFee: 35,
  overnightShippingFee: 60,
  estimatedDeliveryDays: {
    standard: "3-5 business days",
    express: "1-2 business days",
    overnight: "Next business day",
  },
  internationalShipping: {
    enabled: true,
    flatRate: 75,
    restrictedCountries: ["KP", "IR", "SY"],
  },
  pickupInStore: {
    enabled: true,
    locations: [
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
};

export const defaultPaymentSettings: PaymentSettingsData = {
  sandboxMode: true,
  defaultCurrency: "USD",
  supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "JPY"],
  autoCapture: true,
  fraudDetectionLevel: "high",
  gateways: {
    stripe: {
      enabled: true,
      publishableKey: "pk_test_51NxPhoneLiveTestKeyPublic001",
      secretKey: "sk_test_51NxPhoneSecretKeyVaultMaster001",
      webhookSecret: "whsec_nxLiveTestSignature98124",
    },
    applePay: {
      enabled: true,
      merchantId: "merchant.io.nexphone.store",
    },
    googlePay: {
      enabled: true,
      merchantId: "BCR2DN6TXE4901",
    },
    cod: {
      enabled: true,
      maxOrderLimit: 1500,
    },
    bankTransfer: {
      enabled: true,
      instructions: "Include order number in wire remittance reference.",
      accountName: "NexPhone Systems Inc.",
      accountNumber: "884109249120",
      routingNumber: "121000358",
      swiftBic: "NXPHUS6S",
    },
  },
};

// In-memory singleton state
export let inMemorySettings = {
  key: "default",
  store: { ...defaultStoreSettings },
  shipping: {
    ...defaultShippingSettings,
    estimatedDeliveryDays: { ...defaultShippingSettings.estimatedDeliveryDays },
    internationalShipping: {
      ...defaultShippingSettings.internationalShipping,
      restrictedCountries: [...defaultShippingSettings.internationalShipping.restrictedCountries],
    },
    pickupInStore: {
      ...defaultShippingSettings.pickupInStore,
      locations: [...defaultShippingSettings.pickupInStore.locations],
    },
  },
  payment: {
    ...defaultPaymentSettings,
    supportedCurrencies: [...defaultPaymentSettings.supportedCurrencies],
    gateways: {
      stripe: { ...defaultPaymentSettings.gateways.stripe },
      applePay: { ...defaultPaymentSettings.gateways.applePay },
      googlePay: { ...defaultPaymentSettings.gateways.googlePay },
      cod: { ...defaultPaymentSettings.gateways.cod },
      bankTransfer: { ...defaultPaymentSettings.gateways.bankTransfer },
    },
  },
  updatedAt: new Date(),
};

export class SettingsRepository {
  async getSettings(): Promise<SystemSettingsDocument | typeof inMemorySettings> {
    if (isDatabaseConnected()) {
      let doc = await SystemSettings.findOne({ key: "default" });
      if (!doc) {
        doc = new SystemSettings({
          key: "default",
          store: defaultStoreSettings,
          shipping: defaultShippingSettings,
          payment: defaultPaymentSettings,
        });
        await doc.save();
      }
      return doc;
    }

    return inMemorySettings;
  }

  async updateStoreSettings(updates: Partial<StoreSettingsData>): Promise<StoreSettingsData> {
    if (isDatabaseConnected()) {
      const doc = (await this.getSettings()) as SystemSettingsDocument;
      doc.store = { ...doc.store, ...updates };
      await doc.save();
      return doc.store;
    }

    inMemorySettings.store = { ...inMemorySettings.store, ...updates };
    inMemorySettings.updatedAt = new Date();
    return inMemorySettings.store;
  }

  async updateShippingSettings(updates: Partial<ShippingSettingsData>): Promise<ShippingSettingsData> {
    if (isDatabaseConnected()) {
      const doc = (await this.getSettings()) as SystemSettingsDocument;
      doc.shipping = {
        ...doc.shipping,
        ...updates,
        estimatedDeliveryDays: {
          ...doc.shipping.estimatedDeliveryDays,
          ...(updates.estimatedDeliveryDays || {}),
        },
        internationalShipping: {
          ...doc.shipping.internationalShipping,
          ...(updates.internationalShipping || {}),
        },
        pickupInStore: {
          ...doc.shipping.pickupInStore,
          ...(updates.pickupInStore || {}),
        },
      };
      await doc.save();
      return doc.shipping;
    }

    inMemorySettings.shipping = {
      ...inMemorySettings.shipping,
      ...updates,
      estimatedDeliveryDays: {
        ...inMemorySettings.shipping.estimatedDeliveryDays,
        ...(updates.estimatedDeliveryDays || {}),
      },
      internationalShipping: {
        ...inMemorySettings.shipping.internationalShipping,
        ...(updates.internationalShipping || {}),
      },
      pickupInStore: {
        ...inMemorySettings.shipping.pickupInStore,
        ...(updates.pickupInStore || {}),
      },
    };
    inMemorySettings.updatedAt = new Date();
    return inMemorySettings.shipping;
  }

  async updatePaymentSettings(updates: Partial<PaymentSettingsData>): Promise<PaymentSettingsData> {
    if (isDatabaseConnected()) {
      const doc = (await this.getSettings()) as SystemSettingsDocument;
      const currentGateways = doc.payment.gateways;
      const newGateways: any = updates.gateways || {};

      doc.payment = {
        ...doc.payment,
        ...updates,
        gateways: {
          stripe: { ...currentGateways.stripe, ...(newGateways.stripe || {}) },
          applePay: { ...currentGateways.applePay, ...(newGateways.applePay || {}) },
          googlePay: { ...currentGateways.googlePay, ...(newGateways.googlePay || {}) },
          cod: { ...currentGateways.cod, ...(newGateways.cod || {}) },
          bankTransfer: { ...currentGateways.bankTransfer, ...(newGateways.bankTransfer || {}) },
        },
      };
      await doc.save();
      return doc.payment;
    }

    const currentGateways = inMemorySettings.payment.gateways;
    const newGateways: any = updates.gateways || {};

    inMemorySettings.payment = {
      ...inMemorySettings.payment,
      ...updates,
      gateways: {
        stripe: { ...currentGateways.stripe, ...(newGateways.stripe || {}) },
        applePay: { ...currentGateways.applePay, ...(newGateways.applePay || {}) },
        googlePay: { ...currentGateways.googlePay, ...(newGateways.googlePay || {}) },
        cod: { ...currentGateways.cod, ...(newGateways.cod || {}) },
        bankTransfer: { ...currentGateways.bankTransfer, ...(newGateways.bankTransfer || {}) },
      },
    };
    inMemorySettings.updatedAt = new Date();
    return inMemorySettings.payment;
  }

  async resetToDefaults(): Promise<void> {
    if (isDatabaseConnected()) {
      await SystemSettings.findOneAndUpdate(
        { key: "default" },
        {
          $set: {
            store: defaultStoreSettings,
            shipping: defaultShippingSettings,
            payment: defaultPaymentSettings,
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    inMemorySettings = {
      key: "default",
      store: { ...defaultStoreSettings },
      shipping: {
        ...defaultShippingSettings,
        estimatedDeliveryDays: { ...defaultShippingSettings.estimatedDeliveryDays },
        internationalShipping: {
          ...defaultShippingSettings.internationalShipping,
          restrictedCountries: [...defaultShippingSettings.internationalShipping.restrictedCountries],
        },
        pickupInStore: {
          ...defaultShippingSettings.pickupInStore,
          locations: [...defaultShippingSettings.pickupInStore.locations],
        },
      },
      payment: {
        ...defaultPaymentSettings,
        supportedCurrencies: [...defaultPaymentSettings.supportedCurrencies],
        gateways: {
          stripe: { ...defaultPaymentSettings.gateways.stripe },
          applePay: { ...defaultPaymentSettings.gateways.applePay },
          googlePay: { ...defaultPaymentSettings.gateways.googlePay },
          cod: { ...defaultPaymentSettings.gateways.cod },
          bankTransfer: { ...defaultPaymentSettings.gateways.bankTransfer },
        },
      },
      updatedAt: new Date(),
    };
  }
}

export const settingsRepository = new SettingsRepository();
