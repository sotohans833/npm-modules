import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { quoteSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { estimate, type QuoteAnswers } from "@/lib/pricing";
import { makeReference } from "@/lib/scheduling";
import { notifyQuote } from "@/lib/notifications";
import { en, es } from "@/i18n";

/** Human-readable recap so the admin inbox is readable without opening JSON. */
function summarise(answers: QuoteAnswers, locale: "en" | "es") {
  const dict = locale === "es" ? es : en;

  switch (answers.kind) {
    case "PART": {
      const flags = [
        answers.underWarranty ? (locale === "es" ? "en garantía" : "under warranty") : null,
        answers.emergency ? (locale === "es" ? "fuera de horario" : "after hours") : null,
        answers.difficultAccess ? (locale === "es" ? "acceso difícil" : "difficult access") : null,
      ].filter(Boolean);
      const part = dict.quote.parts[answers.part as keyof typeof dict.quote.parts];
      return flags.length ? `${part} (${flags.join(", ")})` : part;
    }
    case "SYSTEM": {
      const type = dict.quote.systems[answers.systemType as keyof typeof dict.quote.systems];
      const efficiency = dict.quote.efficiencies[answers.efficiency as keyof typeof dict.quote.efficiencies];
      const ducts = dict.quote.ducts[answers.ductCondition as keyof typeof dict.quote.ducts];
      return `${type} · ${answers.tons} ${locale === "es" ? "ton" : "tons"} · ${efficiency} · ${locale === "es" ? "ductos" : "ducts"}: ${ducts}`;
    }
    case "DUCTWORK": {
      const scope = dict.quote.ductScopes[answers.scope as keyof typeof dict.quote.ductScopes];
      return `${scope} · ${answers.squareFeet} sq ft`;
    }
    case "INDOOR_AIR":
      return answers.products
        .map((product) => dict.quote.iaq[product as keyof typeof dict.quote.iaq])
        .join(", ");
    default:
      return "";
  }
}

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, quoteSchema);
  if (response) return response;

  // The browser shows a live preview, but the stored price is always
  // recalculated here from the validated answers.
  const range = estimate(data.answers as QuoteAnswers);
  if (range.high <= 0) return fail("EMPTY_ESTIMATE", 422);

  const user = await getCurrentUser();

  const quote = await prisma.quote.create({
    data: {
      reference: makeReference("QT"),
      userId: user?.id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      address: data.address,
      city: data.city,
      zip: data.zip,
      kind: data.answers.kind,
      answers: JSON.stringify(data.answers),
      summary: summarise(data.answers as QuoteAnswers, data.locale),
      estimateLow: range.low,
      estimateHi: range.high,
      locale: data.locale,
    },
  });

  await notifyQuote({
    reference: quote.reference,
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    summary: quote.summary,
    estimateLow: quote.estimateLow,
    estimateHi: quote.estimateHi,
    locale: data.locale,
  });

  return ok(
    {
      quote: {
        id: quote.id,
        reference: quote.reference,
        estimateLow: quote.estimateLow,
        estimateHi: quote.estimateHi,
      },
    },
    201,
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const quotes = await prisma.quote.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return ok({ quotes });
}
