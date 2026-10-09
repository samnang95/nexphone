export type CustomerTier = "VIP" | "Enterprise" | "Pro" | "Regular";

export interface User {
  id: string;
  customerNumber: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  tier: CustomerTier;
  status: "active" | "disabled";
  avatarUrl?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  accountType?: "consumer" | "enterprise";
  company?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
