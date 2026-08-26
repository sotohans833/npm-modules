import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Header, MobileActionBar } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { company } from "@/lib/company";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/i18n";

export const metadata: Metadata = {
  title: {
    default: `${company.name} — HVAC in Durham, Raleigh & the Triangle`,
    template: `%s · ${company.shortName}`,
  },
  description:
    "Book heating, cooling and electrical service online in Durham, Raleigh and the Triangle. Upfront pricing, 24/7 emergency dispatch, Carrier Factory Authorized Dealer.",
  metadataBase: new URL(company.site),
  openGraph: {
    type: "website",
    siteName: company.name,
    locale: "en_US",
    alternateLocale: "es_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2942",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const cookieLocale = jar.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const user = await getCurrentUser();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <LanguageProvider initialLocale={locale}>
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileActionBar />
        </LanguageProvider>
        {/* Local business structured data helps the map pack pick the site up. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HVACBusiness",
              name: company.name,
              telephone: company.phone,
              email: company.email,
              url: company.site,
              address: {
                "@type": "PostalAddress",
                streetAddress: "1301 S Briggs Ave #116",
                addressLocality: "Durham",
                addressRegion: "NC",
                postalCode: "27703",
                addressCountry: "US",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: company.rating,
                reviewCount: company.reviewCount,
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
              areaServed: [
                "Durham NC", "Raleigh NC", "Chapel Hill NC", "Carrboro NC",
                "Apex NC", "Cary NC", "Morrisville NC", "Hillsborough NC",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
