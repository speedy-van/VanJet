// ─── VanJet · Home Page (Server) ───────────────────────────────
// Fetches reviews from DB and passes to client content.
// Includes Homepage SEO metadata and schema ·

import type { Metadata } from "next";
import { SITE } from "@/lib/seo/site";
import { HomePageContent } from "@/components/HomePageContent";
import { getPublicReviews } from "@/lib/reviews/queries";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: {
    default: "VanJet – UK Man & Van & Removal Marketplace | Free Quotes",
    template: "%s | VanJet",
  },
  description:
    "Compare instant quotes from verified UK removal companies and man & van drivers. House moves, office relocations, single items. No platform fees. Book in 2 minutes.",
  keywords: [
    "man and van UK",
    "removal company UK",
    "house removals",
    "man and van London",
    "furniture delivery",
    "Office removals",
    "instant removal quotes",
  ],
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const initialReviews = await getPublicReviews(6);
  return <HomePageContent initialReviews={initialReviews} />;
}
