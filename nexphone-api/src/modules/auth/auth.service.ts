import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { Types } from "mongoose";
import { config } from "../../config/env";
import { HttpError } from "../../utils/httpError";
import { burnPasswordCheck, hashPassword, verifyPassword } from "../../utils/password";
import { User, type UserDocument } from "../users/user.model";
import { RevokedToken } from "./revokedToken.model";
import {
  issueTokenPair,
  signAccessToken,
  verifyRefreshToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from "./token.service";
import {
  RESET_INVALID_CODE,
  type ChangePasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "./auth.schemas";

/** Wrong guesses allowed per issued recovery code before it is invalidated. */
const MAX_RESET_ATTEMPTS = 5;

const INVALID_CREDENTIALS = "Invalid credentials. Please verify your email and password.";

/** Public shape of an account in auth responses. Never includes secrets. */
export function serializeAuthUser(user: UserDocument) {
  return {
    id: String(user._id),
    customerNumber: user.customerNumber ?? undefined,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    company: user.company ?? undefined,
    tier: user.tier,
    status: user.status,
    role: user.role,
    avatarUrl: user.avatarUrl ?? undefined,
    createdAt: user.createdAt,
  };
}

function resetCodeHash(code: string): string {
  return createHmac("sha256", config.jwtSecret).update(`password-reset:${code}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

export async function register(input: RegisterInput) {
  const _id = new Types.ObjectId();
  const user = new User({
    _id,
    // Role, status, and tier are decided here, never taken from the request.
    role: "customer",
    status: "active",
    tier: input.accountType?.toLowerCase() === "enterprise" ? "Enterprise" : "Regular",
    customerNumber: `CUST-${_id.toHexString().slice(-6).toUpperCase()}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    phoneNormalized: input.phone ? input.phone.replace(/\D/g, "") : undefined,
    company: input.company,
    emailVerified: false,
    passwordHash: await hashPassword(input.password),
    lastLoginAt: new Date(),
  });

  try {
    await user.save();
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw HttpError.conflict("An account with this email address already exists.", "EMAIL_TAKEN");
    }
    throw err;
  }

  return { ...issueTokenPair(user), user: serializeAuthUser(user) };
}

async function findLoginCandidate(identifier: string): Promise<UserDocument | null> {
  const id = identifier.trim().toLowerCase();
  if (id.includes("@")) {
    return User.findOne({ email: id }).select("+passwordHash");
  }
  // Phone-number login (customers only). Ambiguous numbers never match.
  const digits = id.replace(/\D/g, "");
  if (digits.length < 6) return null;
  const matches = await User.find({ phoneNormalized: digits, role: "customer" }).select("+passwordHash").limit(2);
  return matches.length === 1 ? (matches[0] ?? null) : null;
}

/**
 * `audience` keeps the two surfaces apart: the storefront login only accepts customers,
 * the admin login only accepts staff. A mismatch looks exactly like a wrong password.
 */
export async function login(input: LoginInput, audience: "customer" | "admin") {
  const user = await findLoginCandidate(input.email);
  if (!user) {
    await burnPasswordCheck(input.password);
    throw HttpError.unauthorized(INVALID_CREDENTIALS, "INVALID_CREDENTIALS");
  }

  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  const audienceOk = audience === "admin" ? user.role !== "customer" : user.role === "customer";
  if (!passwordOk || !audienceOk) {
    throw HttpError.unauthorized(INVALID_CREDENTIALS, "INVALID_CREDENTIALS");
  }

  // Only reveal the suspension after the password was proven correct.
  if (user.status === "disabled") {
    throw new HttpError(
      403,
      `Account suspended: ${user.disabledReason || "Please contact NexPhone VIP Support."}`,
      "ACCOUNT_DISABLED"
    );
  }

  const now = new Date();
  await User.updateOne({ _id: user._id }, { lastLoginAt: now });
  user.lastLoginAt = now;

  return { ...issueTokenPair(user), user: serializeAuthUser(user) };
}

/** Revokes access token and/or refresh token. Safe to call repeatedly. */
export async function logout(
  accessToken: AccessTokenPayload | null,
  refreshTokenPayload: RefreshTokenPayload | null = null
): Promise<void> {
  const operations: Promise<unknown>[] = [];
  if (accessToken) {
    operations.push(
      RevokedToken.updateOne(
        { jti: accessToken.jti },
        { $setOnInsert: { jti: accessToken.jti, expiresAt: new Date(accessToken.exp * 1000) } },
        { upsert: true }
      )
    );
  }
  if (refreshTokenPayload) {
    operations.push(
      RevokedToken.updateOne(
        { jti: refreshTokenPayload.jti },
        { $setOnInsert: { jti: refreshTokenPayload.jti, expiresAt: new Date(refreshTokenPayload.exp * 1000) } },
        { upsert: true }
      )
    );
  }
  await Promise.all(operations);
}

export async function refreshToken(rawRefreshToken: string) {
  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw HttpError.unauthorized("Invalid or expired refresh token.", "TOKEN_INVALID");
  }

  const [user, revoked] = await Promise.all([
    User.findById(payload.sub),
    RevokedToken.exists({ jti: payload.jti }),
  ]);

  if (!user || revoked || user.tokenVersion !== payload.ver) {
    throw HttpError.unauthorized("Invalid or expired refresh token.", "TOKEN_INVALID");
  }
  if (user.status === "disabled") {
    throw HttpError.forbidden("This account has been suspended.", "ACCOUNT_DISABLED");
  }

  // Invalidate old refresh token (single-use rotation)
  await RevokedToken.updateOne(
    { jti: payload.jti },
    { $setOnInsert: { jti: payload.jti, expiresAt: new Date(payload.exp * 1000) } },
    { upsert: true }
  );

  const tokens = issueTokenPair(user);
  return {
    ...tokens,
    user: serializeAuthUser(user),
  };
}

export async function forgotPassword(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalized, role: "customer", status: "active" });

  // The response is identical whether or not the account exists.
  const response: { success: true; message: string; code?: string } = {
    success: true,
    message: "If an account matches this email, a 6-digit recovery code has been issued.",
  };

  if (!user) return response;

  const code = String(randomInt(100000, 1000000));
  await User.updateOne(
    { _id: user._id },
    {
      passwordResetCodeHash: resetCodeHash(code),
      passwordResetExpiresAt: new Date(Date.now() + config.resetCodeTtlMinutes * 60 * 1000),
      passwordResetAttempts: 0,
    }
  );

  if (config.exposeResetCode) {
    // Development convenience only: no email provider is configured yet.
    response.code = code;
  } else {
    console.warn("⚠️  [Auth] A password recovery code was issued but no email provider is configured; it was not delivered.");
  }
  return response;
}

export async function resetPassword(input: ResetPasswordInput) {
  const fail = () => HttpError.badRequest(RESET_INVALID_CODE, "INVALID_RESET_CODE");
  const email = input.email.trim().toLowerCase();

  // Consume an attempt atomically, so parallel guesses cannot exceed the limit.
  const user = await User.findOneAndUpdate(
    {
      email,
      role: "customer",
      status: "active",
      passwordResetCodeHash: { $exists: true },
      passwordResetExpiresAt: { $gt: new Date() },
      passwordResetAttempts: { $lt: MAX_RESET_ATTEMPTS },
    },
    { $inc: { passwordResetAttempts: 1 } },
    { new: true }
  ).select("+passwordResetCodeHash");

  if (!user?.passwordResetCodeHash) throw fail();
  if (!safeEqualHex(user.passwordResetCodeHash, resetCodeHash(input.code))) throw fail();

  const passwordHash = await hashPassword(input.newPassword);

  // Single use: only succeeds while the same code hash is still stored.
  const result = await User.updateOne(
    { _id: user._id, passwordResetCodeHash: user.passwordResetCodeHash },
    {
      $set: { passwordHash, passwordChangedAt: new Date() },
      $unset: { passwordResetCodeHash: "", passwordResetExpiresAt: "", passwordResetAttempts: "" },
      $inc: { tokenVersion: 1 }, // signs out every existing session
    }
  );
  if (result.modifiedCount !== 1) throw fail();

  return { success: true, message: "Your password has been successfully reset. You may now sign in." };
}

export async function changePassword(userId: unknown, input: ChangePasswordInput) {
  if (input.confirmPassword !== undefined && input.confirmPassword !== input.newPassword) {
    throw HttpError.badRequest("New password and confirmation do not match.", "PASSWORD_MISMATCH");
  }

  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw HttpError.unauthorized("Invalid or expired session token.", "TOKEN_INVALID");

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw HttpError.badRequest("Current password is incorrect.", "INVALID_CURRENT_PASSWORD");
  }
  if (input.currentPassword === input.newPassword) {
    throw HttpError.badRequest("New password must be different from the current password.", "PASSWORD_UNCHANGED");
  }

  user.passwordHash = await hashPassword(input.newPassword);
  user.passwordChangedAt = new Date();
  user.tokenVersion += 1; // every other session is signed out
  await user.save();

  return {
    success: true,
    message: "Password changed successfully.",
    ...issueTokenPair(user),
  };
}
