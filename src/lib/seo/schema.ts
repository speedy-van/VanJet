// ─── VanJet · JSON-LD Schema Generators ──────────────────────
// All schema.org structured data. English only. Brand: VanJet.

import { SITE } from "./site";

/** Generate LocalBusiness / MovingCompany schema. */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: SITE.name,
    description:
      "VanJet is the UK's trusted marketplace for removals and deliveries. Instant quotes from verified drivers.",
    url: SITE.baseUrl,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 51.5074,
      longitude: -0.1278,
    },
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    priceRange: "££",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "07:00",
        closes: "21:00",
      },
    ],
    sameAs: [`https://twitter.com/${SITE.twitter.replace("@", "")}`],
    logo: `${SITE.baseUrl}/logo.png`,
    image: `${SITE.baseUrl}/og-image.jpg`,
  };
}

/** Generate FAQ schema from question/answer pairs. */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Generate location-specific service schema. */
export function generateLocationSchema(opts: {
  service: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  schemaType: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.schemaType,
    name: `${SITE.name} — ${opts.service} in ${opts.city}`,
    description: opts.description,
    url: `${SITE.baseUrl}/${opts.service.toLowerCase().replace(/ /g, "-")}/${opts.city.toLowerCase()}`,
    provider: {
      "@type": "MovingCompany",
      name: SITE.name,
      url: SITE.baseUrl,
    },
    areaServed: {
      "@type": "City",
      name: opts.city,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: opts.region,
      },
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: opts.lat,
      longitude: opts.lng,
    },
    serviceType: opts.service,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.baseUrl}/book`,
      serviceType: "Online booking",
    },
  };
}

/** Generate breadcrumb schema. */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Generate aggregate review schema. */
export function generateReviewSchema(opts: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: SITE.name,
    url: SITE.baseUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: opts.ratingValue,
      bestRating: opts.bestRating ?? 5,
      reviewCount: opts.reviewCount,
    },
  };
}

/** Generate HowTo schema (booking flow). */
export function generateHowItWorksSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Book a VanJet Removal",
    description:
      "Get competitive quotes from verified drivers in 4 simple steps with VanJet UK.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Tell us what you need",
        text: "Enter your pickup and delivery addresses, select items you are moving, and choose a date.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Receive driver quotes",
        text: "Your request goes live to verified drivers in your area. They review your job and send competitive quotes — usually within minutes.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Compare and choose",
        text: "Compare quotes side by side — see each driver's price, rating, van size, and reviews. Pick the one that suits you best.",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Pay securely and track",
        text: "Pay online with Stripe. Your driver is confirmed instantly and you can track your move in real time.",
      },
    ],
  };
}

/**
 * Generate Offer schema for quote/payment pages.
 * Shows the driver's quoted price with zero platform fees.
 */
export function generateOfferSchema(opts: {
  price: number;
  description?: string;
  itemOffered?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    price: opts.price.toFixed(2),
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    seller: {
      "@type": "MovingCompany",
      name: SITE.name,
      url: SITE.baseUrl,
    },
    description: opts.description ?? "Removal quote — no platform fees, pay driver directly",
    itemOffered: opts.itemOffered ? {
      "@type": "Service",
      name: opts.itemOffered,
    } : undefined,
    priceSpecification: {
      "@type": "PriceSpecification",
      price: opts.price.toFixed(2),
      priceCurrency: "GBP",
      valueAddedTaxIncluded: false,
    },
  };
}
