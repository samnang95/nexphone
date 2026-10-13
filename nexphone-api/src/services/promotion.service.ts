import { promotionRepository, type PromotionQueryFilters } from "../repositories/promotion.repo";
import {
  serializePromotion,
  serializePublicPromotion,
  type PublicPromotionView,
  type CouponValidationView,
} from "../views/promotion.view";
import { cartRepository } from "../repositories/cart.repo";
import { cartService } from "./cart.service";
import { HttpError } from "../utils/httpError";
import type {
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
  ApplyCouponInput,
  QueryPromotionInput,
} from "../validators/promotion.validator";

export const promotionService = {
  /**
   * 1. Get Active Promotions (Consumer Storefront)
   */
  async getActivePromotions(): Promise<PublicPromotionView[]> {
    const activeList = await promotionRepository.findActive();
    return activeList.map(serializePublicPromotion);
  },

  /**
   * 2. Get Promotion Details (by ID or Code)
   */
  async getPromotionDetails(idOrCode: string, currentUser?: any): Promise<any> {
    const promo = await promotionRepository.findByIdOrCode(idOrCode);
    if (!promo) {
      throw HttpError.notFound(`Promotion not found: "${idOrCode}"`);
    }
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    return serializePromotion(promo, { isAdmin });
  },

  /**
   * 3. Validate Coupon
   */
  async validateCoupon(input: ValidateCouponInput): Promise<CouponValidationView> {
    const cleanCode = input.code.trim().toUpperCase();
    const now = new Date().toISOString();
    const cartTotal = Number(input.cartTotal) || 0;

    const promo = await promotionRepository.findByCode(cleanCode);
    if (!promo) {
      // Check if it's one of the cart system standard fallback codes (e.g. NEX10, TITANIUM100)
      const fallbackPromo = cartService.resolvePromoCode(cleanCode);
      if (fallbackPromo) {
        let discountAmount = 0;
        if (fallbackPromo.type === "percentage") {
          discountAmount = (cartTotal * fallbackPromo.amount) / 100;
        } else if (fallbackPromo.type === "fixed") {
          discountAmount = Math.min(fallbackPromo.amount, cartTotal);
        }

        return {
          valid: true,
          code: cleanCode,
          discountType: fallbackPromo.type,
          discountValue: fallbackPromo.amount,
          discountAmount: Math.round(discountAmount * 100) / 100,
          cartTotal,
          finalTotal: Math.max(0, Math.round((cartTotal - discountAmount) * 100) / 100),
          message: `${fallbackPromo.label} is valid!`,
        };
      }

      throw HttpError.notFound(`Coupon code "${cleanCode}" does not exist.`);
    }

    if (promo.status !== "active") {
      throw HttpError.badRequest(`Coupon "${cleanCode}" is currently ${promo.status} and cannot be used.`);
    }

    if (promo.startDate && promo.startDate > now) {
      throw HttpError.badRequest(`Coupon "${cleanCode}" is scheduled and will become active on ${new Date(promo.startDate).toLocaleDateString()}.`);
    }

    if (promo.endDate && promo.endDate < now) {
      throw HttpError.badRequest(`Coupon "${cleanCode}" has expired.`);
    }

    if (promo.usageLimit !== null && promo.usageLimit !== undefined && promo.usedCount >= promo.usageLimit) {
      throw HttpError.badRequest(`Coupon "${cleanCode}" has reached its maximum total redemption limit.`);
    }

    if (promo.minOrderValue && cartTotal < promo.minOrderValue) {
      throw HttpError.badRequest(
        `Coupon "${cleanCode}" requires a minimum order subtotal of $${promo.minOrderValue}. Current cart subtotal is $${cartTotal}.`
      );
    }

    // Compute applicable discount amount
    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = (cartTotal * promo.discountValue) / 100;
      if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
        discountAmount = promo.maxDiscountAmount;
      }
    } else if (promo.discountType === "fixed_amount") {
      discountAmount = Math.min(promo.discountValue, cartTotal);
    } else if (promo.discountType === "free_shipping") {
      discountAmount = 35; // Standard shipping waiver value
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalTotal = Math.max(0, Math.round((cartTotal - discountAmount) * 100) / 100);

    return {
      valid: true,
      code: promo.code || cleanCode,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      cartTotal,
      finalTotal,
      minOrderValue: promo.minOrderValue,
      maxDiscountAmount: promo.maxDiscountAmount,
      message: `Coupon "${cleanCode}" applied successfully: ${promo.title}`,
      promotion: {
        id: promo.id,
        title: promo.title,
        description: promo.description,
        bannerColor: promo.bannerColor || "indigo",
      },
    };
  },

  /**
   * 4. Apply Coupon (Applies to cart and records usage stats)
   */
  async applyCoupon(
    input: ApplyCouponInput,
    context: { userId?: string; sessionId?: string } = {}
  ): Promise<any> {
    const cleanCode = input.code.trim().toUpperCase();

    // 1. Fetch current cart if user/session provided
    let cartTotal = Number(input.cartTotal) || 0;
    let existingCart: any = null;
    const hasSessionOrUser = Boolean(context.userId || context.sessionId);

    if (hasSessionOrUser) {
      existingCart = await cartRepository.findCart(context.userId, context.sessionId);
      if (existingCart && Array.isArray(existingCart.items) && existingCart.items.length > 0) {
        cartTotal = existingCart.items.reduce(
          (sum: number, item: any) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
          0
        );
      }
    }

    // 2. Validate coupon rules against cart subtotal
    const validation = await this.validateCoupon({
      code: cleanCode,
      cartTotal,
      items: input.items,
    });

    // 3. Apply to cart in database / session store if active cart present
    let updatedCart: any = null;
    if (hasSessionOrUser && existingCart) {
      updatedCart = await cartService.applyPromoCode(cleanCode, context.userId, context.sessionId);
    }

    // 4. Increment usage metrics for promotional tracking
    const promo = await promotionRepository.findByCode(cleanCode);
    if (promo) {
      await promotionRepository.incrementUsage(promo.id, cartTotal, validation.discountAmount);
    }

    return {
      success: true,
      applied: true,
      code: validation.code,
      discountType: validation.discountType,
      discountValue: validation.discountValue,
      discountAmount: validation.discountAmount,
      subtotal: cartTotal,
      finalTotal: validation.finalTotal,
      message: validation.message,
      cart: updatedCart,
    };
  },

  /**
   * 5. Create Coupon (Admin)
   */
  async createCoupon(input: CreateCouponInput, _currentUser?: any): Promise<any> {
    let formattedCode: string | undefined = undefined;

    if (input.type === "promo_code" || input.code) {
      formattedCode = (input.code || `NEX-${Math.random().toString(36).substring(2, 7)}`).trim().toUpperCase();
      const existing = await promotionRepository.findByCode(formattedCode);
      if (existing) {
        throw HttpError.conflict(`Promo code "${formattedCode}" already exists. Please choose a unique code.`);
      }
    }

    const created = await promotionRepository.create({
      ...input,
      code: formattedCode,
    });

    return serializePromotion(created, { isAdmin: true });
  },

  /**
   * 6. Update Coupon (Admin)
   */
  async updateCoupon(id: string, input: UpdateCouponInput, _currentUser?: any): Promise<any> {
    const existing = await promotionRepository.findByIdOrCode(id);
    if (!existing) {
      throw HttpError.notFound(`Promotion not found: "${id}"`);
    }

    if (input.code && input.code.trim().toUpperCase() !== existing.code) {
      const newCode = input.code.trim().toUpperCase();
      const duplicate = await promotionRepository.findByCode(newCode);
      if (duplicate && duplicate.id !== existing.id) {
        throw HttpError.conflict(`Promo code "${newCode}" already in use by another promotion.`);
      }
    }

    const updated = await promotionRepository.update(existing.id, input);
    return serializePromotion(updated, { isAdmin: true });
  },

  /**
   * 7. Delete Coupon (Admin)
   */
  async deleteCoupon(id: string, _currentUser?: any): Promise<any> {
    const existing = await promotionRepository.findByIdOrCode(id);
    if (!existing) {
      throw HttpError.notFound(`Promotion not found: "${id}"`);
    }

    const deleted = await promotionRepository.delete(existing.id);
    return {
      message: "Promotion removed successfully",
      promotion: serializePromotion(deleted, { isAdmin: true }),
    };
  },

  /**
   * Query all promotions (Admin or public listing with filters)
   */
  async getAllPromotions(query: QueryPromotionInput, currentUser?: any): Promise<any> {
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    const filters: PromotionQueryFilters = {
      status: query.status,
      type: query.type,
      scope: query.scope,
      search: query.search,
    };

    const pagination = query.page && query.limit ? { page: query.page, limit: query.limit } : undefined;
    const { promotions, total } = await promotionRepository.find(filters, query.sortBy || "recent", pagination);

    return {
      promotions: promotions.map((p) => serializePromotion(p, { isAdmin })),
      total,
      page: query.page || 1,
      limit: query.limit || total,
    };
  },

  /**
   * Toggle promotion status (active, scheduled, expired, disabled)
   */
  async toggleStatus(id: string, status: string, _currentUser?: any): Promise<any> {
    const existing = await promotionRepository.findByIdOrCode(id);
    if (!existing) {
      throw HttpError.notFound(`Promotion not found: "${id}"`);
    }

    if (!["active", "scheduled", "expired", "disabled"].includes(status)) {
      throw HttpError.badRequest("Invalid status value");
    }

    const updated = await promotionRepository.update(existing.id, { status: status as any });
    return serializePromotion(updated, { isAdmin: true });
  },

  /**
   * Analytics Metrics
   */
  async getMetrics(): Promise<any> {
    return promotionRepository.getMetrics();
  },
};
