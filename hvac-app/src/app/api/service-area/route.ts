import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/api";

export async function GET(request: Request) {
  const zip = new URL(request.url).searchParams.get("zip");
  if (!zip || !/^\d{5}$/.test(zip)) return fail("INVALID_ZIP", 422);

  const match = await prisma.serviceZip.findUnique({ where: { zip } });
  if (!match) return ok({ covered: false, zip });

  return ok({ covered: true, zip, city: match.city, county: match.county, feeCents: match.feeCents });
}
