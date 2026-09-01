import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { adminAppointmentPatch } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return fail(error, error === "UNAUTHENTICATED" ? 401 : 403);

  const { data, response } = await parseBody(request, adminAppointmentPatch);
  if (response) return response;

  const existing = await prisma.appointment.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return fail("NOT_FOUND", 404);

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.technician !== undefined ? { technician: data.technician || null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      // Assigning a technician implies the visit is assigned, unless the
      // caller explicitly set another status in the same request.
      ...(data.technician && !data.status ? { status: "ASSIGNED" } : {}),
    },
  });

  return ok({ appointment });
}
