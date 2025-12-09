import type { Context, Next } from "hono";
import type { AuthEnv } from "./types";
import { verifyJwtToken } from "./utils/verifyJwt";

export default async function jwtMiddleware(
  c: Context<AuthEnv>,
  next: Next,
): Promise<Response | void> {
  // Skip authentication if disabled (for local development)
  if (c.env.DISABLE_AUTH === "true") {
    c.set("userId", "local-test-user");
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing JWT token" }, 401);
  }
  const token = authHeader.slice(7);

  const result = await verifyJwtToken(c, token);

  if (!result.success) {
    return c.json(
      { error: result.error },
      result.error === "JWT secret not configured" ? 500 : 401,
    );
  }

  c.set("userId", result.userId!);
  await next();
}
