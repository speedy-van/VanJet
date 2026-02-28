// ─── VanJet · Static Reviews Data ─────────────────────────────
// Shared between Reviews component and /reviews page.
// Replaced by DB-backed data when Milestone 7 is complete.

export interface StaticReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  text: string;
}

export const STATIC_REVIEWS: StaticReview[] = [
  {
    id: "1",
    name: "Sarah T.",
    location: "London",
    rating: 5,
    date: "January 2025",
    text: "Booked a man and van last minute and the whole process took under 2 minutes. Driver arrived on time and was incredibly careful with my furniture. Would absolutely use again.",
  },
  {
    id: "2",
    name: "James R.",
    location: "Manchester",
    rating: 5,
    date: "February 2025",
    text: "Moved my 2-bed flat from Manchester to Leeds. Got 3 quotes instantly and chose the best one. Saved nearly £120 compared to the first removal company I called.",
  },
  {
    id: "3",
    name: "Emma K.",
    location: "Bristol",
    rating: 4,
    date: "February 2025",
    text: "Really smooth experience from start to finish. The price calculator was accurate and there were zero hidden charges. The driver was professional and friendly.",
  },
];

/** Summary line for UI (e.g. "Rated 4.8 out of 5 based on 312 reviews"). */
export const REVIEWS_SUMMARY = "Rated 4.8 out of 5 based on 312 reviews";
