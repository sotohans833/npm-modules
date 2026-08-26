export type Faq = {
  id: string;
  category: "GENERAL" | "PRICING" | "PLANS" | "EMERGENCY";
  q: { en: string; es: string };
  a: { en: string; es: string };
};

export const FAQS: Faq[] = [
  {
    id: "response-time",
    category: "EMERGENCY",
    q: {
      en: "How fast can someone get here?",
      es: "¿Qué tan rápido puede llegar alguien?",
    },
    a: {
      en: "Emergency calls — no heat in winter, no cooling in a heat advisory, water leaking onto a ceiling — get a technician dispatched the same day, around the clock. Routine work is usually available within 24–48 hours, and maintenance plan members go to the front of that queue.",
      es: "Las llamadas de emergencia — sin calefacción en invierno, sin aire durante una alerta de calor, agua cayendo sobre un techo — reciben un técnico el mismo día, a cualquier hora. El trabajo de rutina suele estar disponible en 24 a 48 horas, y los miembros del plan de mantenimiento pasan al frente de esa fila.",
    },
  },
  {
    id: "diagnostic-fee",
    category: "PRICING",
    q: {
      en: "What does the visit cost?",
      es: "¿Cuánto cuesta la visita?",
    },
    a: {
      en: "A diagnostic visit is $89, and it's waived if you approve the repair that same visit. Estimates for a replacement system are always free — nobody should pay to be sold something.",
      es: "La visita de diagnóstico cuesta $89, y se descuenta si usted aprueba la reparación en esa misma visita. Las cotizaciones de reemplazo de sistema siempre son gratis — nadie debería pagar por que le vendan algo.",
    },
  },
  {
    id: "flat-rate",
    category: "PRICING",
    q: {
      en: "Do you charge by the hour?",
      es: "¿Cobran por hora?",
    },
    a: {
      en: "No. We quote a flat price for the job before any work begins. If the repair takes twice as long as we expected, that's our problem, not your invoice.",
      es: "No. Cotizamos un precio fijo por el trabajo antes de empezar. Si la reparación toma el doble de lo previsto, ese es nuestro problema, no el de su factura.",
    },
  },
  {
    id: "repair-vs-replace",
    category: "GENERAL",
    q: {
      en: "Should I repair or replace my system?",
      es: "¿Debo reparar o reemplazar mi sistema?",
    },
    a: {
      en: "A useful rule of thumb: multiply the repair cost by the unit's age in years. Over about $5,000, replacement usually wins. Systems past 12 years, or anything still running R-22 refrigerant, are also strong replacement candidates. We'll put both numbers in front of you and let you decide.",
      es: "Una regla útil: multiplique el costo de la reparación por la edad del equipo en años. Si pasa de unos $5,000, casi siempre conviene reemplazar. Los sistemas de más de 12 años, o cualquiera que aún use refrigerante R-22, también son buenos candidatos a reemplazo. Le ponemos ambos números al frente y usted decide.",
    },
  },
  {
    id: "filter-frequency",
    category: "GENERAL",
    q: {
      en: "How often should I change the filter?",
      es: "¿Cada cuánto debo cambiar el filtro?",
    },
    a: {
      en: "A 1-inch filter every 1–3 months; a 4–5 inch media filter every 6–12 months. Shorten that if you have pets, allergies, or ongoing construction nearby. A clogged filter is the single most common cause of the service calls we get.",
      es: "Un filtro de 1 pulgada cada 1 a 3 meses; un filtro de medio de 4 o 5 pulgadas cada 6 a 12 meses. Acorte ese plazo si tiene mascotas, alergias o construcción cerca. Un filtro tapado es la causa más común de las llamadas de servicio que recibimos.",
    },
  },
  {
    id: "brands",
    category: "GENERAL",
    q: {
      en: "Do you service brands you didn't install?",
      es: "¿Dan servicio a marcas que ustedes no instalaron?",
    },
    a: {
      en: "Yes — every major brand. We're a Carrier Factory Authorized Dealer for new equipment, but our technicians carry parts and training for Trane, Lennox, Goodman, Rheem, American Standard, Bryant and the rest.",
      es: "Sí — todas las marcas principales. Somos Distribuidor Autorizado de Fábrica Carrier para equipo nuevo, pero nuestros técnicos llevan piezas y capacitación para Trane, Lennox, Goodman, Rheem, American Standard, Bryant y las demás.",
    },
  },
  {
    id: "warranty",
    category: "GENERAL",
    q: {
      en: "What warranty do I get?",
      es: "¿Qué garantía recibo?",
    },
    a: {
      en: "Two years on our workmanship, plus the manufacturer's parts warranty — typically 10 years on new equipment when we register it for you at install, which we always do.",
      es: "Dos años en nuestra mano de obra, más la garantía de piezas del fabricante — normalmente 10 años en equipo nuevo cuando lo registramos por usted en la instalación, lo cual siempre hacemos.",
    },
  },
  {
    id: "plan-worth",
    category: "PLANS",
    q: {
      en: "Is a maintenance plan actually worth it?",
      es: "¿De verdad vale la pena un plan de mantenimiento?",
    },
    a: {
      en: "If you'd pay for two tune-ups anyway, the plan already costs less. The rest — priority scheduling, no overtime charges, and a standing discount on repairs — is what people notice in the middle of a July heat wave. It also keeps most manufacturer warranties valid, which require documented annual service.",
      es: "Si de todos modos pagaría dos mantenimientos, el plan ya le cuesta menos. Lo demás — atención prioritaria, sin recargos por horario extendido y descuento permanente en reparaciones — es lo que la gente nota en plena ola de calor de julio. Además mantiene vigente la mayoría de garantías del fabricante, que exigen servicio anual documentado.",
    },
  },
  {
    id: "plan-cancel",
    category: "PLANS",
    q: {
      en: "Can I cancel a plan?",
      es: "¿Puedo cancelar un plan?",
    },
    a: {
      en: "Any time, with no cancellation fee. If you sell the house, the plan transfers to the new owner at no cost — which tends to be a nice line in a listing.",
      es: "Cuando quiera, sin penalidad. Si vende la casa, el plan se transfiere al nuevo dueño sin costo — algo que suele quedar muy bien en el anuncio de venta.",
    },
  },
  {
    id: "spanish",
    category: "GENERAL",
    q: {
      en: "Do you have Spanish-speaking technicians?",
      es: "¿Tienen técnicos que hablan español?",
    },
    a: {
      en: "Yes. Dispatch and field staff both include Spanish speakers, and this whole site — booking, estimates and your account — works in Spanish.",
      es: "Sí. Tanto el despacho como el personal de campo incluyen personas que hablan español, y todo este sitio — agendamiento, cotizaciones y su cuenta — funciona en español.",
    },
  },
];
