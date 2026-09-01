/**
 * Picks the Prisma datasource provider from DATABASE_URL.
 *
 * Prisma requires `provider` to be a string literal — it rejects
 * `env("DATABASE_PROVIDER")` — so the one place that can vary per environment
 * has to be written into the schema before `prisma generate` runs.
 *
 *   file:./dev.db          -> sqlite      (local development, unchanged)
 *   postgres://… | postgresql://…  -> postgresql  (Vercel, Neon, Supabase…)
 *
 * Runs from `postinstall` and `vercel-build`, so nobody has to remember it.
 * It rewrites the file only when the provider actually differs, which keeps
 * `git status` clean on a local machine that never touches Postgres.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), "..", "prisma", "schema.prisma");

function providerFor(url) {
  if (!url) return "sqlite";
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) return "postgresql";
  if (url.startsWith("file:")) return "sqlite";

  // An unrecognised URL is far more likely to be a typo than a new engine, and
  // silently guessing would produce a client that fails at the first query.
  throw new Error(
    `prepare-schema: cannot tell the database engine from DATABASE_URL. ` +
      `Expected it to start with "file:" or "postgresql://".`,
  );
}

const provider = providerFor(process.env.DATABASE_URL);
const schema = readFileSync(schemaPath, "utf8");

// Pooled connections (Vercel Postgres, Neon, Supabase) cannot run schema
// changes, so `prisma db push` needs the direct URL when one is configured.
const directLine = provider === "postgresql" && process.env.DIRECT_URL
  ? '\n  directUrl = env("DIRECT_URL")'
  : "";

const datasource = `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")${directLine}
}`;

const updated = schema.replace(/datasource db \{[^}]*\}/, datasource);

if (updated === schema) {
  console.log(`prepare-schema: already set to ${provider}`);
} else {
  writeFileSync(schemaPath, updated);
  console.log(`prepare-schema: datasource set to ${provider}`);
}
