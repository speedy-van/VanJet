// ─── VanJet · Programmatic SEO: /[service]/[city] ────────────
// Generates landing pages for high-value service+city combos.
// English only. No car/motorcycle transport.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SITE,
  VALID_SERVICES,
  SERVICE_META,
  CITY_DATA,
} from "@/lib/seo/site";
import type { ValidService } from "@/lib/seo/site";
import {
  generateLocationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo/schema";
import { LocationPageContent } from "@/components/seo/LocationPageContent";

interface PageProps {
  params: Promise<{ service: string; city: string }>;
}

// ── Static params ─────────────────────────────────────────────

export function generateStaticParams() {
  const combos: { service: string; city: string }[] = [];
  for (const service of VALID_SERVICES) {
    for (const city of Object.keys(CITY_DATA)) {
      combos.push({ service, city });
    }
  }
  return combos;
}

// ── Metadata ──────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service, city } = await params;

  if (
    !VALID_SERVICES.includes(service as ValidService) ||
    !CITY_DATA[city]
  ) {
    return {};
  }

  const svc = SERVICE_META[service as ValidService];
  const loc = CITY_DATA[city];

  const title = `${svc.title} in ${loc.name} — ${SITE.name}`;
  const description = `${svc.description} Book ${svc.title.toLowerCase()} in ${loc.name}, ${loc.region}. Instant quotes from local verified drivers.`;

  return {
    title,
    description,
    alternates: { canonical: `/${service}/${city}` },
    openGraph: {
      title,
      description,
      url: `${SITE.baseUrl}/${service}/${city}`,
      siteName: SITE.name,
      locale: SITE.locale,
      type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────

export default async function ServiceCityPage({ params }: PageProps) {
  const { service, city } = await params;

  if (
    !VALID_SERVICES.includes(service as ValidService) ||
    !CITY_DATA[city]
  ) {
    notFound();
  }

  const svc = SERVICE_META[service as ValidService];
  const loc = CITY_DATA[city];

  // City-specific FAQs
  const faqs = [
    {
      question: `How much does ${svc.title.toLowerCase()} cost in ${loc.name}?`,
      answer: `Prices vary based on distance, items, and date. Use our instant quote calculator to get a personalised estimate for ${loc.name}. Most ${svc.title.toLowerCase()} jobs start from £40.`,
    },
    {
      question: `How quickly can I book a ${svc.title.toLowerCase()} in ${loc.name}?`,
      answer: `You can book online in under 2 minutes. Same-day and next-day availability subject to driver capacity in the ${loc.region} area.`,
    },
    {
      question: `Are VanJet drivers in ${loc.name} insured?`,
      answer: `Yes. All VanJet drivers carry goods-in-transit insurance. You can also add Standard (£10k) or Premium (£25k) cover at checkout.`,
    },
    {
      question: `What areas around ${loc.name} do you cover?`,
      answer: `We cover the entire ${loc.region} region and beyond. Enter your pickup and delivery postcodes for an exact quote.`,
    },
  ];

  const locationSchema = generateLocationSchema({
    service: svc.title,
    city: loc.name,
    region: loc.region,
    lat: loc.lat,
    lng: loc.lng,
    schemaType: svc.schema,
    description: `${svc.title} in ${loc.name}, ${loc.region}. Professional, insured, instant quotes.`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE.baseUrl },
    { name: svc.title, url: `${SITE.baseUrl}/${service}` },
    { name: loc.name, url: `${SITE.baseUrl}/${service}/${city}` },
  ]);

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LocationPageContent
        serviceSlug={service}
        serviceTitle={svc.title}
        serviceH1={svc.h1}
        serviceDescription={svc.description}
        cityName={loc.name}
        cityRegion={loc.region}
        population={loc.population}
        faqs={faqs}
      />
    </>
  );
}
