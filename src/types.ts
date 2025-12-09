import type { Context, Next } from "hono";

/**
 * Secret store binding interface (Cloudflare secrets store pattern)
 */
export interface SecretStoreBinding {
  get(): Promise<string | null>;
}

/**
 * Base environment bindings required for auth middlewares
 */
export interface AuthBindings {
  JWT_SECRET: SecretStoreBinding;
  INTERNAL_API_KEY: SecretStoreBinding;
  WORKER_URL?: string;
  DISABLE_AUTH?: string;
}

/**
 * Auth variables set by middlewares
 */
export interface AuthVariables {
  userId: string;
  authType: "jwt" | "internal";
}

/**
 * Environment type for auth middlewares.
 * Workers should extend their Env type to include these bindings and variables.
 */
export type AuthEnv = {
  Bindings: AuthBindings;
  Variables: AuthVariables;
};

/**
 * Middleware function type
 */
export type AuthMiddleware = (
  c: Context<AuthEnv>,
  next: Next,
) => Promise<Response | void>;
