import mongoose from "mongoose";
import { config } from "../config/env";
import { isDatabaseConnected } from "../config/database";
import { isCloudinaryConfigured } from "../config/cloudinary";
import { settingsRepository } from "../repositories/settings.repo";
import type {
  StoreSettingsData,
  ShippingSettingsData,
  PaymentSettingsData,
} from "../models/settings.model";
import {
  serializeStoreSettings,
  serializeShippingSettings,
  serializePaymentSettings,
  serializeHealthCheck,
} from "../views/settings.view";

export class SettingsService {
  // ==========================================
  // 1. Store Settings
  // ==========================================
  async getStoreSettings(isAdmin = false) {
    const doc = await settingsRepository.getSettings();
    return serializeStoreSettings(doc.store, isAdmin);
  }

  async updateStoreSettings(updates: Partial<StoreSettingsData>, _currentUser?: any) {
    const updated = await settingsRepository.updateStoreSettings(updates);
    return {
      ...serializeStoreSettings(updated, true),
      message: "Store settings updated successfully.",
    };
  }

  // ==========================================
  // 2. Shipping Settings
  // ==========================================
  async getShippingSettings() {
    const doc = await settingsRepository.getSettings();
    return serializeShippingSettings(doc.shipping);
  }

  async updateShippingSettings(updates: Partial<ShippingSettingsData>, _currentUser?: any) {
    const updated = await settingsRepository.updateShippingSettings(updates);
    return {
      ...serializeShippingSettings(updated),
      message: "Shipping settings configured successfully.",
    };
  }

  // ==========================================
  // 3. Payment Settings
  // ==========================================
  async getPaymentSettings(isAdmin = false) {
    const doc = await settingsRepository.getSettings();
    return serializePaymentSettings(doc.payment, isAdmin);
  }

  async updatePaymentSettings(updates: Partial<PaymentSettingsData>, _currentUser?: any) {
    const updated = await settingsRepository.updatePaymentSettings(updates);
    return {
      ...serializePaymentSettings(updated, true),
      message: "Payment settings configured successfully.",
    };
  }

  // ==========================================
  // 4. System Health Check
  // ==========================================
  getHealthCheck() {
    const dbConnected = isDatabaseConnected();
    const readyState = mongoose.connection.readyState;
    const uptime = process.uptime();
    const cloudinaryConfigured = isCloudinaryConfigured();

    return serializeHealthCheck({
      flavor: config.flavor,
      uptimeSeconds: uptime,
      databaseConnected: dbConnected,
      readyState,
      cloudinaryConfigured,
    });
  }
}

export const settingsService = new SettingsService();
