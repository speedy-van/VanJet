// ─── VanJet · Blog Post Page ──────────────────────────────────
// English only. Static seed content with JSON-LD.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/seo/site";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface BlogPostData {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
  faqs: { question: string; answer: string }[];
}

const POSTS: Record<string, BlogPostData> = {
  "how-to-save-money-on-house-removals": {
    slug: "how-to-save-money-on-house-removals",
    title: "How to Save Money on House Removals in 2026",
    date: "2026-01-15",
    readTime: "6 min read",
    category: "Moving Tips",
    content: `Moving house is one of life's most stressful — and expensive — events. But it doesn't have to drain your bank account. Here are 12 proven strategies to reduce your removal costs without compromising on quality.

**1. Book midweek.** Removals are significantly cheaper on Tuesdays and Wednesdays. Saturday moves can cost 20% more.

**2. Compare quotes.** Use VanJet to compare prices from multiple verified drivers instantly. You could save up to 40%.

**3. Declutter first.** The fewer items you move, the cheaper it is. Sell, donate, or recycle what you no longer need.

**4. Pack yourself.** Professional packing adds £150–£300. If you have time, pack your own boxes and save.

**5. Choose the right vehicle.** Don't pay for a Luton van when a medium transit will do. VanJet recommends the right vehicle automatically.

**6. Be flexible with dates.** Off-peak months (January, February, November) are cheapest.

**7. Book in advance.** Last-minute bookings attract urgency premiums. Book at least 2 weeks ahead.

**8. Get free boxes.** Supermarkets and local shops often give away sturdy boxes.

**9. Label everything.** Clear labelling speeds up loading/unloading, reducing hourly costs.

**10. Disassemble furniture.** Flat-pack items take up less space and reduce the need for a larger van.

**11. Protect your items.** Damaged items cost more to replace than the blankets and bubble wrap to protect them.

**12. Use VanJet's instant pricing.** Our transparent breakdown shows exactly what you're paying for — no surprises.`,
    faqs: [
      {
        question: "What is the cheapest day to move house in the UK?",
        answer:
          "Tuesday and Wednesday are typically the cheapest days for removals. Weekend moves, especially Saturdays, command a 15–25% premium.",
      },
      {
        question: "How far in advance should I book a removal?",
        answer:
          "Ideally 2–4 weeks in advance. Last-minute bookings (less than 3 days) may incur urgency surcharges of up to 50%.",
      },
    ],
  },
  "complete-guide-man-and-van-uk": {
    slug: "complete-guide-man-and-van-uk",
    title: "The Complete Guide to Man and Van Services in the UK",
    date: "2026-01-08",
    readTime: "8 min read",
    category: "Guides",
    content: `A man and van service is the most flexible and affordable way to move items in the UK. Whether you're moving a single sofa or a studio flat's worth of belongings, here's everything you need to know.

**What is a man and van?**
A man and van service provides a driver with a van to help you move items from A to B. Unlike full removal companies, they're typically more affordable and flexible.

**How much does a man and van cost?**
Typical rates in the UK range from £40–£80 per hour, depending on van size and location. London rates are higher (£50–£90/hour). VanJet offers fixed-price quotes so you know the cost upfront.

**What van sizes are available?**
- Small Van (SWB): 5 m³ — studio flats, single items
- Medium Van (MWB): 9 m³ — 1-bed flats
- Long Wheelbase (LWB): 14 m³ — 2-bed flats
- Luton Van: 20 m³ — 3+ bed houses
- Luton with Tail Lift: 22 m³ — heavy or bulky items

**What should I check before booking?**
1. Insurance — ensure goods-in-transit cover is included
2. Reviews — read previous customer feedback
3. Pricing — fixed price vs hourly; watch for hidden fees
4. Parking — ensure there's legal loading access at both ends

**When to use a man and van vs a removal company?**
Choose man and van for smaller moves, single items, or when you want flexibility. Choose a full removal company for large 3+ bed houses requiring a team of movers.`,
    faqs: [
      {
        question: "Is a man and van cheaper than a removal company?",
        answer:
          "Yes, typically 30–50% cheaper for smaller moves. Man and van services are ideal for studio or 1-bed moves and single item deliveries.",
      },
      {
        question: "Can a man and van move a washing machine?",
        answer:
          "Yes. Most man and van drivers can move appliances. Just ensure the driver knows in advance so they bring the right equipment.",
      },
    ],
  },
  "packing-tips-for-stress-free-move": {
    slug: "packing-tips-for-stress-free-move",
    title: "15 Packing Tips for a Stress-Free Move",
    date: "2025-12-20",
    readTime: "5 min read",
    category: "Moving Tips",
    content: `Good packing can make or break your moving experience. Here are 15 tips from professional movers to help you pack like a pro.

1. **Start early.** Begin packing non-essential items 2–3 weeks before moving day.
2. **Use the right box sizes.** Heavy items in small boxes, light items in large boxes.
3. **Wrap fragile items individually.** Use bubble wrap, packing paper or towels.
4. **Fill empty spaces.** Stuff gaps with paper or clothing to prevent shifting.
5. **Label every box.** Mark the contents AND the destination room.
6. **Pack an essentials box.** Include chargers, toiletries, medication, and snacks.
7. **Photograph electronics.** Take photos of cable setups before disconnecting.
8. **Use wardrobe boxes.** They keep clothes on hangers and crease-free.
9. **Seal boxes properly.** Use strong tape and seal all seams.
10. **Don't overpack.** A box you can't lift is a box that might break.
11. **Pack room by room.** Keeps everything organised and easier to unpack.
12. **Protect furniture.** Use blankets, stretch wrap or furniture pads.
13. **Drain appliances.** Empty washing machines and fridges 24 hours before.
14. **Keep valuables with you.** Documents, jewellery and cash travel in your car.
15. **Ask VanJet for packing help.** Our professional packing service starts from £30.`,
    faqs: [
      {
        question: "How many boxes do I need for a 2-bed house?",
        answer:
          "Typically 30–50 medium boxes, plus 5–10 large boxes for bedding and lighter items.",
      },
      {
        question: "Should I pack plates vertically or flat?",
        answer:
          "Vertically — plates are less likely to crack when packed standing on edge, wrapped individually.",
      },
    ],
  },
  "office-relocation-checklist": {
    slug: "office-relocation-checklist",
    title: "Office Relocation Checklist: A Step-by-Step Guide",
    date: "2025-12-10",
    readTime: "7 min read",
    category: "Business",
    content: `Relocating an office is a complex project. This checklist will help you plan, execute and settle into your new space with minimal disruption.

**3 Months Before:**
- Appoint a move coordinator
- Set a budget and timeline
- Notify your landlord (check lease terms)
- Get quotes from removal companies (VanJet offers commercial rates)
- Plan the new office layout

**2 Months Before:**
- Notify clients, suppliers and partners
- Update your business address with HMRC, Companies House, banks
- Order new stationery, signage and business cards
- Arrange IT infrastructure at the new site
- Book parking permits for moving day

**1 Month Before:**
- Begin packing non-essential items
- Label all furniture and equipment
- Schedule utility transfers (broadband, electric, water)
- Arrange cleaning at both premises
- Confirm the moving date with VanJet

**Moving Week:**
- Back up all digital data
- Pack personal desks and sensitive documents
- Brief staff on the moving schedule
- Ensure lift access is booked at both buildings
- Prepare "day one" essentials box (kettle, mugs, loo rolls)

**Moving Day:**
- Supervise loading and assign a team at each end
- Check inventory as items are loaded and unloaded
- Test IT and phone systems at the new office
- Distribute keys and access cards

**After the Move:**
- Update Google Business Profile and website
- Send "we've moved" announcements
- Arrange a walkthrough of the old premises
- Celebrate with your team!`,
    faqs: [
      {
        question: "How long does an office move take?",
        answer:
          "A small office (5–10 desks) typically takes 1 day. Larger offices may need a weekend or phased approach.",
      },
      {
        question: "Can VanJet handle IT equipment?",
        answer:
          "Yes. VanJet drivers handle computers, monitors, servers and printers. We recommend specialist IT support for server disconnection/reconnection.",
      },
    ],
  },
};

// ── Static params ─────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

// ── Metadata ──────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};

  return {
    title: post.title,
    description: post.content.slice(0, 155).replace(/\n/g, " ").trim() + "...",
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 155).replace(/\n/g, " ").trim(),
      url: `${SITE.baseUrl}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      siteName: SITE.name,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: SITE.baseUrl },
    { name: "Blog", url: `${SITE.baseUrl}/blog` },
    { name: post.title, url: `${SITE.baseUrl}/blog/${slug}` },
  ]);

  const faqSchema =
    post.faqs.length > 0 ? generateFAQSchema(post.faqs) : null;

  // Convert markdown-like bold (**text**) to HTML
  const htmlContent = post.content
    .split("\n\n")
    .map((para) =>
      para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 16px",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            fontSize: "0.8rem",
            color: "#9CA3AF",
            marginBottom: 20,
          }}
        >
          <Link href="/" style={{ textDecoration: "underline" }}>
            Home
          </Link>{" "}
          /{" "}
          <Link href="/blog" style={{ textDecoration: "underline" }}>
            Blog
          </Link>{" "}
          / <span style={{ color: "#6B7280" }}>{post.title}</span>
        </nav>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: 8,
            fontSize: "0.8rem",
            color: "#9CA3AF",
            marginBottom: 10,
          }}
        >
          <span style={{ color: "#1D4ED8", fontWeight: 600 }}>{post.category}</span>
          <span>·</span>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.2,
            marginBottom: 28,
            letterSpacing: "-0.01em",
          }}
        >
          {post.title}
        </h1>

        {/* Content */}
        <div style={{ lineHeight: 1.8, color: "#4B5563" }}>
          {htmlContent.map((para, i) => (
            <p
              key={i}
              style={{ marginBottom: 18, fontSize: "0.9375rem" }}
              dangerouslySetInnerHTML={{ __html: para }}
            />
          ))}
        </div>

        {/* FAQs */}
        {post.faqs.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#111827",
                marginBottom: 20,
                letterSpacing: "-0.01em",
              }}
            >
              Frequently Asked Questions
            </h2>
            {post.faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    color: "#111827",
                    fontSize: "0.9375rem",
                    marginBottom: 6,
                  }}
                >
                  {faq.question}
                </p>
                <p style={{ color: "#6B7280", fontSize: "0.875rem", lineHeight: 1.65 }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: 48,
            background: "#EBF1FF",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontWeight: 800,
              color: "#1D4ED8",
              fontSize: "1.25rem",
              marginBottom: 8,
            }}
          >
            Need a removal quote?
          </p>
          <p
            style={{
              color: "#4B5563",
              fontSize: "0.9375rem",
              marginBottom: 20,
              lineHeight: 1.65,
            }}
          >
            Get an instant price from verified drivers across the UK.
          </p>
          <Link
            href="/book"
            style={{
              display: "inline-block",
              background: "#F59E0B",
              color: "#111827",
              padding: "12px 28px",
              borderRadius: 8,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Get Instant Quote →
          </Link>
        </div>
      </main>
    </>
  );
}
