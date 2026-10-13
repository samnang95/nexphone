import { homepageRepository } from "../repositories/homepage.repo";
import { HttpError } from "../utils/httpError";
import {
  serializeBanner,
  serializeFeaturedProduct,
  serializeSection,
  serializeHomepagePayload,
} from "../views/homepage.view";

export class HomepageService {
  // ==========================================
  // 1. Get Homepage Banners
  // ==========================================
  async getHomepageBanners(query: { status?: string; limit?: number } = {}) {
    const banners = await homepageRepository.getBanners(query);
    return banners.map(serializeBanner);
  }

  async getBannerById(id: string) {
    const banner = await homepageRepository.getBannerById(id);
    if (!banner) {
      throw HttpError.notFound(`Banner with ID "${id}" was not found.`);
    }
    return serializeBanner(banner);
  }

  // ==========================================
  // 2. Create Banner (Admin)
  // ==========================================
  async createBanner(data: any, _currentUser?: any) {
    if (!data.title || !data.title.trim()) {
      throw HttpError.badRequest("Banner title is required.");
    }
    const created = await homepageRepository.createBanner(data);
    return serializeBanner(created);
  }

  // ==========================================
  // 3. Update Banner (Admin)
  // ==========================================
  async updateBanner(id: string, updates: any, _currentUser?: any) {
    const updated = await homepageRepository.updateBanner(id, updates);
    if (!updated) {
      throw HttpError.notFound(`Banner with ID "${id}" was not found.`);
    }
    return serializeBanner(updated);
  }

  // ==========================================
  // 4. Delete Banner (Admin)
  // ==========================================
  async deleteBanner(id: string, _currentUser?: any) {
    const deleted = await homepageRepository.deleteBanner(id);
    if (!deleted) {
      throw HttpError.notFound(`Banner with ID "${id}" was not found.`);
    }
    return {
      message: "Banner deleted successfully",
      banner: serializeBanner(deleted),
    };
  }

  // ==========================================
  // 5. Get Featured Products
  // ==========================================
  async getFeaturedProducts(query: { status?: string; limit?: number; series?: string } = {}) {
    const items = await homepageRepository.getFeaturedProducts(query);
    return items.map(serializeFeaturedProduct);
  }

  async createFeaturedProduct(data: any, _currentUser?: any) {
    if (!data.productName) {
      throw HttpError.badRequest("Product name is required for featured card.");
    }
    const created = await homepageRepository.createFeaturedProduct(data);
    return serializeFeaturedProduct(created);
  }

  async updateFeaturedProduct(id: string, updates: any, _currentUser?: any) {
    const updated = await homepageRepository.updateFeaturedProduct(id, updates);
    if (!updated) {
      throw HttpError.notFound(`Featured phone entry with ID "${id}" was not found.`);
    }
    return serializeFeaturedProduct(updated);
  }

  async deleteFeaturedProduct(id: string, _currentUser?: any) {
    const deleted = await homepageRepository.deleteFeaturedProduct(id);
    if (!deleted) {
      throw HttpError.notFound(`Featured phone entry with ID "${id}" was not found.`);
    }
    return {
      message: "Featured phone removed successfully",
      item: serializeFeaturedProduct(deleted),
    };
  }

  // ==========================================
  // 6. Get Promotional Sections
  // ==========================================
  async getPromotionalSections(query: { status?: string } = {}) {
    const sections = await homepageRepository.getPromotionalSections(query);
    return sections.map(serializeSection);
  }

  async getPromotionalSectionById(id: string) {
    const section = await homepageRepository.getPromotionalSectionById(id);
    if (!section) {
      throw HttpError.notFound(`Promotional section "${id}" was not found.`);
    }
    return serializeSection(section);
  }

  // ==========================================
  // 7. Manage Homepage Sections (Admin)
  // ==========================================
  async createPromotionalSection(data: any, _currentUser?: any) {
    if (!data.sectionKey || !data.title) {
      throw HttpError.badRequest("Section key and title are required.");
    }
    const existing = await homepageRepository.getPromotionalSectionById(data.sectionKey);
    if (existing) {
      throw HttpError.conflict(`Section with key "${data.sectionKey}" already exists.`);
    }
    const created = await homepageRepository.createPromotionalSection(data);
    return serializeSection(created);
  }

  async updatePromotionalSection(id: string, updates: any, _currentUser?: any) {
    const updated = await homepageRepository.updatePromotionalSection(id, updates);
    if (!updated) {
      throw HttpError.notFound(`Promotional section "${id}" was not found.`);
    }
    return serializeSection(updated);
  }

  async deletePromotionalSection(id: string, _currentUser?: any) {
    const deleted = await homepageRepository.deletePromotionalSection(id);
    if (!deleted) {
      throw HttpError.notFound(`Promotional section "${id}" was not found.`);
    }
    return {
      message: "Promotional section deleted successfully",
      section: serializeSection(deleted),
    };
  }

  async reorderPromotionalSections(input: { sectionIds?: string[]; orders?: Array<{ id: string; displayOrder: number }> }, _currentUser?: any) {
    let ids: string[] = [];
    if (Array.isArray(input.sectionIds) && input.sectionIds.length > 0) {
      ids = input.sectionIds;
    } else if (Array.isArray(input.orders) && input.orders.length > 0) {
      const sorted = [...input.orders].sort((a, b) => a.displayOrder - b.displayOrder);
      ids = sorted.map((o) => o.id);
    } else {
      throw HttpError.badRequest("Either sectionIds array or orders array must be provided for reordering.");
    }

    const reordered = await homepageRepository.reorderSections(ids);
    return reordered.map(serializeSection);
  }

  // ==========================================
  // 8. Composite Homepage Payload
  // ==========================================
  async getHomepageOverview() {
    const [banners, featuredProducts, promotionalSections, newArrivals, bestSellers, metrics] = await Promise.all([
      homepageRepository.getBanners({ status: "active" }),
      homepageRepository.getFeaturedProducts({ status: "active" }),
      homepageRepository.getPromotionalSections({ status: "active" }),
      homepageRepository.getNewArrivals(),
      homepageRepository.getBestSellers(),
      homepageRepository.getMetrics(),
    ]);

    return serializeHomepagePayload({
      banners,
      featuredProducts,
      promotionalSections,
      newArrivals,
      bestSellers,
      metrics,
    });
  }

  async getContentMetrics() {
    return homepageRepository.getMetrics();
  }
}

export const homepageService = new HomepageService();
