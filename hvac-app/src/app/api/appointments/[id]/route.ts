import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

/** Customers may cancel their own upcoming visits; nothing else. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  });
  if (!appointment) return fail("NOT_FOUND", 404);
  if (appointment.status === "COMPLETED") return fail("ALREADY_COMPLETED", 409);

  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  return ok({ cancelled: true });
}
