import type { Context } from "hono";
import { verify } from "hono/jwt";
import type { AuthEnv } from "../types";

/**
 * Verify JWT and extract userId
 * Shared logic used by jwt.ts and combinedAuth.ts
 */
export async function verifyJwtToken(
  c: Context<AuthEnv>,
  token: string,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const secret = await c.env.JWT_SECRET.get();
    if (!secret) {
      return { success: false, error: "JWT secret not configured" };
    }

    const payload = (await verify(token, secret)) as {
      sub?: string;
      aud?: string;
      exp?: number;
    };

    if (payload.aud !== "authenticated") {
      return { success: false, error: "Invalid audience" };
    }

    const userId = payload.sub;
    if (!userId) {
      return { success: false, error: "Missing user ID in JWT" };
    }

    return { success: true, userId };
  } catch (error) {
    if (error instanceof Error && error.message.includes("expired")) {
      return { success: false, error: "JWT has expired" };
    }
    return { success: false, error: "Invalid JWT token" };
  }
}
