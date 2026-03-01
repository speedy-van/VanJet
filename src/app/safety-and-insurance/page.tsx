// ─── VanJet · Safety & Insurance Page ─────────────────────────
// E-E-A-T focused: Expertise, Experience, Authoritativeness, Trustworthiness
// Operational best practices, safety standards, insurance coverage.

import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/seo/site";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Safety & Insurance — VanJet Removals",
  description:
    "Learn about VanJet's safety standards, professional training, insurance coverage, and best practices for protecting your belongings during removal.",
  alternates: { canonical: "/safety-and-insurance" },
  openGraph: {
    title: "Safety & Insurance — VanJet Removals",
    description:
      "Expert safety practices and comprehensive insurance protection for your removals.",
    url: `${SITE.baseUrl}/safety-and-insurance`,
    siteName: SITE.name,
    type: "website",
  },
};

const faqs = [
  {
    question: "What insurance coverage does VanJet provide?",
    answer:
      "All VanJet removals include comprehensive goods-in-transit insurance. Your belongings are covered for loss or damage up to their declared value, with a standard limit of £5,000 per item. For high-value items (antiques, artwork, pianos), we recommend additional declared value coverage at no extra cost.",
  },
  {
    question: "How much does insurance cost?",
    answer:
      'Goods-in-transit insurance is included in your VanJet quote at no extra charge. For additional declared value coverage on items over £5,000, there\'s a small premium (typically 1-2% of total value). You can also arrange your own insurance if preferred.',
  },
  {
    question: "What items are covered by VanJet insurance?",
    answer:
      "All household items, furniture, appliances, and goods are covered. This includes sofas, beds, pianos, safes, artwork, and decorative items. Insurance excludes items declared as fragile if they arrive broken (unless you purchase fragile goods protection), items of extraordinary value not pre-declared, and items damaged due to improper packing by customers.",
  },
  {
    question: "What happens if an item arrives damaged?",
    answer:
      "Immediately take photos and video of the damage with our driver or crew present. Report the damage within 24 hours with photos and your booking reference. We'll assess the damage, obtain repair quotes if necessary, and process your insurance claim. Most claims are settled within 5-7 business days.",
  },
  {
    question: "Are professional movers trained in safe handling?",
    answer:
      "Yes, all VanJet drivers and crew complete certified moving and handling training. They're certified in safe lifting techniques (H&S), proper securing of loads, vehicle operation, and customer service. We regularly refresh training and maintain safety certifications.",
  },
  {
    question: "How do you prevent damage to my home?",
    answer:
      "We use protective entrance protection (cardboard edges), corner guards, and floor protectors. Our team assesses access routes, uses dolly wheels on wooden floors, and navigates staircases with expert techniques. We remove doors and adjust banisters only if absolutely necessary and with your permission.",
  },
  {
    question: "What about lifting and handling safety?",
    answer:
      "Our movers are trained in correct lifting techniques and work in teams to avoid injury and damage. Heavy items are never lifted alone. We use equipment like dollies, sliders, and furniture pads to move items safely without putting strain on backs or the items themselves.",
  },
  {
    question: "Do you use straps and securing equipment?",
    answer:
      "Yes, all loads are secured with professional straps, blankets, and bracing inside our vehicles. Heavy items are secured to prevent shifting during transit. This protects your belongings and our team from injury due to load movement.",
  },
];

export default function SafetyAndInsurancePage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Safety & Insurance", url: "/safety-and-insurance" },
  ];

  return (
    <main style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema(
              breadcrumbItems.map((b) => ({
                name: b.name,
                url: `${SITE.baseUrl}${b.url}`,
              }))
            )
          ),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />

      {/* Hero Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)",
          color: "white",
          padding: "64px 16px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: 24,
              lineHeight: 1.2,
            }}
          >
            Safety & Insurance
          </h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.9, lineHeight: 1.7 }}>
            At VanJet, we prioritize the safety of your belongings and our team. Learn
            about our professional standards, insurance protection, and best practices
            for protecting your items during removal.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ display: "grid", gap: 48 }}>
          {/* Our Commitment Section */}
          <section>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: 24,
              }}
            >
              Our Safety Commitment
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#4B5563",
                lineHeight: 1.8,
                marginBottom: 20,
              }}
            >
              Every day, VanJet movers handle thousands of valuable items. Safety isn't
              optional — it's central to everything we do. From professional training to
              comprehensive insurance, we protect your belongings and our team.
            </p>
          </section>

          {/* Professional Standards Section */}
          <section>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: 24,
              }}
            >
              Professional Standards & Training
            </h2>
            <div style={{ display: "grid", gap: 24 }}>
              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "#F8FAFC",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 12,
                  }}
                >
                  ✓ Certified Moving & Handling
                </h3>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#6B7280",
                    lineHeight: 1.7,
                  }}
                >
                  All VanJet movers complete H&S certified moving and handling training.
                  This covers proper lifting techniques, load securing, equipment operation,
                  and Risk Assessment. Training is refreshed annually.
                </p>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "#F8FAFC",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 12,
                  }}
                >
                  ✓ Specialist Training
                </h3>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#6B7280",
                    lineHeight: 1.7,
                  }}
                >
                  For high-value items (pianos, safes, artwork), our team receives specialist
                  training. We partner with certified professionals (piano technicians,
                  engineers) to handle complex removals safely.
                </p>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "#F8FAFC",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 12,
                  }}
                >
                  ✓ Vehicle Maintenance & Safety
                </h3>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#6B7280",
                    lineHeight: 1.7,
                  }}
                >
                  All VanJet vehicles undergo monthly safety inspections. Vans are
                  professionally maintained, insured, and MOT-compliant (where applicable).
                  Load securing equipment (straps, blankets, bracing) is checked regularly.
                </p>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "#F8FAFC",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    marginBottom: 12,
                  }}
                >
                  ✓ Health & Safety Compliance
                </h3>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#6B7280",
                    lineHeight: 1.7,
                  }}
                >
                  VanJet complies with UK Health & Safety Executive (HSE) standards, including
                  the Health & Safety at Work etc. Act 1974, Manual Handling Operations
                  Regulations, and Lifting Operations and Lifting Equipment Regulations (LOLER).
                </p>
              </div>
            </div>
          </section>

          {/* Insurance & Protection Section */}
          <section>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: 24,
              }}
            >
              Insurance & Protection
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#4B5563",
                lineHeight: 1.8,
                marginBottom: 24,
              }}
            >
              All VanJet removals include comprehensive goods-in-transit insurance at no
              additional cost. You can also opt for additional coverage for high-value or
              specialist items.
            </p>
            <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: "2px solid #059669",
                  background: "#ECFDF5",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#047857",
                    marginBottom: 8,
                  }}
                >
                  Standard Coverage
                </h4>
                <p style={{ fontSize: "0.95rem", color: "#065F46" }}>
                  <strong>Limit:</strong> £5,000 per item / £50,000 total per removal
                  <br />
                  <strong>Covers:</strong> Loss or damage to goods in transit
                  <br />
                  <strong>Cost:</strong> Included in your VanJet quote
                </p>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: "2px solid #F59E0B",
                  background: "#FFFBEB",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#D97706",
                    marginBottom: 8,
                  }}
                >
                  High-Value Coverage (Optional)
                </h4>
                <p style={{ fontSize: "0.95rem", color: "#B45309" }}>
                  <strong>For items:</strong> Antiques, artwork, pianos, safes, designer
                  furniture &gt; £5,000
                  <br />
                  <strong>Premium:</strong> 1-2% of declared value
                  <br />
                  <strong>Limit:</strong> Up to £100,000+ per item (underwritten)
                </p>
              </div>
            </div>
          </section>

          {/* Handling Best Practices */}
          <section>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: 24,
              }}
            >
              Our Handling Best Practices
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 20,
              }}
            >
              {[
                {
                  title: "Pre-Move Assessment",
                  description:
                    "We inspect doorways, staircases, and access routes beforehand to identify risks and plan safe removal.",
                },
                {
                  title: "Protective Coverings",
                  description:
                    "All items are wrapped in blankets and protective plastic. Walls and doors are protected with cardboard edge guards.",
                },
                {
                  title: "Specialist Equipment",
                  description:
                    "We use dollies, sliders, furniture pads, and ramps to move heavy items safely without damage.",
                },
                {
                  title: "Team Lifting",
                  description:
                    "Heavy items are never lifted by one person. Our team works together using proper techniques to prevent injury.",
                },
                {
                  title: "Load Securing",
                  description:
                    "All loads in transit are secured with professional straps and bracing to prevent shifting during travel.",
                },
                {
                  title: "Climate Control",
                  description:
                    "For sensitive items (pianos, artwork), we use climate-controlled vehicles to prevent warping or damage.",
                },
              ].map((practice, i) => (
                <div
                  key={i}
                  style={{
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    background: "white",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#1D4ED8",
                      marginBottom: 10,
                    }}
                  >
                    {practice.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "#6B7280",
                      lineHeight: 1.6,
                    }}
                  >
                    {practice.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: 24,
              }}
            >
              Frequently Asked Questions
            </h2>
            <div style={{ display: "grid", gap: 16 }}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    background: "#F8FAFC",
                    borderLeft: "4px solid #1D4ED8",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: "#0F172A",
                      marginBottom: 12,
                    }}
                  >
                    {faq.question}
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#6B7280",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section
            style={{
              padding: 48,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%)",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: 16,
              }}
            >
              Ready for Your Safe, Insured Move?
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#6B7280",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Get an instant quote and book with confidence. All VanJet removals are
              backed by professional training, expert handling, and comprehensive insurance.
            </p>
            <Link href="/book">
              <button
                style={{
                  padding: "12px 32px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#111827",
                  background: "#F59E0B",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Get Free Quote Now →
              </button>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
