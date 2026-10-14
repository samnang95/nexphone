import { z } from "zod";

export const updateStoreSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(100).optional(),
  storeUrl: z.string().trim().url().optional(),
  supportEmail: z.string().trim().email().optional(),
  supportPhone: z.string().trim().max(32).optional(),
  currency: z.string().trim().min(2).max(5).optional(),
  currencySymbol: z.string().trim().min(1).max(5).optional(),
  timezone: z.string().trim().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxInclusive: z.boolean().optional(),
  brandLogoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  allowGuestCheckout: z.boolean().optional(),
  enableReviews: z.boolean().optional(),
  enableWishlist: z.boolean().optional(),
  enablePhoneComparison: z.boolean().optional(),
  enable3DViewer: z.boolean().optional(),
  inventoryLowStockThreshold: z.number().int().min(1).max(1000).optional(),
});

export const updateShippingSettingsSchema = z.object({
  defaultCarrier: z.string().trim().min(2).max(100).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  standardShippingFee: z.number().min(0).optional(),
  expressShippingFee: z.number().min(0).optional(),
  overnightShippingFee: z.number().min(0).optional(),
  estimatedDeliveryDays: z
    .object({
      standard: z.string().optional(),
      express: z.string().optional(),
      overnight: z.string().optional(),
    })
    .optional(),
  internationalShipping: z
    .object({
      enabled: z.boolean().optional(),
      flatRate: z.number().min(0).optional(),
      restrictedCountries: z.array(z.string()).optional(),
    })
    .optional(),
  pickupInStore: z
    .object({
      enabled: z.boolean().optional(),
      locations: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            address: z.string(),
            city: z.string(),
            phone: z.string(),
            hours: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
});

export const updatePaymentSettingsSchema = z.object({
  sandboxMode: z.boolean().optional(),
  defaultCurrency: z.string().trim().min(2).max(5).optional(),
  supportedCurrencies: z.array(z.string().min(2).max(5)).optional(),
  autoCapture: z.boolean().optional(),
  fraudDetectionLevel: z.enum(["standard", "high", "strict"]).optional(),
  gateways: z
    .object({
      stripe: z
        .object({
          enabled: z.boolean().optional(),
          publishableKey: z.string().optional(),
          secretKey: z.string().optional(),
          webhookSecret: z.string().optional(),
        })
        .optional(),
      applePay: z
        .object({
          enabled: z.boolean().optional(),
          merchantId: z.string().optional(),
        })
        .optional(),
      googlePay: z
        .object({
          enabled: z.boolean().optional(),
          merchantId: z.string().optional(),
        })
        .optional(),
      cod: z
        .object({
          enabled: z.boolean().optional(),
          maxOrderLimit: z.number().min(0).optional(),
        })
        .optional(),
      bankTransfer: z
        .object({
          enabled: z.boolean().optional(),
          instructions: z.string().optional(),
          accountName: z.string().optional(),
          accountNumber: z.string().optional(),
          routingNumber: z.string().optional(),
          swiftBic: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});
