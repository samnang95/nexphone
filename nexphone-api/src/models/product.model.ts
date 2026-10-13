import mongoose, { Schema, Document, Model } from "mongoose";

export type ProductStatus = "published" | "draft" | "archived";
export type ProductSeries = "Pro Series" | "Enterprise" | "Lite" | "Foldable" | string;

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
  imageUrl?: string;
}

export interface StorageVariant {
  id: string;
  capacity: string;
  ram: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
}

export interface PhoneSpecifications {
  display: {
    size: string;
    resolution: string;
    panelType: string;
    refreshRate: string;
    peakBrightness: string;
  };
  processor: {
    chipset: string;
    cpu: string;
    gpu: string;
    neuralEngine: string;
  };
  camera: {
    main: string;
    ultrawide: string;
    telephoto: string;
    front: string;
    features: string[];
  };
  battery: {
    capacity: string;
    wiredCharging: string;
    wirelessCharging: string;
  };
  connectivity: {
    cellular: string;
    wifi: string;
    bluetooth: string;
    ports: string;
    sim: string;
  };
  dimensions: {
    height: string;
    width: string;
    thickness: string;
    weight: string;
    waterResistance: string;
  };
}

export interface Model3DAsset {
  enabled: boolean;
  modelUrl: string;
  fileFormat: "glb" | "gltf" | "obj" | "usdz";
  fileSize: string;
  polygonCount: number;
  autoRotate: boolean;
  defaultColor: string;
  wireframeSupported: boolean;
}

export interface ProductDocument extends Document {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  series: ProductSeries;
  brand: string;
  status: ProductStatus;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  imageUrl?: string;
  images: string[];
  colors: ColorOption[];
  storageOptions: StorageVariant[];
  specifications: PhoneSpecifications;
  model3D?: Model3DAsset;
  createdAt: Date;
  updatedAt: Date;
}

const ColorOptionSchema = new Schema<ColorOption>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    hex: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const StorageVariantSchema = new Schema<StorageVariant>(
  {
    id: { type: String, required: true },
    capacity: { type: String, required: true },
    ram: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true },
  },
  { _id: false }
);

const SpecificationsSchema = new Schema(
  {
    display: {
      size: { type: String, default: "" },
      resolution: { type: String, default: "" },
      panelType: { type: String, default: "" },
      refreshRate: { type: String, default: "" },
      peakBrightness: { type: String, default: "" },
    },
    processor: {
      chipset: { type: String, default: "" },
      cpu: { type: String, default: "" },
      gpu: { type: String, default: "" },
      neuralEngine: { type: String, default: "" },
    },
    camera: {
      main: { type: String, default: "" },
      ultrawide: { type: String, default: "" },
      telephoto: { type: String, default: "" },
      front: { type: String, default: "" },
      features: { type: [String], default: [] },
    },
    battery: {
      capacity: { type: String, default: "" },
      wiredCharging: { type: String, default: "" },
      wirelessCharging: { type: String, default: "" },
    },
    connectivity: {
      cellular: { type: String, default: "" },
      wifi: { type: String, default: "" },
      bluetooth: { type: String, default: "" },
      ports: { type: String, default: "" },
      sim: { type: String, default: "" },
    },
    dimensions: {
      height: { type: String, default: "" },
      width: { type: String, default: "" },
      thickness: { type: String, default: "" },
      weight: { type: String, default: "" },
      waterResistance: { type: String, default: "" },
    },
  },
  { _id: false }
);

const Model3DAssetSchema = new Schema<Model3DAsset>(
  {
    enabled: { type: Boolean, default: false },
    modelUrl: { type: String, default: "" },
    fileFormat: { type: String, enum: ["glb", "gltf", "obj", "usdz"], default: "glb" },
    fileSize: { type: String, default: "" },
    polygonCount: { type: Number, default: 0 },
    autoRotate: { type: Boolean, default: false },
    defaultColor: { type: String, default: "#000000" },
    wireframeSupported: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new Schema<ProductDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    series: { type: String, required: true, index: true },
    brand: { type: String, default: "NexPhone", index: true },
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
      index: true,
    },
    basePrice: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0, min: 0 },
    salesCount: { type: Number, default: 0, min: 0, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    imageUrl: { type: String },
    images: { type: [String], default: [] },
    colors: { type: [ColorOptionSchema], default: [] },
    storageOptions: { type: [StorageVariantSchema], default: [] },
    specifications: { type: SpecificationsSchema, default: () => ({}) },
    model3D: { type: Model3DAssetSchema },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ProductSchema.index({
  name: "text",
  subtitle: "text",
  series: "text",
  brand: "text",
});

export const Product: Model<ProductDocument> = mongoose.models.Product || mongoose.model<ProductDocument>("Product", ProductSchema);