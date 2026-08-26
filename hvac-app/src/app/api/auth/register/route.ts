import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { hashPassword, startSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, registerSchema);
  if (response) return response;

  const email = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return fail("EMAIL_TAKEN", 409);

  const user = await prisma.user.create({
    data: {
      email,
      name: data.name.trim(),
      phone: data.phone,
      zip: data.zip,
      locale: data.locale,
      passwordHash: await hashPassword(data.password),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  // Any bookings this person already made as a guest belong to them now.
  await prisma.appointment.updateMany({
    where: { email, userId: null },
    data: { userId: user.id },
  });
  await prisma.quote.updateMany({
    where: { email, userId: null },
    data: { userId: user.id },
  });

  // A new account starts with the two seasonal reminders everyone needs.
  const now = new Date();
  await prisma.reminder.createMany({
    data: [
      {
        userId: user.id,
        titleEn: "Book the spring AC tune-up before the first hot week",
        titleEs: "Agende el mantenimiento de primavera antes de la primera semana de calor",
        dueAt: new Date(now.getFullYear() + (now.getMonth() > 2 ? 1 : 0), 2, 15),
      },
      {
        userId: user.id,
        titleEn: "Book the fall heating check before the first cold night",
        titleEs: "Agende la revisión de calefacción antes de la primera noche fría",
        dueAt: new Date(now.getFullYear() + (now.getMonth() > 9 ? 1 : 0), 9, 1),
      },
    ],
  });

  await startSession(user.id);
  return ok({ user }, 201);
}
