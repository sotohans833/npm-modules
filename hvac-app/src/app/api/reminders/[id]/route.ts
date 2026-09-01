import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const result = await prisma.reminder.updateMany({
    where: { id, userId: user.id },
    data: { done: true },
  });
  if (result.count === 0) return fail("NOT_FOUND", 404);

  return ok({ done: true });
}
