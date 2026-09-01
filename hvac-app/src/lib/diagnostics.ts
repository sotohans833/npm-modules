/**
 * Symptom-based triage used by the "What's wrong with my system?" assistant.
 *
 * It is deliberately rule-based rather than an LLM call: the answers are
 * auditable, work offline, and never invent a diagnosis. The output always ends
 * at the same place — book a visit — but with the right urgency and a
 * pre-filled service type so the customer skips half the booking form.
 */

export type Urgency = "EMERGENCY" | "URGENT" | "STANDARD";

export type Symptom = {
  id: string;
  en: string;
  es: string;
  /** Which systems the symptom applies to; used to filter the checklist. */
  systems: Array<"COOLING" | "HEATING" | "BOTH">;
};

export const SYMPTOMS: Symptom[] = [
  { id: "no_cool", en: "Blowing air, but it isn't cold", es: "Sopla aire, pero no sale frío", systems: ["COOLING"] },
  { id: "no_heat", en: "Blowing air, but it isn't warm", es: "Sopla aire, pero no sale caliente", systems: ["HEATING"] },
  { id: "no_air", en: "No air coming out of the vents", es: "No sale aire por las rejillas", systems: ["BOTH"] },
  { id: "wont_start", en: "System won't turn on at all", es: "El sistema no enciende", systems: ["BOTH"] },
  { id: "short_cycling", en: "Turns on and off every few minutes", es: "Se prende y apaga cada pocos minutos", systems: ["BOTH"] },
  { id: "ice", en: "Ice on the unit or refrigerant lines", es: "Hielo en la unidad o en las tuberías", systems: ["COOLING"] },
  { id: "water_leak", en: "Water leaking around the indoor unit", es: "Fuga de agua cerca de la unidad interior", systems: ["BOTH"] },
  { id: "burning_smell", en: "Burning or electrical smell", es: "Olor a quemado o a eléctrico", systems: ["BOTH"] },
  { id: "gas_smell", en: "Gas or rotten-egg smell", es: "Olor a gas o a huevo podrido", systems: ["HEATING"] },
  { id: "co_alarm", en: "Carbon monoxide alarm went off", es: "Se activó la alarma de monóxido de carbono", systems: ["HEATING"] },
  { id: "loud_noise", en: "Loud grinding, banging or squealing", es: "Ruido fuerte, golpeteo o chirrido", systems: ["BOTH"] },
  { id: "breaker_trip", en: "Keeps tripping the breaker", es: "Bota el breaker constantemente", systems: ["BOTH"] },
  { id: "high_bill", en: "Energy bill jumped unexpectedly", es: "La factura de energía subió de repente", systems: ["BOTH"] },
  { id: "uneven", en: "Some rooms much hotter or colder", es: "Algunas habitaciones mucho más calientes o frías", systems: ["BOTH"] },
  { id: "humidity", en: "House feels humid or muggy", es: "La casa se siente húmeda o pegajosa", systems: ["COOLING"] },
  { id: "dust", en: "Excess dust or allergy symptoms indoors", es: "Mucho polvo o alergias dentro de la casa", systems: ["BOTH"] },
  { id: "thermostat", en: "Thermostat is blank or unresponsive", es: "El termostato está apagado o no responde", systems: ["BOTH"] },
  { id: "odor", en: "Musty or mildew smell when running", es: "Olor a humedad o moho al funcionar", systems: ["BOTH"] },
];

export type Finding = {
  id: string;
  titleEn: string;
  titleEs: string;
  detailEn: string;
  detailEs: string;
  urgency: Urgency;
  /** Pre-selects the booking form. */
  serviceType: "REPAIR" | "MAINTENANCE" | "INSTALL_ESTIMATE" | "INDOOR_AIR" | "ELECTRICAL" | "DUCTWORK";
  /** Symptoms that trigger this finding. */
  triggers: string[];
  /** Safe steps the customer can take before the technician arrives. */
  selfCheckEn?: string[];
  selfCheckEs?: string[];
};

export const FINDINGS: Finding[] = [
  {
    id: "gas_leak",
    titleEn: "Possible gas leak — stop and call 911",
    titleEs: "Posible fuga de gas — deténgase y llame al 911",
    detailEn:
      "A gas or rotten-egg smell is an emergency. Leave the house immediately, do not touch light switches or your phone indoors, and call 911 and your gas utility from outside. Call us once the property has been cleared.",
    detailEs:
      "Un olor a gas o a huevo podrido es una emergencia. Salga de la casa de inmediato, no toque interruptores ni use el teléfono adentro, y llame al 911 y a su compañía de gas desde afuera. Llámenos cuando la propiedad esté despejada.",
    urgency: "EMERGENCY",
    serviceType: "REPAIR",
    triggers: ["gas_smell"],
  },
  {
    id: "carbon_monoxide",
    titleEn: "Carbon monoxide risk — evacuate first",
    titleEs: "Riesgo de monóxido de carbono — evacúe primero",
    detailEn:
      "Leave the house with everyone inside, including pets, and call 911. A tripped CO alarm often points to a cracked heat exchanger or a blocked flue, which we must inspect before the system is used again.",
    detailEs:
      "Salga de la casa con todos adentro, incluidas las mascotas, y llame al 911. Una alarma de CO activada suele indicar un intercambiador de calor agrietado o un tiro obstruido, que debemos inspeccionar antes de volver a usar el sistema.",
    urgency: "EMERGENCY",
    serviceType: "REPAIR",
    triggers: ["co_alarm"],
  },
  {
    id: "electrical_hazard",
    titleEn: "Electrical hazard — shut the system off",
    titleEs: "Riesgo eléctrico — apague el sistema",
    detailEn:
      "A burning smell or a breaker that keeps tripping points to a failing motor, capacitor or wiring fault. Turn the system off at the thermostat and the breaker, and leave it off until a technician inspects it.",
    detailEs:
      "Un olor a quemado o un breaker que se bota indica un motor, un capacitor o un cableado en falla. Apague el sistema en el termostato y en el breaker, y déjelo apagado hasta que un técnico lo revise.",
    urgency: "EMERGENCY",
    serviceType: "ELECTRICAL",
    triggers: ["burning_smell", "breaker_trip"],
    selfCheckEn: ["Switch the thermostat to OFF", "Turn off the HVAC breaker in the panel", "Do not reset the breaker repeatedly"],
    selfCheckEs: ["Ponga el termostato en OFF", "Apague el breaker del HVAC en el panel", "No reinicie el breaker repetidamente"],
  },
  {
    id: "frozen_coil",
    titleEn: "Frozen evaporator coil",
    titleEs: "Serpentín evaporador congelado",
    detailEn:
      "Ice on the coil or lines usually means restricted airflow or low refrigerant. Running the system while frozen can destroy the compressor — the most expensive part of the system.",
    detailEs:
      "El hielo en el serpentín o en las tuberías suele indicar flujo de aire restringido o poco refrigerante. Operar el sistema congelado puede dañar el compresor, la pieza más costosa del equipo.",
    urgency: "URGENT",
    serviceType: "REPAIR",
    triggers: ["ice", "no_cool"],
    selfCheckEn: ["Set the thermostat to OFF and the fan to ON to thaw the coil", "Replace the air filter if it is dirty", "Make sure no supply vents are closed or blocked"],
    selfCheckEs: ["Ponga el termostato en OFF y el ventilador en ON para descongelar", "Cambie el filtro de aire si está sucio", "Verifique que ninguna rejilla esté cerrada o bloqueada"],
  },
  {
    id: "no_conditioning",
    titleEn: "System runs but doesn't condition the air",
    titleEs: "El sistema funciona pero no acondiciona el aire",
    detailEn:
      "Common causes are a failed capacitor, a low refrigerant charge from a leak, a dirty outdoor coil, or a stuck reversing valve on a heat pump. Most are same-day repairs once diagnosed.",
    detailEs:
      "Las causas comunes son un capacitor dañado, carga baja de refrigerante por una fuga, un condensador sucio o una válvula reversible atascada en una bomba de calor. La mayoría se reparan el mismo día tras el diagnóstico.",
    urgency: "URGENT",
    serviceType: "REPAIR",
    triggers: ["no_cool", "no_heat"],
    selfCheckEn: ["Confirm the thermostat is set to COOL or HEAT, not FAN", "Check that the outdoor unit is running", "Replace a clogged filter"],
    selfCheckEs: ["Confirme que el termostato esté en COOL o HEAT, no en FAN", "Verifique que la unidad exterior esté funcionando", "Cambie el filtro si está tapado"],
  },
  {
    id: "no_power",
    titleEn: "System has no power",
    titleEs: "El sistema no tiene energía",
    detailEn:
      "A blank thermostat or a system that will not start is often a tripped breaker, a blown low-voltage fuse, a full condensate pan triggering the float switch, or a failed control board.",
    detailEs:
      "Un termostato en blanco o un sistema que no arranca suele deberse a un breaker botado, un fusible de bajo voltaje quemado, una bandeja de condensado llena que activó el flotador, o una tarjeta de control dañada.",
    urgency: "URGENT",
    serviceType: "REPAIR",
    triggers: ["wont_start", "thermostat", "no_air"],
    selfCheckEn: ["Check the breaker panel for a tripped HVAC breaker", "Replace the thermostat batteries", "Confirm the service switch by the indoor unit is ON", "Check that the condensate drain isn't clogged"],
    selfCheckEs: ["Revise el panel de breakers por si el del HVAC se botó", "Cambie las baterías del termostato", "Confirme que el interruptor junto a la unidad interior esté en ON", "Revise que el drenaje de condensado no esté tapado"],
  },
  {
    id: "mechanical_failure",
    titleEn: "Mechanical failure in progress",
    titleEs: "Falla mecánica en curso",
    detailEn:
      "Grinding, banging or squealing usually means a failing blower or condenser motor, a loose blower wheel, or a compressor under stress. Continuing to run the system turns a repair into a replacement.",
    detailEs:
      "Un ruido de rechinado, golpeteo o chirrido suele indicar un motor de ventilador o condensador fallando, una turbina suelta, o un compresor forzado. Seguir usando el sistema convierte una reparación en un reemplazo.",
    urgency: "URGENT",
    serviceType: "REPAIR",
    triggers: ["loud_noise"],
  },
  {
    id: "short_cycle",
    titleEn: "Short cycling",
    titleEs: "Ciclado corto",
    detailEn:
      "Turning on and off every few minutes wastes energy and wears the compressor. Typical causes are a dirty filter, a failing capacitor, an oversized system, or a thermostat placed near a heat source.",
    detailEs:
      "Prenderse y apagarse cada pocos minutos desperdicia energía y desgasta el compresor. Las causas típicas son filtro sucio, capacitor fallando, un sistema sobredimensionado, o un termostato ubicado cerca de una fuente de calor.",
    urgency: "STANDARD",
    serviceType: "REPAIR",
    triggers: ["short_cycling", "high_bill"],
    selfCheckEn: ["Replace the air filter", "Move lamps or electronics away from the thermostat"],
    selfCheckEs: ["Cambie el filtro de aire", "Aleje lámparas o electrónicos del termostato"],
  },
  {
    id: "drainage",
    titleEn: "Condensate drainage problem",
    titleEs: "Problema de drenaje del condensado",
    detailEn:
      "Water around the indoor unit means the condensate line or pump is blocked. Left alone it causes ceiling and drywall damage, and the safety float will eventually shut the system down.",
    detailEs:
      "Agua alrededor de la unidad interior significa que la línea o la bomba de condensado está bloqueada. Si se deja así causa daños en techo y paneles, y el flotador de seguridad terminará apagando el sistema.",
    urgency: "URGENT",
    serviceType: "REPAIR",
    triggers: ["water_leak"],
    selfCheckEn: ["Turn the system off to stop more water accumulating", "Empty any overflow pan you can safely reach"],
    selfCheckEs: ["Apague el sistema para que no se acumule más agua", "Vacíe la bandeja de desborde si puede alcanzarla con seguridad"],
  },
  {
    id: "airflow_balance",
    titleEn: "Airflow or duct distribution issue",
    titleEs: "Problema de flujo de aire o distribución de ductos",
    detailEn:
      "Rooms at very different temperatures usually point to leaking or undersized ductwork, missing returns, or a system that needs zoning. Duct leakage alone commonly wastes 20–30% of conditioned air.",
    detailEs:
      "Habitaciones con temperaturas muy distintas suelen indicar ductos con fugas o subdimensionados, falta de retornos, o un sistema que necesita zonificación. Solo las fugas de ductos suelen desperdiciar entre 20% y 30% del aire acondicionado.",
    urgency: "STANDARD",
    serviceType: "DUCTWORK",
    triggers: ["uneven", "no_air"],
  },
  {
    id: "iaq",
    titleEn: "Indoor air quality opportunity",
    titleEs: "Oportunidad de mejorar la calidad del aire",
    detailEn:
      "Musty smells, humidity above 60%, and constant dust are solved with better filtration, UV treatment or whole-home dehumidification rather than with a repair.",
    detailEs:
      "Los olores a humedad, la humedad por encima del 60% y el polvo constante se resuelven con mejor filtración, tratamiento UV o deshumidificación para toda la casa, más que con una reparación.",
    urgency: "STANDARD",
    serviceType: "INDOOR_AIR",
    triggers: ["humidity", "dust", "odor"],
  },
  {
    id: "efficiency",
    titleEn: "Efficiency review recommended",
    titleEs: "Se recomienda una revisión de eficiencia",
    detailEn:
      "A bill that jumped without a change in habits usually means the system is working harder than it should. A tune-up recovers most of it; if the unit is over 12 years old, a replacement quote is worth comparing.",
    detailEs:
      "Una factura que subió sin cambiar hábitos suele significar que el sistema está trabajando más de lo debido. Un mantenimiento recupera buena parte; si el equipo tiene más de 12 años, vale la pena comparar una cotización de reemplazo.",
    urgency: "STANDARD",
    serviceType: "MAINTENANCE",
    triggers: ["high_bill"],
  },
];

const URGENCY_RANK: Record<Urgency, number> = { EMERGENCY: 3, URGENT: 2, STANDARD: 1 };

export type DiagnosisResult = {
  urgency: Urgency;
  findings: Finding[];
  /** Best service type to pre-select in the booking form. */
  recommendedService: Finding["serviceType"];
  /** True when the customer should call instead of booking online. */
  callImmediately: boolean;
};

export function diagnose(symptomIds: string[]): DiagnosisResult {
  const selected = new Set(symptomIds);

  const matched = FINDINGS.filter((finding) =>
    finding.triggers.some((trigger) => selected.has(trigger)),
  ).sort((a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]);

  if (matched.length === 0) {
    const tuneUp = FINDINGS.find((f) => f.id === "efficiency")!;
    return {
      urgency: "STANDARD",
      findings: [tuneUp],
      recommendedService: "MAINTENANCE",
      callImmediately: false,
    };
  }

  const urgency = matched[0].urgency;
  return {
    urgency,
    findings: matched.slice(0, 4),
    recommendedService: matched[0].serviceType,
    callImmediately: urgency === "EMERGENCY",
  };
}
