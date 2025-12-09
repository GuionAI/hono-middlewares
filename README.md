# @flicknote/hono-middlewares

Shared authentication middlewares for FlickNote Cloudflare Workers.

## Installation

```bash
npm install @flicknote/hono-middlewares
# or
bun add @flicknote/hono-middlewares
```

## Middlewares

### `jwtMiddleware`

JWT authentication middleware. Validates Bearer token and extracts `userId` from the JWT payload.

```typescript
import { jwtMiddleware } from "@flicknote/hono-middlewares";

app.use("/api/*", jwtMiddleware);
```

### `internalAuthMiddleware`

Internal API key authentication. Validates `X-API-KEY` header against `INTERNAL_API_KEY` secret.

- Skips validation in dev environment (when `WORKER_URL` contains "dev-")

```typescript
import { internalAuthMiddleware } from "@flicknote/hono-middlewares";

app.use("/internal/*", internalAuthMiddleware);
```

### `combinedAuthMiddleware`

Accepts either JWT or internal API key authentication:

1. `X-API-KEY` header - internal auth, `userId` must be in request body
2. `Authorization: Bearer <jwt>` - JWT auth, `userId` extracted from token
3. `Authorization: Bearer <api-key>` - fallback to internal auth

```typescript
import { combinedAuthMiddleware } from "@flicknote/hono-middlewares";

app.use("/api/*", combinedAuthMiddleware);
```

## Context Variables

All middlewares set these variables in the Hono context:

- `userId` - The authenticated user's ID
- `authType` - `"jwt"` | `"internal"` | `"apikey"`

```typescript
app.get("/api/me", combinedAuthMiddleware, (c) => {
  const userId = c.get("userId");
  const authType = c.get("authType");
  return c.json({ userId, authType });
});
```

## Required Bindings

Your worker must have these bindings configured:

```typescript
interface Env {
  Bindings: {
    JWT_SECRET: SecretStoreBinding;      // Required for JWT auth
    INTERNAL_API_KEY: SecretStoreBinding; // Required for internal auth
    WORKER_URL?: string;                  // Optional, for dev environment detection
    DISABLE_AUTH?: string;                // Optional, set to "true" to disable auth
  };
}
```

## Types

```typescript
import type {
  AuthEnv,
  AuthBindings,
  AuthVariables,
  SecretStoreBinding,
} from "@flicknote/hono-middlewares";
```

## License

MIT
