import type { Context, Next } from "hono";
import { getDb, type KyselyDb, type HyperdriveEnv } from "@flicknote/types/db";

declare module "hono" {
  interface ContextVariableMap {
    db: KyselyDb;
  }
}

/**
 * Environment bindings required for db middleware
 */
export interface DbBindings extends HyperdriveEnv {}

/**
 * Environment type for db middleware
 */
export type DbEnv = {
  Bindings: DbBindings;
};

/**
 * Middleware that provides a Kysely database connection.
 * Uses HD_NOCACHE for fresh reads after writes.
 */
const dbMiddleware = async (
  c: Context<DbEnv>,
  next: Next,
): Promise<Response | void> => {
  const { db } = getDb(c.env);
  c.set("db", db);
  await next();
};

export default dbMiddleware;
