import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { QuoteWizard } from "./QuoteWizard";

export const metadata = { title: "Get an estimate" };

export default async function QuotePage() {
  const user = await getCurrentUser();
  return (
    <Suspense>
      <QuoteWizard user={user} />
    </Suspense>
  );
}
