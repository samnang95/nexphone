export type AddressType = "home" | "work" | "other";

export interface SavedAddress {
  id: string;
  type: AddressType;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  instructions?: string;
  isDefault: boolean;
  createdAt: string;
}

export type AddressInput = Omit<SavedAddress, "id" | "createdAt" | "isDefault"> & {
  isDefault?: boolean;
};

export interface UpdateProfilePayload {
  name: string;
  phone?: string;
  company?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Weak" | "Fair" | "Strong" | "Excellent";
  checks: {
    length: boolean;
    upper: boolean;
    number: boolean;
    symbol: boolean;
  };
}
