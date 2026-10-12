/**
 * Runs in every test worker before test files are loaded.
 * Environment values set here win over any .env.* file (dotenv is called with override:false).
 */
process.env.FLAVOR = "dev";
process.env.JWT_SECRET = "test-only-secret-do-not-use-elsewhere";
process.env.BCRYPT_ROUNDS = "4"; // fast hashing in tests; production default is 12
process.env.AUTH_RATE_LIMIT_MAX ??= "1000"; // rate-limit behaviour has its own test file
process.env.AUTH_RATE_LIMIT_WINDOW_MS ??= "60000";
