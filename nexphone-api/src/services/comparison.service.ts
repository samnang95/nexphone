import { productRepository } from "../repositories/product.repo";
import {
  serializePhoneComparison,
  serializeProductCard,
  buildSpecificationMatrix,
} from "../views/comparison.view";
import type {
  ComparisonProductCard,
  PhoneComparisonResult,
  ComparisonSpecCategory,
} from "../models/comparison.model";
import { HttpError } from "../utils/httpError";

export const comparisonService = {
  async comparePhones(
    productIds: string[],
    highlightDifferences: boolean = false
  ): Promise<PhoneComparisonResult> {
    if (!Array.isArray(productIds) || productIds.length < 2) {
      throw HttpError.badRequest("Please select at least 2 phones to compare.");
    }
    if (productIds.length > 4) {
      throw HttpError.badRequest("A maximum of 4 phones can be compared at one time.");
    }

    const uniqueIds = Array.from(new Set(productIds));
    if (uniqueIds.length < 2) {
      throw HttpError.badRequest("Please select 2 distinct phones to compare.");
    }

    const products: any[] = [];
    for (const id of uniqueIds) {
      const product = await productRepository.findByIdOrSlug(id);
      if (!product) {
        throw HttpError.notFound(`Phone not found for comparison: "${id}"`);
      }
      products.push(product);
    }

    return serializePhoneComparison(products, highlightDifferences);
  },

  async getComparisonSpecifications(
    productIds: string[],
    highlightDifferences: boolean = false
  ): Promise<{
    comparisonCount: number;
    productIds: string[];
    totalDifferences: number;
    differingFields: string[];
    specifications: ComparisonSpecCategory[];
  }> {
    if (!Array.isArray(productIds) || productIds.length < 2) {
      throw HttpError.badRequest("Please select at least 2 phones to compare specifications.");
    }

    const uniqueIds = Array.from(new Set(productIds));
    if (uniqueIds.length < 2) {
      throw HttpError.badRequest("Please select at least 2 distinct phones to compare specifications.");
    }
    const products: any[] = [];
    for (const id of uniqueIds) {
      const product = await productRepository.findByIdOrSlug(id);
      if (!product) {
        throw HttpError.notFound(`Phone not found: "${id}"`);
      }
      products.push(product);
    }

    const matrix = buildSpecificationMatrix(products, highlightDifferences);
    return {
      comparisonCount: products.length,
      productIds: products.map((p) => p.id),
      totalDifferences: matrix.totalDifferences,
      differingFields: matrix.differingFields,
      specifications: matrix.categories,
    };
  },

  async getComparisonData(
    productIds?: string[]
  ): Promise<{ count: number; phones: ComparisonProductCard[] }> {
    if (productIds && productIds.length > 0) {
      const uniqueIds = Array.from(new Set(productIds));
      const phones: ComparisonProductCard[] = [];

      for (const id of uniqueIds) {
        const product = await productRepository.findByIdOrSlug(id);
        if (product) {
          phones.push(serializeProductCard(product));
        }
      }

      return {
        count: phones.length,
        phones,
      };
    }
    const { products } = await productRepository.find({ status: "published" }, "featured", { page: 1, limit: 50 });
    const phones = products.map(serializeProductCard);
    return {
      count: phones.length,
      phones,
    };
  },
};
