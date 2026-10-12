import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { config } from "../config/env";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, config.bcryptRounds);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

let dummyHash: Promise<string> | undefined;

/**
 * Spend the same CPU time as a real comparison when the account does not exist,
 * so response timing does not reveal which emails are registered.
 */
export async function burnPasswordCheck(plain: string): Promise<void> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  await bcrypt.compare(plain, await dummyHash);
}
