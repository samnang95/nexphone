export type ProductStatus = "published" | "draft" | "archived";

export type ProductSeries = "Pro Series" | "Enterprise" | "Lite" | "Foldable";

export interface ColorOption {
  readonly id: string;
  readonly name: string;
  readonly hex: string;
  readonly inStock: boolean;
  readonly imageUrl?: string;
}

export interface StorageVariant {
  readonly id: string;
  readonly capacity: string;
  readonly ram: string;
  readonly price: number;
  readonly comparePrice?: number;
  readonly stock: number;
  readonly sku: string;
}

export interface PhoneSpecifications {
  readonly display: {
    readonly size: string;
    readonly resolution: string;
    readonly panelType: string;
    readonly refreshRate: string;
    readonly peakBrightness: string;
  };
  readonly processor: {
    readonly chipset: string;
    readonly cpu: string;
    readonly gpu: string;
    readonly neuralEngine: string;
  };
  readonly camera: {
    readonly main: string;
    readonly ultrawide: string;
    readonly telephoto: string;
    readonly front: string;
    readonly features: readonly string[];
  };
  readonly battery: {
    readonly capacity: string;
    readonly wiredCharging: string;
    readonly wirelessCharging: string;
  };
  readonly connectivity: {
    readonly cellular: string;
    readonly wifi: string;
    readonly bluetooth: string;
    readonly ports: string;
    readonly sim: string;
  };
  readonly dimensions: {
    readonly height: string;
    readonly width: string;
    readonly thickness: string;
    readonly weight: string;
    readonly waterResistance: string;
  };
}

export interface Model3DAsset {
  readonly enabled: boolean;
  readonly modelUrl: string;
  readonly fileFormat: "glb" | "gltf" | "obj" | "usdz";
  readonly fileSize: string;
  readonly polygonCount: number;
  readonly autoRotate: boolean;
  readonly defaultColor: string;
  readonly wireframeSupported: boolean;
}

export interface PhoneProduct {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly subtitle: string;
  readonly series: ProductSeries;
  readonly status: ProductStatus;
  readonly basePrice: number;
  readonly compareAtPrice?: number;
  readonly costPrice?: number;
  readonly colors: readonly ColorOption[];
  readonly storageOptions: readonly StorageVariant[];
  readonly specifications: PhoneSpecifications;
  readonly model3D: Model3DAsset;
  readonly rating: number;
  readonly isFeatured?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductFilterState {
  readonly search: string;
  readonly series: ProductSeries | "all";
  readonly status: ProductStatus | "all";
  readonly sortBy: "price-asc" | "price-desc" | "name" | "recent";
}
