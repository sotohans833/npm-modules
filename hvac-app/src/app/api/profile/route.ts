import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { profileSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const { data, response } = await parseBody(request, profileSchema);
  if (response) return response;

  if (data.zip && !/^\d{5}$/.test(data.zip)) return fail("INVALID_ZIP", 422);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name.trim(),
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      zip: data.zip || null,
      locale: data.locale,
    },
    select: { id: true, name: true, email: true, phone: true, address: true, city: true, zip: true, locale: true },
  });

  return ok({ user: updated });
}
