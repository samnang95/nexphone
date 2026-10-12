import { Schema, model } from "mongoose";

/**
 * Access tokens that were explicitly logged out. Entries expire automatically (TTL index)
 * at the token's own expiry, so the collection only holds tokens that are still otherwise valid.
 */
const revokedTokenSchema = new Schema({
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export const RevokedToken = model("RevokedToken", revokedTokenSchema);
