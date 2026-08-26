import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { appointmentSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import {
  CAPACITY_PER_SLOT,
  TIME_SLOTS,
  fromDateKey,
  isBookableDate,
  makeReference,
} from "@/lib/scheduling";
import { notifyAppointment } from "@/lib/notifications";
import { SERVICE_TYPES } from "@/lib/scheduling";

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, appointmentSchema);
  if (response) return response;

  const date = fromDateKey(data.date);
  if (Number.isNaN(date.getTime()) || !isBookableDate(date)) return fail("DATE_UNAVAILABLE", 422);
  if (!TIME_SLOTS.some((slot) => slot.id === data.timeSlot)) return fail("INVALID_SLOT", 422);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Capacity is re-checked here rather than trusting the calendar the browser
  // rendered, which may be minutes stale.
  const taken = await prisma.appointment.count({
    where: { date: { gte: date, lte: dayEnd }, timeSlot: data.timeSlot, status: { not: "CANCELLED" } },
  });
  if (taken >= CAPACITY_PER_SLOT) return fail("SLOT_FULL", 409);

  const user = await getCurrentUser();

  // An equipment id from the client is only honoured if it really belongs to
  // the signed-in customer.
  let equipmentId: string | undefined;
  if (data.equipmentId && user) {
    const owned = await prisma.equipment.findFirst({
      where: { id: data.equipmentId, userId: user.id },
      select: { id: true },
    });
    equipmentId = owned?.id;
  }

  let couponCode: string | undefined;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
    const valid =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.appliesTo === "ANY" || coupon.appliesTo === data.serviceType);
    if (valid) couponCode = coupon.code;
  }

  const appointment = await prisma.appointment.create({
    data: {
      reference: makeReference("AW"),
      userId: user?.id,
      equipmentId,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      address: data.address,
      city: data.city,
      zip: data.zip,
      serviceType: data.serviceType,
      systemType: data.systemType,
      urgency: data.urgency,
      date,
      timeSlot: data.timeSlot,
      symptoms: data.symptoms?.length ? JSON.stringify(data.symptoms) : null,
      notes: data.notes,
      couponCode,
      locale: data.locale,
    },
  });

  const serviceLabel =
    SERVICE_TYPES.find((entry) => entry.id === data.serviceType)?.[data.locale] ?? data.serviceType;

  await notifyAppointment({
    reference: appointment.reference,
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone,
    address: appointment.address,
    city: appointment.city,
    zip: appointment.zip,
    serviceLabel,
    date,
    timeSlot: appointment.timeSlot,
    locale: data.locale,
  });

  return ok({ appointment: { id: appointment.id, reference: appointment.reference } }, 201);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: { equipment: { select: { id: true, nickname: true } } },
  });

  return ok({ appointments });
}
