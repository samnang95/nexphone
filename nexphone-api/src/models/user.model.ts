import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import {
  USER_ROLES,
  USER_TIERS,
  USER_STATUSES,
  ADDRESS_TYPES,
  type UserRole,
  type AddressType,
} from "../constants/user.constants";
export { USER_ROLES, USER_TIERS, USER_STATUSES, ADDRESS_TYPES, type UserRole, type AddressType };
export const addressSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ADDRESS_TYPES, default: "home" },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    recipient: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    street: { type: String, required: true, trim: true, maxlength: 200 },
    apartment: { type: String, trim: true, maxlength: 60 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    zipCode: { type: String, required: true, trim: true, maxlength: 20 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    instructions: { type: String, trim: true, maxlength: 500 },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export type AddressItem = InferSchemaType<typeof addressSchema>;
const userSchema = new Schema(
  {
    /** Human-friendly id shown in the admin UI. Only customers have one. */
    customerNumber: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 32 },
    /** Digits only, used for phone-number login lookups. */
    phoneNormalized: { type: String, index: true },
    company: { type: String, trim: true, maxlength: 120 },
    avatarUrl: { type: String, trim: true, maxlength: 2048 },

    passwordHash: { type: String, required: true, select: false },

    role: { type: String, enum: USER_ROLES, default: "customer", required: true },
    tier: { type: String, enum: USER_TIERS, default: "Regular" },
    status: { type: String, enum: USER_STATUSES, default: "active", required: true },
    disabledReason: String,
    disabledAt: Date,
    disabledBy: String,

    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    lastLoginIp: String,
    notes: String,

    addresses: { type: [addressSchema], default: [] },

    /** Incremented on password change/reset and account disable; tokens carry the value they were issued with. */
    tokenVersion: { type: Number, default: 0 },

    /** HMAC of the 6-digit recovery code (never the code itself). */
    passwordResetCodeHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    passwordResetAttempts: { type: Number, default: 0, select: false },

    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserAttrs>;

export const User = model("User", userSchema);
