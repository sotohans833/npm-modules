import { z } from "zod";
import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/integrations";

export async function GET() {
  const plans = await prisma.maintenancePlan.findMany({ orderBy: { sortOrder: "asc" } });
  return ok({ plans });
}

const subscribeSchema = z.object({
  planId: z.string().min(1).max(40),
  billing: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
});

/**
 * Activating a membership. With no Stripe key configured the integration
 * returns a mock checkout and the plan is attached immediately, which is what
 * makes the flow demonstrable end to end without real billing.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const { data, response } = await parseBody(request, subscribeSchema);
  if (response) return response;

  const plan = await prisma.maintenancePlan.findUnique({ where: { id: data.planId } });
  if (!plan) return fail("NOT_FOUND", 404);

  const amountCents = data.billing === "YEARLY" ? plan.yearlyCents : plan.monthlyCents;
  const origin = new URL(request.url).origin;

  const checkout = await createCheckoutSession({
    amountCents,
    description: `${plan.nameEn} maintenance plan (${data.billing.toLowerCase()})`,
    successUrl: `${origin}/portal?plan=activated`,
    cancelUrl: `${origin}/plans`,
    customerEmail: user.email,
  });

  if (checkout.mode === "mock") {
    await prisma.user.update({ where: { id: user.id }, data: { planId: plan.id } });
    return ok({ activated: true, mode: "mock", redirectUrl: `/portal?plan=activated` });
  }

  return ok({ activated: false, mode: "live", redirectUrl: checkout.url });
}
