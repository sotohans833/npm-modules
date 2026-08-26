import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  // Scoping the delete to the owner keeps another customer's id from matching.
  const result = await prisma.equipment.deleteMany({ where: { id, userId: user.id } });
  if (result.count === 0) return fail("NOT_FOUND", 404);

  return ok({ deleted: true });
}
