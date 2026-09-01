import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { CAPACITY_PER_SLOT, TIME_SLOTS, fromDateKey, isBookableDate, toDateKey } from "@/lib/scheduling";

/**
 * Remaining capacity per arrival window for a range of days. The booking
 * calendar asks for a whole month at once so it can grey out full days without
 * a request per cell.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = params.get("from");
  const to = params.get("to");

  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return fail("INVALID_RANGE", 422);
  }

  const start = fromDateKey(from);
  const end = fromDateKey(to);
  end.setHours(23, 59, 59, 999);

  if (end < start) return fail("INVALID_RANGE", 422);

  const booked = await prisma.appointment.groupBy({
    by: ["date", "timeSlot"],
    where: {
      date: { gte: start, lte: end },
      status: { notIn: ["CANCELLED"] },
    },
    _count: { _all: true },
  });

  const taken = new Map<string, number>();
  for (const entry of booked) {
    taken.set(`${toDateKey(entry.date)}|${entry.timeSlot}`, entry._count._all);
  }

  const days: Record<string, Record<string, number>> = {};
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = toDateKey(cursor);
    if (!isBookableDate(new Date(cursor))) continue;

    const slots: Record<string, number> = {};
    for (const slot of TIME_SLOTS) {
      slots[slot.id] = Math.max(0, CAPACITY_PER_SLOT - (taken.get(`${key}|${slot.id}`) ?? 0));
    }
    days[key] = slots;
  }

  return ok({ days, capacity: CAPACITY_PER_SLOT });
}
