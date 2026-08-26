import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PortalView } from "./PortalView";

export const metadata = { title: "My account" };

export default async function PortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/portal");

  const [appointments, quotes, equipment, reminders, plan] = await Promise.all([
    prisma.appointment.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      include: { equipment: { select: { nickname: true } } },
    }),
    prisma.quote.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.equipment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.reminder.findMany({
      where: { userId: user.id, done: false },
      orderBy: { dueAt: "asc" },
    }),
    user.planId
      ? prisma.maintenancePlan.findUnique({ where: { id: user.planId } })
      : Promise.resolve(null),
  ]);

  return (
    <Suspense>
      <PortalView
        user={user}
        // Dates cross the server/client boundary as ISO strings.
        appointments={appointments.map((appointment) => ({
          ...appointment,
          date: appointment.date.toISOString(),
          createdAt: appointment.createdAt.toISOString(),
          updatedAt: appointment.updatedAt.toISOString(),
        }))}
        quotes={quotes.map((quote) => ({
          ...quote,
          createdAt: quote.createdAt.toISOString(),
          updatedAt: quote.updatedAt.toISOString(),
        }))}
        equipment={equipment.map((unit) => ({
          ...unit,
          createdAt: unit.createdAt.toISOString(),
          lastServiceAt: unit.lastServiceAt?.toISOString() ?? null,
        }))}
        reminders={reminders.map((reminder) => ({
          ...reminder,
          dueAt: reminder.dueAt.toISOString(),
          createdAt: reminder.createdAt.toISOString(),
        }))}
        plan={plan}
      />
    </Suspense>
  );
}
