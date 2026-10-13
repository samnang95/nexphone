import type { UserDocument } from "../models/user.model";

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

export function authResponse(user: UserDocument, token: string, refreshToken?: string) {
  return {
    token,
    refreshToken,
    user: serializeAuthUser(user),
  };
}
