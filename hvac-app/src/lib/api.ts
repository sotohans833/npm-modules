import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

/** Parses and validates a JSON body, returning a discriminated result. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T; response: null } | { data: null; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { data: null, response: fail("INVALID_JSON") };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      response: fail("VALIDATION_ERROR", 422, {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      }),
    };
  }

  return { data: parsed.data, response: null };
}

export const UNAUTHENTICATED = () => fail("UNAUTHENTICATED", 401);
export const FORBIDDEN = () => fail("FORBIDDEN", 403);
export const NOT_FOUND = () => fail("NOT_FOUND", 404);
