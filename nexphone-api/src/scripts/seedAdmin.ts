/**
 * Secure provisioning of the initial administrator.
 *
 *   ADMIN_SEED_EMAIL=owner@example.com ADMIN_SEED_PASSWORD='<12+ chars>' npm run seed:admin -- --flavor=dev
 *
 * - Credentials come only from the environment; nothing is hard-coded or printed.
 * - Idempotent: if the account already exists it is left untouched (the password is NOT overwritten).
 * - Creates a `super_admin`. Run once per environment, then remove the variables.
 */
import mongoose from "mongoose";
import { z } from "zod";
import { config } from "../config/env";
import { connectDatabase, isDatabaseConnected } from "../config/database";
import { User } from "../modules/users/user.model";
import { hashPassword } from "../utils/password";

const inputSchema = z.object({
  ADMIN_SEED_EMAIL: z.email("ADMIN_SEED_EMAIL must be a valid email address.").transform((e) => e.toLowerCase()),
  ADMIN_SEED_PASSWORD: z
    .string({ error: "ADMIN_SEED_PASSWORD is required." })
    .min(12, "ADMIN_SEED_PASSWORD must be at least 12 characters.")
    .max(72, "ADMIN_SEED_PASSWORD must be at most 72 characters."),
  ADMIN_SEED_NAME: z.string().trim().min(1).max(100).default("Administrator"),
});

async function main(): Promise<void> {
  const parsed = inputSchema.safeParse(process.env);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) console.error(`✖ ${issue.message}`);
    process.exitCode = 1;
    return;
  }
  const { ADMIN_SEED_EMAIL: email, ADMIN_SEED_PASSWORD: password, ADMIN_SEED_NAME: name } = parsed.data;

  // Unlike the server, the script must never silently skip the database.
  await connectDatabase();
  if (!isDatabaseConnected()) {
    console.error(`✖ Could not connect to MongoDB (${config.flavor}). Nothing was created.`);
    process.exitCode = 1;
    return;
  }

  await User.init();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`ℹ An account for ${email} already exists (role: ${existing.role}). Nothing changed.`);
    return;
  }

  await User.create({
    name,
    email,
    role: "super_admin",
    status: "active",
    emailVerified: true,
    passwordHash: await hashPassword(password),
    passwordChangedAt: new Date(),
  });
  console.log(`✔ Created super_admin ${email} in the ${config.flavor} database.`);
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err instanceof Error ? err.message : err);
    if (process.env.DEBUG_SEED && err instanceof Error) console.error(err.stack);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
