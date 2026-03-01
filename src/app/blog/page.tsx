// ─── VanJet · Blog Listing Page ───────────────────────────────
// English only. Static seed posts.

import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Blog — Moving Tips & Guides",
  description:
    "Expert advice on house removals, packing tips, office relocations and more from VanJet UK.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "VanJet Blog — Moving Tips & Guides",
    description:
      "Expert advice on house removals, packing tips, office relocations and more.",
    url: `${SITE.baseUrl}/blog`,
    siteName: SITE.name,
    type: "website",
  },
};

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // static string
  readTime: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-save-money-on-house-removals",
    title: "How to Save Money on House Removals in 2026",
    excerpt:
      "Moving house doesn't have to break the bank. Here are 12 proven strategies to cut your removal costs without cutting corners.",
    date: "2026-01-15",
    readTime: "6 min read",
    category: "Moving Tips",
  },
  {
    slug: "complete-guide-man-and-van-uk",
    title: "The Complete Guide to Man and Van Services in the UK",
    excerpt:
      "Everything you need to know about hiring a man and van — from pricing and insurance to what to expect on moving day.",
    date: "2026-01-08",
    readTime: "8 min read",
    category: "Guides",
  },
  {
    slug: "packing-tips-for-stress-free-move",
    title: "15 Packing Tips for a Stress-Free Move",
    excerpt:
      "Professional packers share their top secrets for packing efficiently, protecting fragile items, and staying organised.",
    date: "2025-12-20",
    readTime: "5 min read",
    category: "Moving Tips",
  },
  {
    slug: "office-relocation-checklist",
    title: "Office Relocation Checklist: A Step-by-Step Guide",
    excerpt:
      "Planning an office move? Follow our comprehensive checklist to ensure zero downtime and a smooth transition for your team.",
    date: "2025-12-10",
    readTime: "7 min read",
    category: "Business",
  },
  {
    slug: "how-to-move-a-sofa-safely",
    title: "How to Move a Sofa Safely: Expert Tips & Techniques",
    excerpt:
      "Moving a sofa can be challenging. Learn how to navigate doorways, protect your home, and prevent damage to your furniture.",
    date: "2026-01-20",
    readTime: "5 min read",
    category: "Furniture Moving",
  },
  {
    slug: "how-to-move-a-wardrobe-safely",
    title: "How to Move a Wardrobe Safely: Disassembly & Transport",
    excerpt:
      "Wardrobes are bulky and delicate. Discover the best methods for disassembly, protection, and reassembly at your new home.",
    date: "2026-01-19",
    readTime: "6 min read",
    category: "Furniture Moving",
  },
  {
    slug: "how-to-move-a-bed-and-mattress-safely",
    title: "How to Move a Bed and Mattress Safely",
    excerpt:
      "Bed frames and mattresses require special care. Learn protective wrapping, disassembly tips, and safe handling techniques.",
    date: "2026-01-18",
    readTime: "5 min read",
    category: "Furniture Moving",
  },
  {
    slug: "how-to-move-a-fridge-freezer-safely",
    title: "How to Move a Fridge Freezer Safely: A Complete Guide",
    excerpt:
      "Moving appliances like fridges requires proper disconnection and handling. Expert tips to avoid damage and ensure functionality.",
    date: "2026-01-17",
    readTime: "6 min read",
    category: "Appliance Moving",
  },
  {
    slug: "how-to-move-a-washing-machine-safely",
    title: "How to Move a Washing Machine Safely: Disconnect & Reconnect",
    excerpt:
      "Washing machines are complex and heavy. Learn how to safely disconnect, transport, and reconnect for a smooth move.",
    date: "2026-01-16",
    readTime: "6 min read",
    category: "Appliance Moving",
  },
  {
    slug: "how-to-move-a-piano-safely",
    title: "How to Move a Piano Safely: Professional Techniques",
    excerpt:
      "Pianos are delicate and expensive. Discover specialist handling, equipment, and best practices for safe piano removal.",
    date: "2026-01-15",
    readTime: "7 min read",
    category: "Specialist Moving",
  },
  {
    slug: "how-to-move-a-safe-safely",
    title: "How to Move a Safe Safely: Heavy-Load Handling",
    excerpt:
      "Safes are incredibly heavy and valuable. Learn the equipment, techniques, and safety measures for moving security items.",
    date: "2026-01-14",
    readTime: "6 min read",
    category: "Specialist Moving",
  },
  {
    slug: "how-to-pack-moving-boxes-like-a-pro",
    title: "How to Pack Moving Boxes Like a Pro: 10 Expert Tips",
    excerpt:
      "Proper packing protects your items and makes unpacking easier. Master weight distribution, labeling, and protective materials.",
    date: "2026-01-13",
    readTime: "5 min read",
    category: "Packing Tips",
  },
];

export default function BlogPage() {
  return (
    <main
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "48px 16px",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#111827",
          marginBottom: 8,
          letterSpacing: "-0.01em",
        }}
      >
        VanJet Blog
      </h1>
      <p
        style={{
          fontSize: "1rem",
          color: "#6B7280",
          marginBottom: 40,
          lineHeight: 1.7,
        }}
      >
        Tips, guides, and expert advice for your next move.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: "none" }}
          >
            <article
              className="vj-card"
              style={{
                background: "white",
                borderRadius: 12,
                padding: 24,
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 10,
                  fontSize: "0.8rem",
                  color: "#9CA3AF",
                }}
              >
                <span style={{ color: "#1D4ED8", fontWeight: 600 }}>{post.category}</span>
                <span>·</span>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                {post.title}
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "#6B7280", lineHeight: 1.65 }}>
                {post.excerpt}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}
