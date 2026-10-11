import type { User } from "@/types/auth";
import type {
  AddressInput,
  ChangePasswordPayload,
  PasswordStrength,
  SavedAddress,
  UpdateProfilePayload,
} from "@/types/profile";

const addressKey = (userId: string) => `nexphone_addresses_v1_${userId}`;
const passwordChangedKey = (userId: string) => `nexphone_pw_changed_v1_${userId}`;

function readAddresses(userId: string): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(addressKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedAddress[]) : [];
  } catch {
    return [];
  }
}

function writeAddresses(userId: string, addresses: SavedAddress[]): SavedAddress[] {
  // Invariant: a non-empty list always has exactly one default address.
  let next = addresses;
  if (next.length > 0) {
    const defaultId = next.find((a) => a.isDefault)?.id ?? next[0]!.id;
    next = next.map((a) => ({ ...a, isDefault: a.id === defaultId }));
  }
  try {
    localStorage.setItem(addressKey(userId), JSON.stringify(next));
  } catch (e) {
    console.error("Failed to persist addresses", e);
  }
  return next;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = (checks.length ? passed : Math.min(passed, 1)) as PasswordStrength["score"];
  const labels: PasswordStrength["label"][] = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  return { score, label: labels[score]!, checks };
}

export const profileService = {
  async updateProfile(user: User, payload: UpdateProfilePayload): Promise<User> {
    const name = payload.name.trim();
    if (name.length < 2) throw new Error("Full name must be at least 2 characters.");
    const phone = payload.phone?.trim();
    if (phone && !/^[+\d\s().-]{6,}$/.test(phone)) {
      throw new Error("Please enter a valid phone number.");
    }
    return {
      ...user,
      name,
      phone: phone || undefined,
      company: payload.company?.trim() || undefined,
    };
  },

  async changePassword(
    userId: string,
    payload: ChangePasswordPayload
  ): Promise<{ success: boolean; message: string }> {
    if (!payload.currentPassword) throw new Error("Enter your current password.");
    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error("New password and confirmation do not match.");
    }
    if (payload.newPassword === payload.currentPassword) {
      throw new Error("New password must be different from the current one.");
    }
    if (evaluatePasswordStrength(payload.newPassword).score < 3) {
      throw new Error("Choose a stronger password (8+ chars, mixed case, number or symbol).");
    }
    try {
      localStorage.setItem(passwordChangedKey(userId), new Date().toISOString());
    } catch {
      // non-fatal
    }
    return { success: true, message: "Master credential updated successfully." };
  },

  getPasswordChangedAt(userId: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(passwordChangedKey(userId));
    } catch {
      return null;
    }
  },

  getAddresses(userId: string): SavedAddress[] {
    return readAddresses(userId);
  },

  addAddress(userId: string, input: AddressInput): SavedAddress[] {
    const current = readAddresses(userId);
    const created: SavedAddress = {
      ...input,
      id: `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      isDefault: Boolean(input.isDefault) || current.length === 0,
    };
    const base = created.isDefault ? current.map((a) => ({ ...a, isDefault: false })) : current;
    return writeAddresses(userId, [...base, created]);
  },

  updateAddress(userId: string, id: string, input: AddressInput): SavedAddress[] {
    const current = readAddresses(userId);
    const makeDefault = Boolean(input.isDefault);
    const next = current.map((a) => {
      if (a.id === id) return { ...a, ...input, isDefault: makeDefault || a.isDefault };
      return makeDefault ? { ...a, isDefault: false } : a;
    });
    return writeAddresses(userId, next);
  },

  deleteAddress(userId: string, id: string): SavedAddress[] {
    const remaining = readAddresses(userId).filter((a) => a.id !== id);
    return writeAddresses(userId, remaining);
  },

  setDefaultAddress(userId: string, id: string): SavedAddress[] {
    const next = readAddresses(userId).map((a) => ({ ...a, isDefault: a.id === id }));
    return writeAddresses(userId, next);
  },
};

export default profileService;
