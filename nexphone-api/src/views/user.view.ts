import type { UserDocument } from "../models/user.model";
import { serializeAuthUser } from "./auth.view";

export function serializeUserProfile(user: UserDocument) {
  const base = serializeAuthUser(user);
  return {
    ...base,
    addresses: user.addresses || [],
  };
}
