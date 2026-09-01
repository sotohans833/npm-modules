import { prisma } from "@/lib/db";
import { ok } from "@/lib/api";

/** Active promotions, plus single-code validation via `?code=`. */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const now = new Date();

  if (code) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
    const valid = Boolean(coupon?.active && (!coupon.expiresAt || coupon.expiresAt > now));
    return ok({ valid, coupon: valid ? coupon : null });
  }

  const coupons = await prisma.coupon.findMany({
    where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    orderBy: { expiresAt: "asc" },
  });
  return ok({ coupons });
}
