/**
 * Integration layer.
 *
 * Every provider here has the same shape: a narrow interface, a live
 * implementation guarded by an env var, and a mock fallback that logs to the
 * server console. Nothing in the app knows which one is running, so dropping a
 * real API key into `.env` is the only step needed to go live.
 */

export type DeliveryResult = {
  ok: boolean;
  provider: string;
  mode: "live" | "mock";
  id?: string;
  error?: string;
};

function log(channel: string, detail: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(`\n[integration:${channel}] (mock mode — no key configured)`, detail, "\n");
}

/* -------------------------------------------------------------------------- */
/* Email — Resend                                                              */
/* -------------------------------------------------------------------------- */

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<DeliveryResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    log("email", { to: input.to, subject: input.subject });
    return { ok: true, provider: "resend", mode: "mock" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "All Weather HVAC <onboarding@resend.dev>",
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) return { ok: false, provider: "resend", mode: "live", error: data.message };
    return { ok: true, provider: "resend", mode: "live", id: data.id };
  } catch (error) {
    return { ok: false, provider: "resend", mode: "live", error: String(error) };
  }
}

/* -------------------------------------------------------------------------- */
/* SMS — Twilio                                                                */
/* -------------------------------------------------------------------------- */

export async function sendSms(input: { to: string; body: string }): Promise<DeliveryResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    log("sms", input);
    return { ok: true, provider: "twilio", mode: "mock" };
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: input.to, From: from, Body: input.body }),
    });
    const data = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok) return { ok: false, provider: "twilio", mode: "live", error: data.message };
    return { ok: true, provider: "twilio", mode: "live", id: data.sid };
  } catch (error) {
    return { ok: false, provider: "twilio", mode: "live", error: String(error) };
  }
}

/* -------------------------------------------------------------------------- */
/* Payments — Stripe (deposits and membership billing)                         */
/* -------------------------------------------------------------------------- */

export async function createCheckoutSession(input: {
  amountCents: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<DeliveryResult & { url?: string }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    log("payment", input);
    return { ok: true, provider: "stripe", mode: "mock", url: input.successUrl };
  }

  try {
    const body = new URLSearchParams({
      mode: "payment",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(input.amountCents),
      "line_items[0][price_data][product_data][name]": input.description,
    });
    if (input.customerEmail) body.set("customer_email", input.customerEmail);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const data = (await res.json()) as { id?: string; url?: string; error?: { message: string } };
    if (!res.ok) {
      return { ok: false, provider: "stripe", mode: "live", error: data.error?.message };
    }
    return { ok: true, provider: "stripe", mode: "live", id: data.id, url: data.url };
  } catch (error) {
    return { ok: false, provider: "stripe", mode: "live", error: String(error) };
  }
}

/* Maps live in `lib/maps.ts` so client components can import them safely. */
export { mapEmbedUrl } from "../maps";
