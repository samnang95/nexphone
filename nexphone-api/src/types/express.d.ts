import type { AuthContext } from "../middleware/auth";

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware. */
      auth?: AuthContext;
    }
  }
}

export {};
