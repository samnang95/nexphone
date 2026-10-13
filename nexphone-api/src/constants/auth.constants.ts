export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid credentials. Please verify your email and password.",
  RESET_INVALID_CODE: "The recovery code is invalid, expired, or was already used.",
  RESET_TOO_MANY_ATTEMPTS: "Too many invalid reset attempts. Please request a new code.",
  ACCOUNT_DISABLED: "This account has been suspended.",
  TOKEN_REQUIRED: "Authentication token required.",
  TOKEN_INVALID: "Invalid or expired session token.",
  PASSWORD_CHANGED: "Password changed successfully. Existing sessions have been signed out.",
  SESSION_REVOKED: "Session revoked successfully.",
} as const;

export const AUTH_LIMITS = {
  MAX_RESET_ATTEMPTS: 5,
  RESET_CODE_EXPIRY_MINUTES: 15,
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
} as const;
