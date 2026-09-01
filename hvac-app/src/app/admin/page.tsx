import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = { title: "Operations" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/portal");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const weekAhead = new Date(now.getTime() + 7 * 86_400_000);
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [appointments, quotes, technicians, weekCount, newCustomers] = await Promise.all([
    prisma.appointment.findMany({ orderBy: { date: "desc" }, take: 200 }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.technician.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.appointment.count({
      where: { date: { gte: weekAgo, lte: weekAhead }, status: { not: "CANCELLED" } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: monthAgo } } }),
  ]);

  return (
    <AdminDashboard
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
      technicians={technicians.map((technician) => technician.name)}
      weekCount={weekCount}
      newCustomers={newCustomers}
    />
  );
}
