// ─── VanJet · Home Page (Server) ───────────────────────────────
// Fetches reviews from DB and passes to client content.

import { HomePageContent } from "@/components/HomePageContent";
import { getPublicReviews } from "@/lib/reviews/queries";

export default async function HomePage() {
  const initialReviews = await getPublicReviews(6);
  return <HomePageContent initialReviews={initialReviews} />;
}
