import type {
  ComparisonProductCard,
  ComparisonSpecCategory,
  ComparisonSpecRow,
  PhoneComparisonResult,
} from "../models/comparison.model";

export function serializeProductCard(product: any): ComparisonProductCard {
  const p = typeof product?.toObject === "function" ? product.toObject() : product;
  const storageOptions = (p.storageOptions || []).map((s: any) => ({
    id: s.id || "",
    capacity: s.capacity || "",
    ram: s.ram || "",
    price: Number(s.price) || Number(p.basePrice) || 0,
    sku: s.sku || "",
    stock: Number(s.stock) || 0,
  }));

  const colors = (p.colors || []).map((c: any) => ({
    id: c.id || "",
    name: c.name || "",
    hex: c.hex || "",
    imageUrl: c.imageUrl,
  }));

  const startingStorage = storageOptions.length > 0 ? storageOptions[0].capacity : "128GB";
  const startingRam = storageOptions.length > 0 ? storageOptions[0].ram : "8GB";

  return {
    id: p.id || String(p._id),
    name: p.name || "",
    slug: p.slug || p.id,
    subtitle: p.subtitle || "",
    brand: p.brand || "",
    series: p.series || "",
    imageUrl: p.imageUrl || (p.images && p.images[0]) || "",
    basePrice: Number(p.basePrice) || 0,
    compareAtPrice: p.compareAtPrice !== undefined ? Number(p.compareAtPrice) : undefined,
    rating: Number(p.rating) || 5,
    reviewCount: Number(p.reviewCount) || 0,
    inStock: p.status !== "discontinued",
    colorsCount: colors.length,
    storageCount: storageOptions.length,
    startingStorage,
    startingRam,
    colors,
    storageOptions,
  };
}

interface SpecDefinition {
  categoryKey: string;
  categoryTitle: string;
  fields: Array<{
    key: string;
    label: string;
    extractor: (specs: any) => string;
  }>;
}

const SPEC_DEFINITIONS: SpecDefinition[] = [
  {
    categoryKey: "display",
    categoryTitle: "Display Architecture",
    fields: [
      { key: "display.size", label: "Screen Diagonal", extractor: (s) => s?.display?.size || "N/A" },
      { key: "display.resolution", label: "Resolution & PPI", extractor: (s) => s?.display?.resolution || "N/A" },
      { key: "display.panelType", label: "Panel Technology", extractor: (s) => s?.display?.panelType || "N/A" },
      { key: "display.refreshRate", label: "Refresh Rate", extractor: (s) => s?.display?.refreshRate || "N/A" },
      { key: "display.peakBrightness", label: "Peak Luminance", extractor: (s) => s?.display?.peakBrightness || "N/A" },
    ],
  },
  {
    categoryKey: "processor",
    categoryTitle: "Compute & NexCore AI",
    fields: [
      { key: "processor.chipset", label: "Core Chipset", extractor: (s) => s?.processor?.chipset || "N/A" },
      { key: "processor.cpu", label: "CPU Architecture", extractor: (s) => s?.processor?.cpu || "N/A" },
      { key: "processor.gpu", label: "Graphics Engine", extractor: (s) => s?.processor?.gpu || "N/A" },
      { key: "processor.neuralEngine", label: "Neural Engine NPU", extractor: (s) => s?.processor?.neuralEngine || "N/A" },
    ],
  },
  {
    categoryKey: "camera",
    categoryTitle: "Optical Matrix",
    fields: [
      { key: "camera.main", label: "Primary Sensor", extractor: (s) => s?.camera?.main || "N/A" },
      { key: "camera.ultraWide", label: "Ultra-Wide Matrix", extractor: (s) => s?.camera?.ultraWide || "N/A" },
      { key: "camera.telephoto", label: "Telephoto Periscope", extractor: (s) => s?.camera?.telephoto || "N/A" },
      { key: "camera.front", label: "Front TrueDepth Sensor", extractor: (s) => s?.camera?.front || "N/A" },
      { key: "camera.video", label: "Cinematic Video Capture", extractor: (s) => s?.camera?.video || "N/A" },
    ],
  },
  {
    categoryKey: "battery",
    categoryTitle: "Power & Thermal Architecture",
    fields: [
      { key: "battery.capacity", label: "Nominal Capacity", extractor: (s) => s?.battery?.capacity || "N/A" },
      { key: "battery.chargingSpeed", label: "Wired Fast Charging", extractor: (s) => s?.battery?.chargingSpeed || "N/A" },
      { key: "battery.wirelessCharging", label: "Wireless Inductive", extractor: (s) => s?.battery?.wirelessCharging || "N/A" },
      { key: "battery.batteryLife", label: "Screen-On Endurance", extractor: (s) => s?.battery?.batteryLife || "N/A" },
    ],
  },
  {
    categoryKey: "connectivity",
    categoryTitle: "Connectivity & Security",
    fields: [
      { key: "connectivity.cellular", label: "Cellular Bands", extractor: (s) => s?.connectivity?.cellular || "N/A" },
      { key: "connectivity.wifi", label: "Wi-Fi Protocol", extractor: (s) => s?.connectivity?.wifi || "N/A" },
      { key: "connectivity.bluetooth", label: "Bluetooth Subsystem", extractor: (s) => s?.connectivity?.bluetooth || "N/A" },
      { key: "connectivity.ports", label: "Hardware Port", extractor: (s) => s?.connectivity?.ports || "N/A" },
      { key: "connectivity.sim", label: "SIM Enclave", extractor: (s) => s?.connectivity?.sim || "N/A" },
    ],
  },
  {
    categoryKey: "dimensions",
    categoryTitle: "Chassis & Metallurgy",
    fields: [
      { key: "dimensions.height", label: "Height", extractor: (s) => s?.dimensions?.height || "N/A" },
      { key: "dimensions.width", label: "Width", extractor: (s) => s?.dimensions?.width || "N/A" },
      { key: "dimensions.thickness", label: "Thickness", extractor: (s) => s?.dimensions?.thickness || "N/A" },
      { key: "dimensions.weight", label: "Weight", extractor: (s) => s?.dimensions?.weight || "N/A" },
      { key: "dimensions.waterResistance", label: "Environmental Rating", extractor: (s) => s?.dimensions?.waterResistance || "N/A" },
    ],
  },
];

export function buildSpecificationMatrix(
  products: any[],
  highlightDifferences: boolean = false
): { categories: ComparisonSpecCategory[]; totalDifferences: number; differingFields: string[] } {
  const categories: ComparisonSpecCategory[] = [];
  const differingFields: string[] = [];

  for (const def of SPEC_DEFINITIONS) {
    const rows: ComparisonSpecRow[] = [];

    for (const field of def.fields) {
      const values: Record<string, string> = {};

      for (const p of products) {
        const prod = typeof p?.toObject === "function" ? p.toObject() : p;
        values[prod.id] = field.extractor(prod.specifications);
      }

      const valList = Object.values(values).map((v) => v.trim().toLowerCase());
      const firstVal = valList[0] || "";
      const isDifferent = valList.length > 1 && valList.some((v) => v !== firstVal);

      if (isDifferent) {
        differingFields.push(field.key);
      }

      if (!highlightDifferences || isDifferent) {
        rows.push({
          key: field.key,
          label: field.label,
          category: def.categoryKey,
          values,
          isDifferent,
        });
      }
    }

    if (rows.length > 0) {
      categories.push({
        categoryKey: def.categoryKey,
        categoryTitle: def.categoryTitle,
        rows,
      });
    }
  }

  return {
    categories,
    totalDifferences: differingFields.length,
    differingFields,
  };
}

export function serializePhoneComparison(
  products: any[],
  highlightDifferences: boolean = false
): PhoneComparisonResult {
  const serializedProducts = products.map(serializeProductCard);
  const { categories, totalDifferences, differingFields } = buildSpecificationMatrix(
    products,
    highlightDifferences
  );

  return {
    comparisonCount: serializedProducts.length,
    productIds: serializedProducts.map((p) => p.id),
    products: serializedProducts,
    totalDifferences,
    differingFields,
    specifications: categories,
  };
}
