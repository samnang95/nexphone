export interface AdminUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: "Super Administrator" | "Security Lead" | "DevOps Engineer" | "Fleet Operator";
  readonly avatarUrl?: string;
  readonly department: string;
  readonly lastLoginAt: string;
  readonly twoFactorEnabled: boolean;
  readonly apiKeyPreview: string;
  readonly phone?: string;
  readonly timezone: string;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}

export interface AuthState {
  readonly user: AdminUser | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
}
