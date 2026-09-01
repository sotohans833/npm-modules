import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookWizard } from "./BookWizard";

export const metadata = { title: "Book service" };

export default async function BookPage() {
  const user = await getCurrentUser();

  // Signed-in customers get their contact details and units pre-filled.
  const equipment = user
    ? await prisma.equipment.findMany({
        where: { userId: user.id },
        select: { id: true, nickname: true, type: true, brand: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <Suspense>
      <BookWizard user={user} equipment={equipment} />
    </Suspense>
  );
}
