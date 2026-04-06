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
    default: "VanJet – Scotland's Trusted Man & Van Marketplace | Glasgow, Edinburgh & Beyond",
    template: "%s | VanJet",
  },
  description:
    "Scotland's #1 man & van and removal marketplace. Compare instant quotes from verified drivers in Glasgow, Edinburgh, and across Scotland. House moves, office relocations, single items. Book in 2 minutes.",
  keywords: [
    "man and van Glasgow",
    "man and van Edinburgh",
    "man and van Scotland",
    "removal company Scotland",
    "house removals Glasgow",
    "house removals Edinburgh",
    "furniture delivery Scotland",
    "office removals Glasgow",
    "instant removal quotes",
  ],
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const initialReviews = await getPublicReviews(6);
  return <HomePageContent initialReviews={initialReviews} />;
}
