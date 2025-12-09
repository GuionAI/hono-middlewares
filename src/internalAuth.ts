import type { Context, Next } from "hono";
import type { AuthEnv } from "./types";

/**
 * Internal API key authentication middleware.
 * Validates requests using X-API-KEY header against INTERNAL_API_KEY secret.
 * Skips validation in dev environment (when WORKER_URL contains "dev-").
 */
const internalAuthMiddleware = async (
  c: Context<AuthEnv>,
  next: Next,
): Promise<Response | void> => {
  // Skip validation in dev environment
  const isDev = c.env.WORKER_URL?.includes("dev-");
  if (isDev) {
    await next();
    return;
  }

  const secret = c.req.header("X-API-KEY");
  const internalApiKey = await c.env.INTERNAL_API_KEY.get();

  if (!secret || secret !== internalApiKey) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Invalid or missing API key",
      },
      403,
    );
  }

  await next();
};

export default internalAuthMiddleware;
