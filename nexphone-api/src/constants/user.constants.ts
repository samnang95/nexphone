export const USER_ROLES = ["customer", "admin", "super_admin"] as const;
export const USER_TIERS = ["Regular", "Pro", "VIP", "Enterprise"] as const;
export const USER_STATUSES = ["active", "disabled"] as const;
export const ADDRESS_TYPES = ["home", "work", "other"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserTier = (typeof USER_TIERS)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type AddressType = (typeof ADDRESS_TYPES)[number];
