import { sendEmail, sendSms } from "./integrations";
import { company } from "./company";
import { formatDate, type Locale } from "@/i18n";
import { TIME_SLOTS } from "./scheduling";
import { money } from "./pricing";

function shell(title: string, bodyHtml: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#f1f5f9;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#0B1B2B">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <tr><td style="background:#0B2942;padding:20px 24px;color:#fff">
          <div style="font-weight:800;letter-spacing:-.02em">ALL WEATHER</div>
          <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#FFAA6B">Heating &amp; Cooling</div>
        </td></tr>
        <tr><td style="padding:28px 24px">
          <h1 style="margin:0 0 16px;font-size:20px">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="background:#f8fafc;padding:18px 24px;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0">
          ${company.name}<br>${company.address}<br>
          <a href="tel:${company.phone.replace(/\D/g, "")}" style="color:#DB6810;text-decoration:none">${company.phone}</a>
          &nbsp;·&nbsp; ${company.hours}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#64748b;width:40%">${label}</td>
    <td style="padding:8px 0;font-size:14px;font-weight:600">${value}</td>
  </tr>`;
}

const COPY = {
  en: {
    apptSubject: (ref: string) => `Your service visit is booked — ${ref}`,
    apptTitle: "Your visit is booked",
    apptIntro:
      "Thanks for booking with All Weather. A dispatcher will call if anything about your arrival window changes, and your technician's name will be texted the morning of the visit.",
    quoteSubject: (ref: string) => `Your estimate — ${ref}`,
    quoteTitle: "Here's your estimate",
    quoteIntro:
      "This range covers equipment, labour, permits and haul-away for typical Triangle homes. A comfort advisor will call within one business day to schedule the free on-site confirmation.",
    reference: "Reference",
    service: "Service",
    date: "Date",
    window: "Arrival window",
    address: "Address",
    estimate: "Estimated range",
    scope: "Scope",
    questions: "Questions? Call us any time at",
    smsAppt: (ref: string, date: string, slot: string) =>
      `All Weather HVAC: your visit is confirmed for ${date}, ${slot}. Ref ${ref}. Reply or call ${company.phone} to change it.`,
  },
  es: {
    apptSubject: (ref: string) => `Su visita de servicio quedó agendada — ${ref}`,
    apptTitle: "Su visita quedó agendada",
    apptIntro:
      "Gracias por agendar con All Weather. Un despachador le llamará si algo cambia en su franja de llegada, y le enviaremos por mensaje el nombre de su técnico la mañana de la visita.",
    quoteSubject: (ref: string) => `Su cotización — ${ref}`,
    quoteTitle: "Esta es su cotización",
    quoteIntro:
      "Este rango cubre equipo, mano de obra, permisos y retiro del equipo viejo para casas típicas del Triángulo. Un asesor le llamará dentro de un día hábil para agendar la confirmación gratuita en sitio.",
    reference: "Referencia",
    service: "Servicio",
    date: "Fecha",
    window: "Franja de llegada",
    address: "Dirección",
    estimate: "Rango estimado",
    scope: "Alcance",
    questions: "¿Preguntas? Llámenos a cualquier hora al",
    smsAppt: (ref: string, date: string, slot: string) =>
      `All Weather HVAC: su visita está confirmada para ${date}, ${slot}. Ref ${ref}. Responda o llame al ${company.phone} para cambiarla.`,
  },
} as const;

export async function notifyAppointment(input: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  serviceLabel: string;
  date: Date;
  timeSlot: string;
  locale: Locale;
}) {
  const copy = COPY[input.locale];
  const slot = TIME_SLOTS.find((entry) => entry.id === input.timeSlot);
  const slotLabel = slot ? slot[input.locale] : input.timeSlot;
  const dateLabel = formatDate(input.date, input.locale);

  const html = shell(
    copy.apptTitle,
    `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#3D4E5E">${copy.apptIntro}</p>
     <table role="presentation" width="100%" style="border-top:1px solid #e2e8f0">
       ${row(copy.reference, input.reference)}
       ${row(copy.service, input.serviceLabel)}
       ${row(copy.date, dateLabel)}
       ${row(copy.window, slotLabel)}
       ${row(copy.address, `${input.address}, ${input.city} ${input.zip}`)}
     </table>
     <p style="margin:20px 0 0;font-size:13px;color:#64748b">${copy.questions}
       <a href="tel:${company.phone.replace(/\D/g, "")}" style="color:#DB6810">${company.phone}</a>.</p>`,
  );

  // Both channels are best-effort: a failed notification must never roll back
  // a booking the customer already completed.
  const results = await Promise.allSettled([
    sendEmail({ to: input.email, subject: copy.apptSubject(input.reference), html }),
    sendSms({ to: input.phone, body: copy.smsAppt(input.reference, dateLabel, slotLabel) }),
    sendEmail({
      to: company.email,
      subject: `[New booking] ${input.serviceLabel} — ${input.name} (${input.reference})`,
      html,
    }),
  ]);

  return results.map((result) => (result.status === "fulfilled" ? result.value : null));
}

export async function notifyQuote(input: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  summary: string;
  estimateLow: number;
  estimateHi: number;
  locale: Locale;
}) {
  const copy = COPY[input.locale];

  const html = shell(
    copy.quoteTitle,
    `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#3D4E5E">${copy.quoteIntro}</p>
     <div style="background:#FFF5EC;border:1px solid #FFCBA3;border-radius:12px;padding:16px;margin-bottom:18px">
       <div style="font-size:12px;color:#B14F0D;text-transform:uppercase;letter-spacing:.1em">${copy.estimate}</div>
       <div style="font-size:26px;font-weight:800;color:#8A3E10;margin-top:4px">
         ${money(input.estimateLow)} – ${money(input.estimateHi)}
       </div>
     </div>
     <table role="presentation" width="100%" style="border-top:1px solid #e2e8f0">
       ${row(copy.reference, input.reference)}
       ${row(copy.scope, input.summary)}
     </table>
     <p style="margin:20px 0 0;font-size:13px;color:#64748b">${copy.questions}
       <a href="tel:${company.phone.replace(/\D/g, "")}" style="color:#DB6810">${company.phone}</a>.</p>`,
  );

  const results = await Promise.allSettled([
    sendEmail({ to: input.email, subject: copy.quoteSubject(input.reference), html }),
    sendEmail({
      to: company.email,
      subject: `[New estimate] ${input.name} — ${money(input.estimateLow)}–${money(input.estimateHi)} (${input.reference})`,
      html,
    }),
  ]);

  return results.map((result) => (result.status === "fulfilled" ? result.value : null));
}
