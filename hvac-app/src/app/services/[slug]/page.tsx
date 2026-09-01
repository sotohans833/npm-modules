import { en } from "@/i18n";
import { ServiceDetail } from "./ServiceDetail";

export function generateStaticParams() {
  return en.services.items.map((service) => ({ slug: service.slug }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}
