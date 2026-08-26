export type Block =
  | { type: "p"; en: string; es: string }
  | { type: "h"; en: string; es: string }
  | { type: "ul"; en: string[]; es: string[] }
  | { type: "callout"; en: string; es: string };

export type Post = {
  slug: string;
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER" | "ANY";
  readMinutes: number;
  date: string;
  title: { en: string; es: string };
  excerpt: { en: string; es: string };
  body: Block[];
};

export const POSTS: Post[] = [
  {
    slug: "spring-ac-checklist",
    season: "SPRING",
    readMinutes: 5,
    date: "2026-03-18",
    title: {
      en: "The 8-point check to run before the first hot week",
      es: "La revisión de 8 puntos antes de la primera semana de calor",
    },
    excerpt: {
      en: "Most July emergency calls were visible in March. Here's what to look at while it's still cheap to fix.",
      es: "La mayoría de emergencias de julio ya se veían venir en marzo. Esto es lo que debe revisar mientras arreglarlo aún es barato.",
    },
    body: [
      {
        type: "p",
        en: "Air conditioners rarely fail without warning. They fail on the first 95-degree day because that's the first day they're asked to run for eight hours straight — and the weak part gives out under load, not at idle. Everything below can be checked in about twenty minutes on a Saturday morning.",
        es: "Los aires acondicionados casi nunca fallan sin aviso. Fallan el primer día de 35 grados porque es el primer día que se les pide funcionar ocho horas seguidas — y la pieza débil cede bajo carga, no en reposo. Todo lo de abajo se revisa en unos veinte minutos un sábado por la mañana.",
      },
      { type: "h", en: "What you can check yourself", es: "Lo que puede revisar usted mismo" },
      {
        type: "ul",
        en: [
          "Replace the filter. If you can't see light through it, it's been restricting airflow for weeks.",
          "Clear two feet around the outdoor unit — leaves, mulch, that shrub that grew all winter.",
          "Rinse the outdoor coil with a garden hose, top to bottom, with the breaker off. No pressure washer.",
          "Pour a cup of distilled vinegar down the condensate drain line to clear early algae growth.",
          "Check that every supply and return vent is open. Closing vents in unused rooms raises static pressure and shortens blower life.",
          "Set the thermostat to cool, drop it five degrees, and confirm the outdoor fan spins up within a minute.",
          "Put your hand on the large insulated refrigerant line at the outdoor unit: it should feel cold and slightly sweaty, not warm.",
          "Listen for a hum with no fan movement — that's usually a failing capacitor, a $250 part that takes the compressor with it if ignored.",
        ],
        es: [
          "Cambie el filtro. Si no ve la luz a través de él, lleva semanas restringiendo el flujo de aire.",
          "Despeje dos pies alrededor de la unidad exterior — hojas, mantillo, ese arbusto que creció todo el invierno.",
          "Enjuague el serpentín exterior con una manguera, de arriba hacia abajo, con el breaker apagado. Nada de hidrolavadora.",
          "Vierta una taza de vinagre destilado por la línea de drenaje del condensado para eliminar algas incipientes.",
          "Verifique que todas las rejillas de suministro y retorno estén abiertas. Cerrar rejillas en habitaciones desocupadas sube la presión estática y acorta la vida del ventilador.",
          "Ponga el termostato en frío, bájelo cinco grados y confirme que el ventilador exterior arranque en menos de un minuto.",
          "Toque la tubería grande y aislada de refrigerante en la unidad exterior: debe sentirse fría y ligeramente húmeda, no tibia.",
          "Escuche si hay un zumbido sin que gire el ventilador — eso suele ser un capacitor fallando, una pieza de $250 que se lleva el compresor por delante si se ignora.",
        ],
      },
      {
        type: "callout",
        en: "If the outdoor line is warm while the system runs, stop and call. Running low on refrigerant is how a $400 leak repair becomes a $2,300 compressor.",
        es: "Si la tubería exterior está tibia mientras el sistema funciona, deténgase y llame. Operar con poco refrigerante es como una fuga de $400 se convierte en un compresor de $2,300.",
      },
      { type: "h", en: "What needs a technician", es: "Lo que necesita un técnico" },
      {
        type: "p",
        en: "Refrigerant charge, capacitor microfarad readings, amp draw on the compressor and blower, and the temperature split across the coil all need gauges and a meter. Those four measurements are what separate a real tune-up from a hose-down, and they're the ones that predict a failure before it happens.",
        es: "La carga de refrigerante, la lectura de microfaradios del capacitor, el amperaje del compresor y del ventilador, y el diferencial de temperatura en el serpentín requieren manómetros y multímetro. Esas cuatro mediciones son las que separan un mantenimiento real de un simple lavado, y son las que predicen una falla antes de que ocurra.",
      },
    ],
  },
  {
    slug: "why-humid-with-ac-running",
    season: "SUMMER",
    readMinutes: 4,
    date: "2026-06-02",
    title: {
      en: "Why your house feels clammy even though the AC is running",
      es: "Por qué su casa se siente húmeda aunque el aire esté funcionando",
    },
    excerpt: {
      en: "In North Carolina, humidity is half the comfort problem — and an oversized system is usually the cause.",
      es: "En Carolina del Norte, la humedad es la mitad del problema de confort — y un sistema sobredimensionado suele ser la causa.",
    },
    body: [
      {
        type: "p",
        en: "An air conditioner does two jobs: it lowers the temperature, and it pulls water out of the air. The second one only happens while the system is actually running. A unit that's too large for the house hits the thermostat setpoint in eight minutes, shuts off, and never runs long enough to dehumidify. The thermostat says 72. The house feels like 78 and smells faintly of a basement.",
        es: "Un aire acondicionado hace dos trabajos: baja la temperatura y saca agua del aire. El segundo solo ocurre mientras el sistema está funcionando. Una unidad demasiado grande para la casa alcanza la temperatura del termostato en ocho minutos, se apaga y nunca funciona lo suficiente para deshumidificar. El termostato dice 72. La casa se siente como 78 y huele levemente a sótano.",
      },
      { type: "h", en: "How to tell it's a sizing problem", es: "Cómo saber si es un problema de dimensionamiento" },
      {
        type: "ul",
        en: [
          "Cycles shorter than about ten minutes on a hot afternoon",
          "Indoor humidity above 60% on a hygrometer while the system runs",
          "The house cools fast but never feels dry",
          "Cold spots near the vents and stuffy air everywhere else",
        ],
        es: [
          "Ciclos de menos de unos diez minutos en una tarde calurosa",
          "Humedad interior por encima del 60% en un higrómetro mientras el sistema funciona",
          "La casa enfría rápido pero nunca se siente seca",
          "Puntos fríos cerca de las rejillas y aire pesado en el resto",
        ],
      },
      { type: "h", en: "What actually fixes it", es: "Qué lo soluciona de verdad" },
      {
        type: "p",
        en: "Raising the thermostat a degree or two lengthens run time and often helps more than lowering it. Beyond that, a variable-speed system that can run at 40% capacity for long stretches solves it properly, and a whole-home dehumidifier solves it without replacing equipment. Both start with a load calculation — guessing a second time is how the house ended up oversized in the first place.",
        es: "Subir el termostato uno o dos grados alarga el tiempo de operación y suele ayudar más que bajarlo. Más allá de eso, un sistema de velocidad variable que puede operar al 40% de capacidad por periodos largos lo resuelve bien, y un deshumidificador para toda la casa lo resuelve sin cambiar el equipo. Ambos empiezan con un cálculo de carga — adivinar por segunda vez es como la casa terminó sobredimensionada la primera vez.",
      },
    ],
  },
  {
    slug: "furnace-first-run-smell",
    season: "FALL",
    readMinutes: 3,
    date: "2026-10-08",
    title: {
      en: "That burning smell the first time the heat comes on",
      es: "Ese olor a quemado la primera vez que enciende la calefacción",
    },
    excerpt: {
      en: "Usually harmless dust. Sometimes not. Here's how to tell the difference in about five minutes.",
      es: "Normalmente es polvo inofensivo. A veces no. Así se distingue en unos cinco minutos.",
    },
    body: [
      {
        type: "p",
        en: "Dust settles on the heat exchanger over six idle months. The first burn cycle of the season cooks it off, and the house smells like a hot iron for ten or fifteen minutes. That's normal, it happens once, and it fades on its own.",
        es: "El polvo se asienta sobre el intercambiador de calor durante seis meses de inactividad. El primer ciclo de la temporada lo quema, y la casa huele a plancha caliente por diez o quince minutos. Eso es normal, pasa una sola vez y se desvanece solo.",
      },
      { type: "h", en: "When to shut it off and call", es: "Cuándo apagarlo y llamar" },
      {
        type: "ul",
        en: [
          "The smell is electrical — sharp, like hot plastic or ozone — rather than dusty",
          "It lasts more than about thirty minutes, or comes back on every cycle",
          "You smell gas or rotten eggs: leave the house and call 911 from outside",
          "A CO alarm sounds: leave the house with everyone and every pet, then call 911",
          "The burner flame is yellow and lazy instead of crisp blue",
        ],
        es: [
          "El olor es eléctrico — penetrante, como plástico caliente u ozono — en vez de a polvo",
          "Dura más de unos treinta minutos, o vuelve en cada ciclo",
          "Huele a gas o a huevo podrido: salga de la casa y llame al 911 desde afuera",
          "Suena una alarma de CO: salga con todas las personas y mascotas, y llame al 911",
          "La llama del quemador es amarilla y perezosa en vez de azul y definida",
        ],
      },
      {
        type: "callout",
        en: "A cracked heat exchanger can put carbon monoxide into the air you breathe and gives no warning you'd notice on your own. Working CO alarms on every floor cost less than one service call.",
        es: "Un intercambiador de calor agrietado puede liberar monóxido de carbono al aire que respira y no da ninguna señal que usted note por su cuenta. Alarmas de CO funcionando en cada piso cuestan menos que una sola visita de servicio.",
      },
    ],
  },
  {
    slug: "seer2-explained",
    season: "ANY",
    readMinutes: 6,
    date: "2026-01-22",
    title: {
      en: "SEER2, tons and the numbers on a replacement quote",
      es: "SEER2, toneladas y los números de una cotización de reemplazo",
    },
    excerpt: {
      en: "A plain-language guide to reading an HVAC proposal so you can compare three of them fairly.",
      es: "Una guía en lenguaje sencillo para leer una propuesta de HVAC y poder comparar tres de forma justa.",
    },
    body: [
      { type: "h", en: "Tons have nothing to do with weight", es: "Las toneladas no tienen que ver con el peso" },
      {
        type: "p",
        en: "One ton of cooling equals 12,000 BTU per hour — the heat it takes to melt a ton of ice in a day, which is where the name comes from. Residential systems run from 1.5 to 5 tons. Bigger is not better: an oversized unit short-cycles, never dehumidifies, and wears out its compressor early.",
        es: "Una tonelada de enfriamiento equivale a 12,000 BTU por hora — el calor necesario para derretir una tonelada de hielo en un día, de ahí el nombre. Los sistemas residenciales van de 1.5 a 5 toneladas. Más grande no es mejor: una unidad sobredimensionada hace ciclos cortos, nunca deshumidifica y desgasta su compresor antes de tiempo.",
      },
      { type: "h", en: "SEER2 is miles per gallon", es: "El SEER2 es como el rendimiento por galón" },
      {
        type: "p",
        en: "SEER2 measures cooling output per unit of electricity across a season. The federal minimum in the Southeast is 14.3 SEER2. Going from a 20-year-old 10 SEER unit to a 17 SEER2 system cuts cooling electricity roughly in half; going from 17 to 20 saves far less and costs considerably more. The efficiency worth paying for is usually in the middle of the range, not at the top.",
        es: "El SEER2 mide el enfriamiento producido por unidad de electricidad a lo largo de una temporada. El mínimo federal en el sureste es 14.3 SEER2. Pasar de una unidad de 10 SEER con 20 años a un sistema de 17 SEER2 reduce el consumo de enfriamiento casi a la mitad; pasar de 17 a 20 ahorra mucho menos y cuesta bastante más. La eficiencia que vale la pena pagar suele estar a la mitad del rango, no en el tope.",
      },
      { type: "h", en: "What a fair quote shows you", es: "Lo que muestra una cotización justa" },
      {
        type: "ul",
        en: [
          "The model numbers of the outdoor unit, indoor coil and air handler — matched as an AHRI-certified system, not mixed and matched",
          "A load calculation, not the tonnage of the old unit copied forward",
          "Line items for permits, the new line set or a documented reason for reusing it, and haul-away",
          "The duct plan, if the ducts are staying — reusing undersized ducts wastes the efficiency you just bought",
          "Labour warranty in years, spelled out separately from the manufacturer's parts warranty",
        ],
        es: [
          "Los números de modelo de la unidad exterior, el serpentín interior y la manejadora — emparejados como un sistema certificado AHRI, no combinados al azar",
          "Un cálculo de carga, no la capacidad de la unidad vieja copiada tal cual",
          "Renglones separados para permisos, la nueva línea de refrigerante o una razón documentada para reutilizarla, y el retiro del equipo viejo",
          "El plan de ductos, si los ductos se quedan — reutilizar ductos subdimensionados desperdicia la eficiencia que acaba de comprar",
          "La garantía de mano de obra en años, especificada aparte de la garantía de piezas del fabricante",
        ],
      },
    ],
  },
  {
    slug: "winter-heat-pump-defrost",
    season: "WINTER",
    readMinutes: 4,
    date: "2026-12-05",
    title: {
      en: "Your heat pump is steaming and blowing cool air. That's normal.",
      es: "Su bomba de calor humea y sopla aire fresco. Eso es normal.",
    },
    excerpt: {
      en: "Defrost mode alarms more Triangle homeowners than any other heat pump behaviour. Here's what's happening.",
      es: "El modo descongelamiento asusta a más dueños de casa del Triángulo que cualquier otro comportamiento de una bomba de calor. Esto es lo que ocurre.",
    },
    body: [
      {
        type: "p",
        en: "In cold, damp weather a heat pump's outdoor coil builds a layer of frost. Every so often the system reverses itself for a few minutes to melt it, which is why the outdoor unit steams like something is burning and the indoor vents blow cooler air. It runs for five to fifteen minutes, then goes back to heating. Steam is water vapour, not smoke.",
        es: "En clima frío y húmedo, el serpentín exterior de una bomba de calor acumula una capa de escarcha. Cada cierto tiempo el sistema se invierte por unos minutos para derretirla, y por eso la unidad exterior humea como si algo se quemara y las rejillas interiores soplan aire más fresco. Dura de cinco a quince minutos y luego vuelve a calentar. El vapor es agua, no humo.",
      },
      { type: "h", en: "When it isn't normal", es: "Cuándo no es normal" },
      {
        type: "ul",
        en: [
          "Solid ice encasing the coil rather than light frost, or ice that never clears",
          "Defrost cycles every fifteen minutes, all day",
          "Auxiliary or emergency heat staying on for hours — that's expensive resistance heat, and your next bill will show it",
          "Water pooling and refreezing under the unit, which usually means a blocked base pan drain",
        ],
        es: [
          "Hielo sólido cubriendo el serpentín en vez de escarcha ligera, o hielo que nunca se va",
          "Ciclos de descongelamiento cada quince minutos, todo el día",
          "Calor auxiliar o de emergencia encendido por horas — esa es resistencia eléctrica cara, y su próxima factura lo mostrará",
          "Agua que se acumula y se vuelve a congelar bajo la unidad, lo que suele indicar un drenaje de bandeja bloqueado",
        ],
      },
    ],
  },
  {
    slug: "lower-summer-bill",
    season: "SUMMER",
    readMinutes: 5,
    date: "2026-05-14",
    title: {
      en: "Seven ways to cut a Carolina summer power bill that don't involve new equipment",
      es: "Siete formas de bajar la factura de verano en Carolina sin comprar equipo nuevo",
    },
    excerpt: {
      en: "Cooling is the biggest line on a Triangle summer bill. Most of these are free.",
      es: "El enfriamiento es el rubro más grande de una factura de verano en el Triángulo. La mayoría de estas medidas son gratis.",
    },
    body: [
      {
        type: "ul",
        en: [
          "Set it and leave it. Every degree below 78°F adds roughly 6–8% to cooling cost, and dropping the thermostat to 65 does not cool the house faster.",
          "Run ceiling fans in occupied rooms only. Fans cool people, not rooms — a fan in an empty room is a small space heater.",
          "Close blinds on the west side from noon onward. Direct sun through a single window can add the equivalent of a small space heater's worth of load.",
          "Change the filter monthly in summer. Restricted airflow makes the blower work harder for less cooling.",
          "Keep the outdoor unit shaded but not enclosed — two feet of clearance on all sides, and never wrap it.",
          "Seal the attic hatch and any obvious duct leaks you can reach. Duct leakage in a 130-degree attic is the most expensive air in the house.",
          "Use bathroom and kitchen exhaust fans while showering and cooking, then turn them off. Removing that moisture at the source is far cheaper than making the AC do it.",
        ],
        es: [
          "Póngalo y déjelo. Cada grado por debajo de 78°F suma entre 6% y 8% al costo de enfriamiento, y bajar el termostato a 65 no enfría la casa más rápido.",
          "Use los ventiladores de techo solo en habitaciones ocupadas. Los ventiladores enfrían personas, no habitaciones — un ventilador en un cuarto vacío es un calefactor pequeño.",
          "Cierre las persianas del lado oeste desde el mediodía. El sol directo por una sola ventana puede agregar la carga equivalente a un calefactor pequeño.",
          "Cambie el filtro cada mes en verano. El flujo de aire restringido hace que el ventilador trabaje más para enfriar menos.",
          "Mantenga la unidad exterior sombreada pero no encerrada — dos pies libres por todos lados, y nunca la envuelva.",
          "Selle la escotilla del ático y las fugas de ductos evidentes que pueda alcanzar. El aire que se fuga en un ático a 54°C es el aire más caro de la casa.",
          "Use los extractores del baño y la cocina mientras se ducha y cocina, y luego apáguelos. Sacar esa humedad en la fuente es mucho más barato que hacer que el aire acondicionado lo haga.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((post) => post.slug === slug);
}
