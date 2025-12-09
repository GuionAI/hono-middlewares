import type { AuthEnv } from "../types";

/**
 * Verify internal API key
 * Shared logic used by internalAuth.ts and combinedAuth.ts
 * Skips validation in dev environment (when WORKER_URL contains "dev-")
 */
export async function verifyInternalApiKey(
  env: AuthEnv["Bindings"],
  secret: string,
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  // Skip validation in dev environment
  const isDev = env.WORKER_URL?.includes("dev-");
  if (isDev) {
    return { success: true, skipped: true };
  }

  const internalApiKey = await env.INTERNAL_API_KEY.get();

  if (!secret || secret !== internalApiKey) {
    return { success: false, error: "Invalid or missing API key" };
  }

  return { success: true };
}
