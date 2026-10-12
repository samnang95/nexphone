import { appConfig } from "@/app/config/env";
import type {
  LoginCredentials,
  RegisterPayload,
  AuthResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  User,
} from "@/types/auth";

const rawApiUrl = appConfig.apiUrl || "http://localhost:4000/api";
const API_BASE = rawApiUrl.replace(/\/api\/?$/, "");

const TOKEN_KEY = "nexphone_auth_token";
const USER_KEY = "nexphone_auth_user";

// Pre-seeded demo user accounts for instant test convenience
const DEMO_USERS: Record<string, User> = {
  "a.vance@blackmesa.io": {
    id: "cust-001",
    customerNumber: "CUST-8021",
    name: "Alex Vance",
    email: "a.vance@blackmesa.io",
    phone: "+1 (206) 555-0194",
    company: "Black Mesa Aerospace",
    tier: "VIP",
    status: "active",
    createdAt: "2026-04-12T03:24:23.779Z",
  },
  "s.tanaka@cyberdyne.co.jp": {
    id: "cust-002",
    customerNumber: "CUST-8022",
    name: "Sophia Tanaka",
    email: "s.tanaka@cyberdyne.co.jp",
    phone: "+81 3-5555-0182",
    company: "Cyberdyne Systems Tokyo",
    tier: "Enterprise",
    status: "active",
    createdAt: "2026-05-18T08:14:10.500Z",
  },
};

/**
 * `fetch` rejects with a TypeError when the server cannot be reached. API error responses
 * (401/400/409/...) are thrown as plain Errors and must reach the user, never trigger the
 * offline demo fallbacks below.
 */
function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

export const authService = {
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  },

  setStoredSession(token: string, user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also set standard session cookie for SSR compatibility
    document.cookie = `nexphone_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  },

  clearStoredSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = "nexphone_token=; path=/; max-age=0";
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      this.setStoredSession(data.token, data.user);
      return data;
    } catch (err: unknown) {
      if (!isNetworkError(err)) throw err;
      // Offline fallback: If backend cannot be reached, allow known demo accounts to log in seamlessly
      const emailLower = credentials.email.toLowerCase();
      if (DEMO_USERS[emailLower]) {
        const fallbackUser = DEMO_USERS[emailLower]!;
        const fallbackToken = `mock_token_${Date.now()}`;
        const fallbackResponse: AuthResponse = {
          token: fallbackToken,
          user: fallbackUser,
        };
        this.setStoredSession(fallbackToken, fallbackUser);
        return fallbackResponse;
      }
      throw err;
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please check the entered details.");
      }

      this.setStoredSession(data.token, data.user);
      return data;
    } catch (err: unknown) {
      if (!isNetworkError(err)) throw err;
      const mockId = `cust-${Date.now().toString(36)}`;
      const mockUser: User = {
        id: mockId,
        customerNumber: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name,
        email: payload.email.toLowerCase(),
        phone: payload.phone || "+1 (555) 000-0000",
        company: payload.company,
        tier: payload.accountType === "enterprise" ? "Enterprise" : "Regular",
        status: "active",
        createdAt: new Date().toISOString(),
      };
      const mockToken = `mock_reg_token_${Date.now()}`;
      this.setStoredSession(mockToken, mockUser);
      return { token: mockToken, user: mockUser };
    }
  },

  async logout(): Promise<void> {
    const token = this.getStoredToken();
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearStoredSession();
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch recovery code.");
      return data;
    } catch (err: unknown) {
      if (!isNetworkError(err)) throw err;
      throw new Error("Unable to reach the server. Please try again in a moment.");
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed. Invalid or expired code.");
      return data;
    } catch (err: unknown) {
      if (!isNetworkError(err)) throw err;
      throw new Error("Unable to reach the server. Your password was not changed. Please try again.");
    }
  },

  async getMe(): Promise<User | null> {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.setStoredSession(token, data.user);
          return data.user;
        }
      }
      if (res.status === 401 || res.status === 403) {
        // Token revoked, expired, or account suspended: do not keep showing a signed-in user.
        this.clearStoredSession();
        return null;
      }
    } catch {
      // Server unreachable: fall back to locally stored user
    }
    return this.getStoredUser();
  },
};
