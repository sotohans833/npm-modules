/**
 * Seeds the service area, plans, promotions, technicians and a small amount of
 * demo activity so the admin dashboard has something to render on first run.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* Service area                                                                */
/* -------------------------------------------------------------------------- */

const CORE = [
  // Durham
  ["27701", "Durham", "Durham"], ["27703", "Durham", "Durham"], ["27704", "Durham", "Durham"],
  ["27705", "Durham", "Durham"], ["27707", "Durham", "Durham"], ["27709", "Durham", "Durham"],
  ["27712", "Durham", "Durham"], ["27713", "Durham", "Durham"],
  // Raleigh
  ["27601", "Raleigh", "Wake"], ["27603", "Raleigh", "Wake"], ["27604", "Raleigh", "Wake"],
  ["27605", "Raleigh", "Wake"], ["27606", "Raleigh", "Wake"], ["27607", "Raleigh", "Wake"],
  ["27608", "Raleigh", "Wake"], ["27609", "Raleigh", "Wake"], ["27610", "Raleigh", "Wake"],
  ["27612", "Raleigh", "Wake"], ["27613", "Raleigh", "Wake"], ["27614", "Raleigh", "Wake"],
  ["27615", "Raleigh", "Wake"], ["27616", "Raleigh", "Wake"], ["27617", "Raleigh", "Wake"],
  // Chapel Hill / Carrboro
  ["27514", "Chapel Hill", "Orange"], ["27516", "Chapel Hill", "Orange"],
  ["27517", "Chapel Hill", "Orange"], ["27510", "Carrboro", "Orange"],
  // Cary / Apex / Morrisville
  ["27511", "Cary", "Wake"], ["27513", "Cary", "Wake"], ["27518", "Cary", "Wake"],
  ["27519", "Cary", "Wake"], ["27502", "Apex", "Wake"], ["27523", "Apex", "Wake"],
  ["27560", "Morrisville", "Wake"],
];

// Outer ring: still served, with a trip surcharge.
const OUTER = [
  ["27278", "Hillsborough", "Orange", 2900],
  ["27587", "Wake Forest", "Wake", 2900],
  ["27529", "Garner", "Wake", 2900],
  ["27540", "Holly Springs", "Wake", 2900],
];

/* -------------------------------------------------------------------------- */

async function main() {
  console.log("Seeding…");

  // --- Service area --------------------------------------------------------
  for (const [zip, city, county] of CORE) {
    await prisma.serviceZip.upsert({
      where: { zip },
      create: { zip, city, county, feeCents: 0 },
      update: { city, county, feeCents: 0 },
    });
  }
  for (const [zip, city, county, feeCents] of OUTER) {
    await prisma.serviceZip.upsert({
      where: { zip },
      create: { zip, city, county, feeCents },
      update: { city, county, feeCents },
    });
  }

  // --- Maintenance plans ---------------------------------------------------
  const plans = [
    {
      id: "comfort",
      nameEn: "Comfort Club",
      nameEs: "Club Confort",
      monthlyCents: 1499,
      yearlyCents: 15900,
      visitsPerYear: 2,
      discountPct: 10,
      sortOrder: 1,
      perksEn: [
        "Two 21-point tune-ups a year",
        "10% off every repair",
        "Priority scheduling",
        "No overtime charge on emergency calls",
      ],
      perksEs: [
        "Dos mantenimientos de 21 puntos al año",
        "10% de descuento en cada reparación",
        "Agendamiento prioritario",
        "Sin recargo por horario extendido en emergencias",
      ],
    },
    {
      id: "comfort-plus",
      nameEn: "Comfort Club Plus",
      nameEs: "Club Confort Plus",
      monthlyCents: 2499,
      yearlyCents: 26900,
      visitsPerYear: 2,
      discountPct: 15,
      highlighted: true,
      sortOrder: 2,
      perksEn: [
        "Everything in Comfort Club",
        "15% off every repair",
        "Standard filters included and delivered",
        "Free duct inspection each year",
        "Waived $89 diagnostic fee",
      ],
      perksEs: [
        "Todo lo del Club Confort",
        "15% de descuento en cada reparación",
        "Filtros estándar incluidos y entregados a domicilio",
        "Inspección de ductos gratis cada año",
        "Sin cargo de diagnóstico de $89",
      ],
    },
    {
      id: "total-care",
      nameEn: "Total Care",
      nameEs: "Cuidado Total",
      monthlyCents: 3999,
      yearlyCents: 42900,
      visitsPerYear: 3,
      discountPct: 20,
      sortOrder: 3,
      perksEn: [
        "Everything in Comfort Club Plus",
        "Three visits a year, including a mid-summer check",
        "20% off every repair",
        "Same-day service guarantee, year round",
        "Annual electrical safety inspection",
        "$250 loyalty credit toward a future replacement, each year",
      ],
      perksEs: [
        "Todo lo del Club Confort Plus",
        "Tres visitas al año, incluida una revisión a mitad de verano",
        "20% de descuento en cada reparación",
        "Garantía de servicio el mismo día, todo el año",
        "Inspección eléctrica de seguridad anual",
        "$250 de crédito de lealtad para un reemplazo futuro, cada año",
      ],
    },
  ];

  for (const plan of plans) {
    const data = {
      ...plan,
      perksEn: JSON.stringify(plan.perksEn),
      perksEs: JSON.stringify(plan.perksEs),
    };
    await prisma.maintenancePlan.upsert({ where: { id: plan.id }, create: data, update: data });
  }

  // --- Promotions ----------------------------------------------------------
  const now = new Date();
  const year = now.getFullYear();
  // Keep the seasonal promo in the future whenever the seed is re-run, so the
  // demo never ships with an already-expired coupon.
  const springExpiry = new Date(year, 5, 30);
  if (springExpiry < now) springExpiry.setFullYear(year + 1);
  const winterExpiry = new Date(year, 11, 31);
  if (winterExpiry < now) winterExpiry.setFullYear(year + 1);
  const coupons = [
    {
      code: "SPRING25",
      titleEn: "$25 off a spring tune-up",
      titleEs: "$25 de descuento en el mantenimiento de primavera",
      descriptionEn: "Book any preventive maintenance visit before June 30 and take $25 off.",
      descriptionEs: "Agende cualquier visita de mantenimiento preventivo antes del 30 de junio y reciba $25 de descuento.",
      amountCents: 2500,
      appliesTo: "MAINTENANCE",
      expiresAt: springExpiry,
    },
    {
      code: "NEWCUST50",
      titleEn: "$50 off your first repair",
      titleEs: "$50 de descuento en su primera reparación",
      descriptionEn: "First-time customers save $50 on any diagnosed repair.",
      descriptionEs: "Los clientes nuevos ahorran $50 en cualquier reparación diagnosticada.",
      amountCents: 5000,
      appliesTo: "REPAIR",
      expiresAt: null,
    },
    {
      code: "HEATPUMP500",
      titleEn: "$500 off a qualifying heat pump",
      titleEs: "$500 de descuento en bombas de calor que califican",
      descriptionEn: "Applies to high-efficiency heat pump replacements, stacks with utility rebates.",
      descriptionEs: "Aplica a reemplazos de bombas de calor de alta eficiencia, combinable con reembolsos de la eléctrica.",
      amountCents: 50000,
      appliesTo: "INSTALL_ESTIMATE",
      expiresAt: winterExpiry,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      create: coupon,
      update: coupon,
    });
  }

  // --- Technicians ---------------------------------------------------------
  const technicians = [
    { name: "Marcus T.", skills: ["HVAC", "IAQ"] },
    { name: "Devon R.", skills: ["HVAC"] },
    { name: "Luis A.", skills: ["HVAC", "ELECTRICAL"] },
    { name: "Priya S.", skills: ["HVAC", "DUCTWORK"] },
    { name: "Ray C.", skills: ["ELECTRICAL"] },
  ];

  if ((await prisma.technician.count()) === 0) {
    for (const tech of technicians) {
      await prisma.technician.create({
        data: { name: tech.name, skills: JSON.stringify(tech.skills) },
      });
    }
  }

  // --- Demo accounts -------------------------------------------------------
  const adminPassword = await bcrypt.hash("Admin1234!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@allweather.test" },
    create: {
      email: "admin@allweather.test",
      name: "Dispatch Desk",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "(919) 967-9775",
      city: "Durham",
      zip: "27703",
    },
    update: { passwordHash: adminPassword, role: "ADMIN" },
  });

  const customerPassword = await bcrypt.hash("Demo1234!", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@allweather.test" },
    create: {
      email: "customer@allweather.test",
      name: "Demo Customer",
      passwordHash: customerPassword,
      phone: "(919) 555-0142",
      address: "812 Hearthside St",
      city: "Durham",
      zip: "27703",
      locale: "es",
      planId: "comfort-plus",
    },
    update: { passwordHash: customerPassword },
  });

  // --- Demo equipment, reminders, appointments and quotes ------------------
  if ((await prisma.equipment.count({ where: { userId: customer.id } })) === 0) {
    await prisma.equipment.create({
      data: {
        userId: customer.id,
        nickname: "Main floor",
        type: "HEAT_PUMP",
        brand: "Carrier",
        modelNumber: "25HCB6",
        installYear: new Date().getFullYear() - 9,
        tonnage: 3,
        lastServiceAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
      },
    });
    await prisma.equipment.create({
      data: {
        userId: customer.id,
        nickname: "Upstairs",
        type: "AC",
        brand: "Goodman",
        installYear: new Date().getFullYear() - 15,
        tonnage: 2,
      },
    });
  }

  if ((await prisma.reminder.count({ where: { userId: customer.id } })) === 0) {
    await prisma.reminder.createMany({
      data: [
        {
          userId: customer.id,
          titleEn: "Replace the 1-inch filters on both systems",
          titleEs: "Cambie los filtros de 1 pulgada de ambos sistemas",
          dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        },
        {
          userId: customer.id,
          titleEn: "Fall heating check — included with your plan",
          titleEs: "Revisión de calefacción de otoño — incluida en su plan",
          dueAt: new Date(new Date().getFullYear(), 9, 1),
        },
      ],
    });
  }

  if ((await prisma.appointment.count()) === 0) {
    const reference = (suffix) => `AW-DEMO${suffix}`;
    const day = (offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      date.setHours(0, 0, 0, 0);
      // Sundays are emergency-only, so demo data skips them.
      if (date.getDay() === 0) date.setDate(date.getDate() + 1);
      return date;
    };

    await prisma.appointment.createMany({
      data: [
        {
          reference: reference("01"), userId: customer.id,
          name: "Demo Customer", email: "customer@allweather.test", phone: "(919) 555-0142",
          address: "812 Hearthside St", city: "Durham", zip: "27703",
          serviceType: "MAINTENANCE", systemType: "HEAT_PUMP", date: day(3),
          timeSlot: "10:00-12:00", status: "CONFIRMED", locale: "es",
        },
        {
          reference: reference("02"),
          name: "Jordan Ellis", email: "jordan@example.test", phone: "(919) 555-0177",
          address: "4410 Savannah Ave", city: "Raleigh", zip: "27604",
          serviceType: "REPAIR", systemType: "AC", urgency: "URGENT", date: day(1),
          timeSlot: "08:00-10:00", status: "ASSIGNED", technician: "Devon R.",
          symptoms: JSON.stringify(["no_cool", "ice"]),
        },
        {
          reference: reference("03"),
          name: "Alicia Moreno", email: "alicia@example.test", phone: "(919) 555-0199",
          address: "127 Baltic Ave", city: "Chapel Hill", zip: "27516",
          serviceType: "INSTALL_ESTIMATE", systemType: "FURNACE", date: day(4),
          timeSlot: "14:00-16:00", status: "REQUESTED", locale: "es",
        },
        {
          reference: reference("04"), userId: customer.id,
          name: "Demo Customer", email: "customer@allweather.test", phone: "(919) 555-0142",
          address: "812 Hearthside St", city: "Durham", zip: "27703",
          serviceType: "REPAIR", systemType: "AC", date: day(-45),
          timeSlot: "12:00-14:00", status: "COMPLETED", technician: "Marcus T.",
          notes: "Replaced dual-run capacitor on the upstairs condenser.",
        },
        {
          reference: reference("05"),
          name: "Priya Raman", email: "priya@example.test", phone: "(919) 555-0121",
          address: "900 Capps St", city: "Cary", zip: "27511",
          serviceType: "INDOOR_AIR", date: day(6), timeSlot: "16:00-18:00", status: "REQUESTED",
        },
      ],
    });
  }

  if ((await prisma.quote.count()) === 0) {
    await prisma.quote.createMany({
      data: [
        {
          reference: "QT-DEMO01", userId: customer.id,
          name: "Demo Customer", email: "customer@allweather.test", phone: "(919) 555-0142",
          zip: "27703", kind: "SYSTEM",
          answers: JSON.stringify({
            kind: "SYSTEM", systemType: "HEAT_PUMP", tons: 3, efficiency: "HIGH",
            brandTier: "STANDARD", ductCondition: "MINOR_REPAIR", smartThermostat: true,
          }),
          summary: "Bomba de calor · 3 ton · Alta (≈17 SEER2) · ductos: Necesitan sellado y reparaciones menores",
          estimateLow: 10500, estimateHi: 13400, status: "SENT", locale: "es",
        },
        {
          reference: "QT-DEMO02",
          name: "Jordan Ellis", email: "jordan@example.test", phone: "(919) 555-0177",
          zip: "27604", kind: "PART",
          answers: JSON.stringify({ kind: "PART", part: "COMPRESSOR", emergency: true }),
          summary: "Compressor (after hours)", estimateLow: 2350, estimateHi: 3250, status: "NEW",
        },
        {
          reference: "QT-DEMO03",
          name: "Alicia Moreno", email: "alicia@example.test", phone: "(919) 555-0199",
          zip: "27516", kind: "INDOOR_AIR",
          answers: JSON.stringify({ kind: "INDOOR_AIR", products: ["AIR_PURIFIER", "UV_LAMP"] }),
          summary: "Purificador de aire activo, Lámpara germicida UV",
          estimateLow: 1950, estimateHi: 2450, status: "WON", locale: "es",
        },
      ],
    });
  }

  console.log(`Seed complete.
  Admin:    admin@allweather.test / Admin1234!
  Customer: customer@allweather.test / Demo1234!`);
  console.log(`Users: ${await prisma.user.count()}, ZIPs: ${await prisma.serviceZip.count()}, admin id ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
