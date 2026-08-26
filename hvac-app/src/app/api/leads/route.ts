import { prisma } from "@/lib/db";
import { ok, parseBody } from "@/lib/api";
import { leadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, leadSchema);
  if (response) return response;

  // Re-subscribing is not an error worth showing the visitor.
  await prisma.lead.upsert({
    where: { email: data.email },
    create: data,
    update: { source: data.source, locale: data.locale },
  });

  return ok({ subscribed: true });
}
