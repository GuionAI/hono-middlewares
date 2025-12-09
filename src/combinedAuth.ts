import type { Context, Next } from "hono";
import type { AuthEnv } from "./types";
import { verifyJwtToken } from "./utils/verifyJwt";

/**
 * Combined auth middleware that accepts either:
 * 1. JWT token (Authorization: Bearer <jwt>) - userId extracted from token
 * 2. Internal API key (X-API-KEY or Authorization: Bearer <api-key>) - userId must be in request body
 *
 * Sets `userId` and `authType` ('jwt' | 'internal') in context
 */
const combinedAuthMiddleware = async (
  c: Context<AuthEnv>,
  next: Next,
): Promise<Response | void> => {
  // Skip authentication if disabled (for local development)
  if (c.env.DISABLE_AUTH === "true") {
    c.set("userId", "local-test-user");
    c.set("authType", "jwt");
    return next();
  }

  // Check for X-API-KEY header first (definitely internal auth)
  const apiKeyHeader = c.req.header("X-API-KEY");
  if (apiKeyHeader) {
    return handleInternalAuth(c, next, apiKeyHeader);
  }

  // Check Authorization header
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing authentication" }, 401);
  }

  const token = authHeader.slice(7);

  // Try JWT auth first
  const jwtResult = await verifyJwtToken(c, token);
  if (jwtResult.success) {
    c.set("userId", jwtResult.userId!);
    c.set("authType", "jwt");
    return next();
  }

  // Fall back to internal API key auth
  return handleInternalAuth(c, next, token);
};

async function handleInternalAuth(
  c: Context<AuthEnv>,
  next: Next,
  secret: string,
): Promise<Response | void> {
  const internalApiKey = await c.env.INTERNAL_API_KEY.get();

  if (!secret || secret !== internalApiKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // For internal auth, userId must come from request body
  c.set("authType", "internal");
  return next();
}

export default combinedAuthMiddleware;
