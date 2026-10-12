import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User, type UserRole } from "../../modules/users/user.model";
import { RevokedToken } from "../../modules/auth/revokedToken.model";
import { hashPassword } from "../../utils/password";

let mongod: MongoMemoryServer | undefined;

/** Starts an isolated in-memory MongoDB. No real database is ever contacted. */
export async function startTestDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "nexphone_test" });
  await Promise.all([User.init(), RevokedToken.init()]); // make sure unique/TTL indexes exist
}

export async function stopTestDb(): Promise<void> {
  await mongoose.disconnect();
  await mongod?.stop();
}

export async function clearTestDb(): Promise<void> {
  await Promise.all([User.deleteMany({}), RevokedToken.deleteMany({})]);
}

export const TEST_PASSWORD = "CorrectHorse9!";

interface TestUserOptions {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  status?: "active" | "disabled";
  phone?: string;
  disabledReason?: string;
}

/** Inserts a user directly (bypassing the API) so tests can set up roles/status. */
export async function createTestUser(opts: TestUserOptions = {}) {
  const role = opts.role ?? "customer";
  return User.create({
    name: opts.name ?? "Test User",
    email: (opts.email ?? `user${Math.random().toString(36).slice(2, 8)}@example.com`).toLowerCase(),
    passwordHash: await hashPassword(opts.password ?? TEST_PASSWORD),
    role,
    status: opts.status ?? "active",
    disabledReason: opts.disabledReason,
    phone: opts.phone,
    phoneNormalized: opts.phone ? opts.phone.replace(/\D/g, "") : undefined,
    customerNumber: role === "customer" ? `CUST-T${Math.random().toString(36).slice(2, 7).toUpperCase()}` : undefined,
  });
}
