import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { equipmentSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const equipment = await prisma.equipment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return ok({ equipment });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", 401);

  const { data, response } = await parseBody(request, equipmentSchema);
  if (response) return response;

  const equipment = await prisma.equipment.create({
    data: {
      userId: user.id,
      nickname: data.nickname,
      type: data.type,
      brand: data.brand || null,
      modelNumber: data.modelNumber || null,
      serialNumber: data.serialNumber || null,
      installYear: data.installYear,
      tonnage: data.tonnage,
      notes: data.notes || null,
    },
  });

  return ok({ equipment }, 201);
}
