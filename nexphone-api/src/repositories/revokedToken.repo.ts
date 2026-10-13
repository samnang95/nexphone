import { RevokedToken } from "../models/revokedToken.model";

export const revokedTokenRepo = {
  async revoke(jti: string, expiresAt: Date): Promise<void> {
    try {
      await RevokedToken.create({ jti, expiresAt });
    } catch {
      // Duplicate jti is already revoked; ignore
    }
  },

  async isRevoked(jti: string): Promise<boolean> {
    const exists = await RevokedToken.exists({ jti });
    return Boolean(exists);
  },
};
