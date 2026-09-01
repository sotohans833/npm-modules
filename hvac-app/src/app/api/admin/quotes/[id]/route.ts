import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { adminQuotePatch } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return fail(error, error === "UNAUTHENTICATED" ? 401 : 403);

  const { data, response } = await parseBody(request, adminQuotePatch);
  if (response) return response;

  const existing = await prisma.quote.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return fail("NOT_FOUND", 404);

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes } : {}),
    },
  });

  return ok({ quote });
}
