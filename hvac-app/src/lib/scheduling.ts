/**
 * Scheduling rules. Kept framework-free so the booking wizard can preview
 * availability in the browser and the API can enforce the same rules.
 */

export const TIME_SLOTS = [
  { id: "08:00-10:00", en: "8:00 – 10:00 AM", es: "8:00 – 10:00 AM" },
  { id: "10:00-12:00", en: "10:00 AM – 12:00 PM", es: "10:00 AM – 12:00 PM" },
  { id: "12:00-14:00", en: "12:00 – 2:00 PM", es: "12:00 – 2:00 PM" },
  { id: "14:00-16:00", en: "2:00 – 4:00 PM", es: "2:00 – 4:00 PM" },
  { id: "16:00-18:00", en: "4:00 – 6:00 PM", es: "4:00 – 6:00 PM" },
] as const;

export type TimeSlotId = (typeof TIME_SLOTS)[number]["id"];

/** How many crews can be dispatched in the same window. */
export const CAPACITY_PER_SLOT = 3;

/** Bookings open tomorrow and run 60 days out. Sundays are emergency-only. */
export const LEAD_TIME_DAYS = 1;
export const BOOKING_HORIZON_DAYS = 60;

export function isBookableDate(date: Date, today = new Date()): boolean {
  const start = startOfDay(today);
  const target = startOfDay(date);

  const diffDays = Math.round((target.getTime() - start.getTime()) / 86_400_000);
  if (diffDays < LEAD_TIME_DAYS || diffDays > BOOKING_HORIZON_DAYS) return false;

  // Sunday (0) is reserved for emergency dispatch, which goes through the phone.
  return target.getDay() !== 0;
}

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** `YYYY-MM-DD` in local time — `toISOString` would shift the day in UTC-05:00. */
export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Calendar grid for a month, padded to whole weeks starting on Sunday. */
export function monthGrid(year: number, month: number): Array<Date | null> {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export const SERVICE_TYPES = [
  { id: "MAINTENANCE", en: "Preventive maintenance / tune-up", es: "Mantenimiento preventivo" },
  { id: "REPAIR", en: "Repair — something isn't working", es: "Reparación — algo no funciona" },
  { id: "INSTALL_ESTIMATE", en: "Replacement estimate", es: "Cotización de reemplazo" },
  { id: "INDOOR_AIR", en: "Indoor air quality", es: "Calidad del aire interior" },
  { id: "DUCTWORK", en: "Ductwork inspection", es: "Inspección de ductos" },
  { id: "ELECTRICAL", en: "Electrical service", es: "Servicio eléctrico" },
] as const;

export type ServiceTypeId = (typeof SERVICE_TYPES)[number]["id"];

export const SYSTEM_OPTIONS = [
  { id: "AC", en: "Central air conditioner", es: "Aire acondicionado central" },
  { id: "FURNACE", en: "Gas furnace", es: "Calefactor a gas" },
  { id: "HEAT_PUMP", en: "Heat pump", es: "Bomba de calor" },
  { id: "MINI_SPLIT", en: "Ductless mini-split", es: "Mini split sin ductos" },
  { id: "PACKAGE", en: "Package unit", es: "Unidad paquete" },
  { id: "NOT_SURE", en: "I'm not sure", es: "No estoy seguro" },
] as const;

export const APPOINTMENT_STATUSES = [
  "REQUESTED",
  "CONFIRMED",
  "ASSIGNED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const QUOTE_STATUSES = ["NEW", "REVIEWING", "SENT", "WON", "LOST"] as const;

/** Short human-friendly reference like `AW-4KQ7X2`. */
export function makeReference(prefix: "AW" | "QT") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${out}`;
}
