import { ok, parseBody } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/integrations";
import { company } from "@/lib/company";

const escape = (value: string) =>
  value.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[char] ?? char);

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, contactSchema);
  if (response) return response;

  await sendEmail({
    to: company.email,
    subject: `[Website] ${data.reason} — ${data.name}`,
    html: `<h2>${escape(data.reason)}</h2>
      <p><strong>${escape(data.name)}</strong><br>
      ${escape(data.email)} · ${escape(data.phone)}<br>
      Language: ${data.locale}</p>
      <p style="white-space:pre-wrap">${escape(data.message)}</p>`,
    text: `${data.reason}\n${data.name} · ${data.email} · ${data.phone}\n\n${data.message}`,
  });

  return ok({ sent: true });
}
