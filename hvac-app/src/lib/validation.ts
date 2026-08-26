import { z } from "zod";

export const zipSchema = z.string().regex(/^\d{5}$/, "Enter a 5-digit ZIP code");
export const phoneSchema = z
  .string()
  .min(10)
  .max(20)
  .regex(/^[\d\s().+-]+$/, "Enter a valid phone number");
export const localeSchema = z.enum(["en", "es"]).default("en");

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  phone: phoneSchema,
  reason: z.string().min(2).max(40),
  message: z.string().min(5).max(4000),
  locale: localeSchema,
});

export const appointmentSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  phone: phoneSchema,
  address: z.string().min(4).max(200),
  city: z.string().min(2).max(80),
  zip: zipSchema,
  serviceType: z.enum([
    "MAINTENANCE",
    "REPAIR",
    "INSTALL_ESTIMATE",
    "INDOOR_AIR",
    "DUCTWORK",
    "ELECTRICAL",
  ]),
  systemType: z.string().max(30).optional(),
  urgency: z.enum(["STANDARD", "URGENT", "EMERGENCY"]).default("STANDARD"),
  /** `YYYY-MM-DD` in the customer's local time. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().min(5).max(20),
  equipmentId: z.string().optional(),
  symptoms: z.array(z.string().max(40)).max(20).optional(),
  notes: z.string().max(2000).optional(),
  couponCode: z.string().max(30).optional(),
  locale: localeSchema,
});

const partAnswers = z.object({
  kind: z.literal("PART"),
  part: z.enum([
    "CAPACITOR", "CONTACTOR", "BLOWER_MOTOR", "CONDENSER_FAN_MOTOR", "COMPRESSOR",
    "EVAPORATOR_COIL", "CONDENSER_COIL", "CONTROL_BOARD", "THERMOSTAT", "IGNITOR",
    "FLAME_SENSOR", "HEAT_EXCHANGER", "TXV_VALVE", "REFRIGERANT_LEAK", "DRAIN_PUMP",
  ]),
  underWarranty: z.boolean().optional(),
  emergency: z.boolean().optional(),
  difficultAccess: z.boolean().optional(),
});

const systemAnswers = z.object({
  kind: z.literal("SYSTEM"),
  systemType: z.enum(["AC_ONLY", "HEAT_PUMP", "FURNACE_AC", "DUAL_FUEL", "MINI_SPLIT", "PACKAGE_UNIT"]),
  tons: z.number().min(1).max(6),
  efficiency: z.enum(["STANDARD", "HIGH", "PREMIUM"]),
  brandTier: z.enum(["VALUE", "STANDARD", "PREMIUM"]),
  ductCondition: z.enum(["GOOD", "MINOR_REPAIR", "PARTIAL_REPLACE", "FULL_REPLACE"]),
  extraZones: z.number().min(0).max(5).optional(),
  smartThermostat: z.boolean().optional(),
  difficultAccess: z.boolean().optional(),
});

const ductworkAnswers = z.object({
  kind: z.literal("DUCTWORK"),
  scope: z.enum(["SEAL", "REPAIR", "REPLACE"]),
  squareFeet: z.number().min(300).max(10000),
  returns: z.number().min(0).max(6).optional(),
});

const iaqAnswers = z.object({
  kind: z.literal("INDOOR_AIR"),
  products: z
    .array(
      z.enum([
        "MEDIA_FILTER", "UV_LAMP", "AIR_PURIFIER",
        "WHOLE_HOME_HUMIDIFIER", "DEHUMIDIFIER", "ERV",
      ]),
    )
    .min(1),
});

export const quoteAnswersSchema = z.discriminatedUnion("kind", [
  partAnswers,
  systemAnswers,
  ductworkAnswers,
  iaqAnswers,
]);

export const quoteSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  phone: phoneSchema,
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  zip: zipSchema,
  answers: quoteAnswersSchema,
  locale: localeSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  password: z.string().min(8).max(200),
  phone: phoneSchema.optional(),
  zip: zipSchema.optional(),
  locale: localeSchema,
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(120),
  phone: phoneSchema.optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  zip: z.string().optional().or(z.literal("")),
  locale: localeSchema,
});

export const equipmentSchema = z.object({
  nickname: z.string().min(1).max(60),
  type: z.enum(["AC", "FURNACE", "HEAT_PUMP", "MINI_SPLIT", "PACKAGE", "WATER_HEATER"]),
  brand: z.string().max(60).optional().or(z.literal("")),
  modelNumber: z.string().max(80).optional().or(z.literal("")),
  serialNumber: z.string().max(80).optional().or(z.literal("")),
  installYear: z.number().int().min(1960).max(new Date().getFullYear() + 1).optional(),
  tonnage: z.number().min(0.5).max(30).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const leadSchema = z.object({
  email: z.email(),
  source: z.string().max(40).default("footer"),
  locale: localeSchema,
});

export const adminAppointmentPatch = z.object({
  status: z.enum(["REQUESTED", "CONFIRMED", "ASSIGNED", "COMPLETED", "CANCELLED"]).optional(),
  technician: z.string().max(80).nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export const adminQuotePatch = z.object({
  status: z.enum(["NEW", "REVIEWING", "SENT", "WON", "LOST"]).optional(),
  adminNotes: z.string().max(2000).optional(),
});
