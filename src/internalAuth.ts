import type { Context, Next } from "hono";
import type { AuthEnv } from "./types";
import { verifyInternalApiKey } from "./utils/verifyInternalApiKey";

/**
 * Internal API key authentication middleware.
 * Validates requests using X-API-KEY header against INTERNAL_API_KEY secret.
 * Skips validation in dev environment (when WORKER_URL contains "dev-").
 */
const internalAuthMiddleware = async (
  c: Context<AuthEnv>,
  next: Next,
): Promise<Response | void> => {
  const secret = c.req.header("X-API-KEY");
  const result = await verifyInternalApiKey(c.env, secret ?? "");

  if (!result.success) {
    return c.json(
      {
        error: "Unauthorized",
        message: result.error,
      },
      403,
    );
  }

  await next();
};

export default internalAuthMiddleware;
