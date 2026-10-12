import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["customer", "admin", "super_admin"] as const;
export const USER_TIERS = ["Regular", "Pro", "VIP", "Enterprise"] as const;
export const USER_STATUSES = ["active", "disabled"] as const;

export type UserRole = (typeof USER_ROLES)[number];

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
