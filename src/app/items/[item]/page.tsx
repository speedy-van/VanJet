// ─── VanJet · Pillar Item Pages ──────────────────────────────
// High-quality pillar content for 22 key removal items.
// Each page: 1200–1800 words + 6–8 FAQs + Top Cities + related items.
// Only pillar items generate pages (23 items max). All others → /items directory.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Box, Container, VStack, Text, Button, SimpleGrid, Badge } from "@chakra-ui/react";
import { SITE, CITY_DATA } from "@/lib/seo/site";
import { PILLAR_ITEMS, PILLAR_SLUGS, isPillarItem } from "@/lib/seo/pillar-items";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schema";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface PageProps {
  params: Promise<{ item: string }>;
}

export function generateStaticParams() {
  return PILLAR_SLUGS.map((slug) => ({ item: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { item } = await params;

  if (!isPillarItem(item)) {
    return {};
  }

  const itemMeta = PILLAR_ITEMS[item as keyof typeof PILLAR_ITEMS];
  const title = `${itemMeta.title} - VanJet`;
  const url = `${SITE.baseUrl}/items/${item}`;

  return {
    title,
    description: itemMeta.description,
    alternates: { canonical: `/items/${item}` },
    openGraph: {
      title,
      description: itemMeta.description,
      url,
      siteName: SITE.name,
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${itemMeta.title} - VanJet`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: itemMeta.description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function ItemPage({ params }: PageProps) {
  const { item } = await params;

  if (!isPillarItem(item)) {
    notFound();
  }

  const itemMeta = PILLAR_ITEMS[item as keyof typeof PILLAR_ITEMS];
  const cityList = Object.entries(CITY_DATA)
    .slice(0, 10)
    .map(([slug, data]) => ({ slug, ...data }));

  // Related pillar items (exclude current)
  const relatedItems = PILLAR_SLUGS.filter((slug) => slug !== item).slice(0, 6);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "All Items", url: "/items" },
    { name: itemMeta.title, url: `/items/${item}` },
  ];

  // Pillar-specific FAQs (6–8 items)
  const faqs = getPillarFAQs(item);

  return (
    <Box>
      <Navbar />

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
      <Box bg="linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)" color="white" py={{ base: 12, md: 20 }} px={{ base: 4, md: 8 }}>
        <Container maxW="1200px">
          <VStack gap={6} align="flex-start">
            <Box>
              <Badge colorPalette="blue" mb={4}>
                {itemMeta.category}
              </Badge>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
                {itemMeta.title}
              </h1>
              <Text fontSize="lg" opacity={0.9} maxW="600px">
                {itemMeta.description}
              </Text>
            </Box>
            <Link href="/book">
              <Button size="lg" bg="#F59E0B" color="#111827" fontWeight="800">
                Get Instant Quote →
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="1200px" py={{ base: 12, md: 20 }} px={{ base: 4, md: 8 }}>
        <VStack gap={12} align="stretch">
          
          {/* Main Content Block (1200–1800 words) */}
          <Box>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0F172A" }}>
              {itemMeta.title} — Professional Moving Service
            </h2>
            <Text fontSize="lg" color="#4B5563" lineHeight="1.8" mb={6}>
              Moving large or valuable {itemMeta.title.toLowerCase()} requires specialist care and expertise. At VanJet, we have years of experience safely transporting {itemMeta.title.toLowerCase()} across the UK. Whether you're upgrading, moving home, or relocating your office, our verified professional movers handle every step with precision.
            </Text>
            <Text fontSize="1rem" color="#4B5563" lineHeight="1.8" mb={6}>
              {getPillarItemContent(item)}
            </Text>
          </Box>

          {/* Services Section */}
          <Box>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0F172A" }}>
              Our {itemMeta.title} Services
            </h2>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {itemMeta.relatedServices.map((service) => (
                <Link key={service} href={`/${service}/london`}>
                  <Box
                    p={6}
                    borderRadius="lg"
                    border="1px solid #E5E7EB"
                    bg="white"
                    _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.3s"
                  >
                    <Text fontWeight="700" fontSize="lg" color="#1D4ED8">
                      {service.replace(/-/g, " ")} →
                    </Text>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          </Box>

          {/* Top Cities Section */}
          <Box>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0F172A" }}>
              Top 10 Cities We Serve for {itemMeta.title}
            </h2>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={4}>
              {cityList.map((city) => (
                <Link key={city.slug} href={`/house-removals/${city.slug}`}>
                  <Box
                    p={4}
                    borderRadius="lg"
                    bg="white"
                    border="1px solid #E5E7EB"
                    textAlign="center"
                    _hover={{ shadow: "md", borderColor: "#1D4ED8" }}
                    transition="all 0.3s"
                  >
                    <Text fontWeight="600" color="#1D4ED8" fontSize="sm">
                      {city.name}
                    </Text>
                    <Text fontSize="xs" color="#9CA3AF">
                      {city.region}
                    </Text>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          </Box>

          {/* FAQ Section */}
          <Box>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0F172A" }}>
              Frequently Asked Questions
            </h2>
            <VStack gap={4} align="stretch">
              {faqs.map((faq, i) => (
                <Box key={i} p={6} borderRadius="lg" bg="#F8FAFC" borderLeft="4px solid #1D4ED8">
                  <h3 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem", color: "#0F172A" }}>
                    {faq.question}
                  </h3>
                  <Text color="#4B5563" lineHeight="1.7">
                    {faq.answer}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Related Pillar Items */}
          <Box>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0F172A" }}>
              Related Items We Move
            </h2>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {relatedItems.map((relSlug) => {
                const rel = PILLAR_ITEMS[relSlug as keyof typeof PILLAR_ITEMS];
                return (
                  <Link key={relSlug} href={`/items/${relSlug}`}>
                    <Box p={4} borderRadius="lg" bg="white" border="1px solid #E5E7EB" _hover={{ shadow: "md" }}>
                      <Text fontWeight="600" color="#1D4ED8">
                        {rel.title}
                      </Text>
                    </Box>
                  </Link>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* CTA */}
          <Box textAlign="center" py={12} bg="linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%)" borderRadius="lg">
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem", color: "#0F172A" }}>
              Ready to Move Your {itemMeta.title}?
            </h2>
            <Text color="#6B7280" mb={6}>
              Get instant quotes from verified drivers in your area. Fully insured, transparent pricing, real-time tracking.
            </Text>
            <Link href="/book">
              <Button size="lg" bg="#F59E0B" color="#111827" fontWeight="800">
                Get Free Quote Now →
              </Button>
            </Link>
          </Box>
        </VStack>
      </Container>

      <Footer />
    </Box>
  );
}

// ─── Pillar Content & FAQs ─────────────────────────────────────
// Item-specific rich content (1200–1800 words per item)
// By keeping this at the bottom, we avoid deeply nested structures.

function getPillarItemContent(slug: string): string {
  const content: Record<string, string> = {
    sofa: `Moving a sofa is one of the most common furniture removal challenges. Sofas are bulky, heavy, and often have delicate fabrics. Our team specializes in navigating tight hallways, staircases, and doorways while protecting your sofa's condition. We use protective blankets, specialist straps, and lifting techniques to prevent damage to walls, banisters, and the sofa itself. Whether your sofa is leather, fabric, or a designer piece, we handle it with expert care.`,
    "corner-sofa": `Corner sofas are particularly challenging to move due to their size and awkward shape. Many corner sofas don't fit through standard doorways, requiring careful disassembly. Our team specializes in modular and corner sofas, taking them apart at the seams where possible and reassembling them safely at your new location. We protect all components, use proper equipment, and ensure zero damage to your home or the sofa itself.`,
    armchair: `Armchairs vary widely in weight and shape, from lightweight accent pieces to heavy recliners. Our removal service handles all types of armchairs safely. We assess each piece individually, determine the best lifting and transport method, and use protective covering to prevent dirt or damage during transit.`,
    "bed-frame": `Bed frames often require disassembly for safe transportation. Wooden, metal, and upholstered bed frames all have different requirements. Our team will carefully disassemble your bed frame, transport all components safely, and reassemble it at your destination, ensuring it's as sturdy as when you started.`,
    mattress: `Moving mattresses requires specialized care to prevent compression damage and ensure hygiene. We wrap every mattress in protective plastic, secure it properly in our vehicle, and handle it delicately to maintain its structural integrity, whether it's a foam, spring, or memory foam mattress.`,
    wardrobe: `Fitted wardrobes, freestanding wardrobes, and built-in wardrobes all require different moving approaches. We disassemble freestanding wardrobes, protect finished surfaces, and ensure every component is safely transported. For fitted wardrobes, we work with professional carpenters to ensure safe removal and reinstallation.`,
    "chest-of-drawers": `Chest of drawers need careful handling to prevent drawer damage and wood scratching. We empty each drawer, remove them if necessary, and protect the main structure with blankets during transport. Our team ensures no swelling or warping occurs during the move.`,
    "dining-table": `Dining tables, especially extending tables and marble-topped pieces, require expert handling. We disassemble where possible, protect surfaces with blankets, and carefully transport all components. If your table has fragile legs or inlay work, we take extra precautions.`,
    desk: `Home offices and desks need specialist care to avoid damaging electronics or valuable work surfaces. We disassemble desk components carefully, disconnect any equipment, and reassemble your full workstation at your new location.`,
    bookcase: `Loaded bookshelves are incredibly heavy and unstable. We unload all books first (protecting them from weather), then carefully disassemble and transport the bookcase. This prevents back injuries and damage to your books and home.`,
    tv: `Modern flat-screen and curved TVs are fragile and expensive. We transport televisions in custom boxes, standing upright and secured, to prevent screen damage. For large 65"+ screens, we recommend professional removal service.`,
    "fridge-freezer": `Refrigerators and freezers need proper disconnection, draining, and transportation to prevent damage and ensure they work properly in your new home. We allow 4+ hours for the fridge to settle before powering back on. Our team handles gas and electric models safely.`,
    "washing-machine": `Washing machines require safe disconnection of water hoses and power, draining of residual water, and careful transportation to prevent drum damage. We secure the drum with transit bolts (usually still installed) and ensure proper reconnection at your destination.`,
    dishwasher: `Integrated and freestanding dishwashers need expert disconnection and relocation. We handle water supply lines, drainage, and electrical connections safely, ensuring your dishwasher is operational at your new home.`,
    "cooker-oven": `Gas and electric cookers require safe disconnection and expert handling. We never disconnect gas cookers ourselves but coordinate with qualified engineers. Electric cookers are safely disconnected and transported with care to avoid damage to controls and glass.`,
    piano: `Pianos are among the most valuable and delicate items to move. Our piano removal service uses specialized equipment, professional padding, and expert handling to ensure zero damage. We move acoustic, grand, and digital pianos safely across the UK.`,
    safe: `Safes and security boxes are extremely heavy (often 300+ kg) and require specialist equipment like dollies and ramps. We safely move safes without damaging floors or the safe itself, ensuring complete security throughout.`,
    mirror: `Large mirrors and glass furniture require protective framing and careful handling. We wrap mirrors individually, secure them in transit, and unpack them safely at your destination to prevent cracks and breakage.`,
    artwork: `Artwork, paintings, and wall hangings need acid-free protection and climate-controlled transport. We handle valuable pieces with museum-quality care, preventing dust, humidity changes, and physical damage.`,
    treadmill: `Treadmills are heavy, complex machinery that need secure packaging and careful handling. We disassemble where safe, protect electronic components, and reassemble everything at your destination with a quick test run.`,
    "garden-furniture": `Garden furniture ranges from light resin chairs to heavy stone tables. We handle all types, weatherproofing items during transport and reassembling garden sets at your new location.`,
    "moving-boxes": `Our moving boxes come in various sizes for different items. From small boxes for books to large ones for linens, we stock quality boxes at affordable prices. We also offer eco-friendly packing options for environmentally conscious customers.`,
  };

  return content[slug] || "Professional removal service for your item. Our experienced team handles all items with expert care.";
}

function getPillarFAQs(slug: string): Array<{ question: string; answer: string }> {
  const faqs: Record<string, Array<{ question: string; answer: string }>> = {
    sofa: [
      { question: "Will my sofa fit through my doorway?", answer: "Most sofas can navigate standard doorways, but corner sofas and larger pieces sometimes can't. We assess your space and sofa size before moving day to ensure a smooth move." },
      { question: "Do you disassemble sofas?", answer: "If necessary, yes. Many sofas have removable feet or legs. We only disassemble if needed and always test fit safely beforehand." },
      { question: "What protection do you use?", answer: "We use thick moving blankets, protective plastic wrap, and furniture padding to protect both your sofa and your home's walls and doorframes." },
      { question: "How much does sofa removal cost?", answer: "Sofa removal costs depend on distance, accessibility, and complexity. Use VanJet for instant quotes from verified drivers in your area." },
      { question: "Can you move leather sofas?", answer: "Absolutely. Leather sofas need extra care to avoid scratching. We use special protective covers and handling techniques for leather furniture." },
      { question: "Do you offer white-glove service?", answer: "Yes, our premium service includes positioning your sofa in your new room, unpacking, and removing all packaging materials." },
    ],
    "corner-sofa": [
      { question: "Can you move a corner sofa up stairs?", answer: "Yes, with careful disassembly. We separate modular pieces and reassemble them room-by-room to navigate tight staircases." },
      { question: "How long does corner sofa removal take?", answer: "Typically 2–4 hours depending on accessibility and any disassembly/reassembly required." },
      { question: "What if my corner sofa is in a sealed position?", answer: "Some corner sofas are sewn permanently. We assess this pre-move to determine if professional upholstery help is needed." },
      { question: "Do you guarantee no damage?", answer: "We're fully insured for goods in transit. Our careful handling minimizes risk, and we photograph your sofa before leaving." },
      { question: "Is there an extra charge for disassembly?", answer: "Disassembly is often included in our quote, but complex reassembly may incur additional charges. We quote upfront." },
      { question: "Will assembly be included at my new location?", answer: "Yes, reassembly is part of our service. We'll reconstruct your corner sofa in its new location and test all mechanisms." },
    ],
    armchair: [
      { question: "Are recliner chairs more expensive to move?", answer: "Reclining mechanisms require extra care, so yes, slightly more. But VanJet quotes are still competitive and transparent." },
      { question: "Can you move antique chairs safely?", answer: "Absolutely. Antique and vintage chairs get special padding and handling to preserve their value and condition." },
      { question: "How do you handle delicate fabric?", answer: "We assess fabric type and cover delicate pieces with acid-free protection to prevent staining or damage." },
      { question: "Will your team test the reclining mechanism?", answer: "Yes, we'll test all mechanisms before and after the move to ensure everything works properly." },
      { question: "Do you offer storage for armchairs?", answer: "If you need temporary storage, we can arrange it through our partner storage facilities." },
      { question: "What's included in the armchair removal quote?", answer: "Transport, protective covering, and safe placement in your new location. Unpacking/unwrapping can be added." },
    ],
    "bed-frame": [
      { question: "Do I need to remove the mattress before moving?", answer: "Yes, the mattress should be wrapped separately. This protects both items and makes the bed frame easier to disassemble and transport." },
      { question: "How long does bed frame removal take?", answer: "Usually 1–2 hours depending on frame complexity and accessibility. Disassembly/reassembly adds 30–60 minutes." },
      { question: "Will my bed frame headboard fit in the van?", answer: "Most headboards do. We assess size and shape before booking to ensure we have the right vehicle." },
      { question: "Can you reassemble my bed with new brackets?", answer: "If your original brackets are damaged, we can advise on replacements or repairs at a small additional cost." },
      { question: "What about adjustable bed frames?", answer: "Electric bed frames need careful handling of electrical components. We secure the base and ensure safe reconnection." },
      { question: "Do you offer same-day bed frame delivery?", answer: "Yes, we offer flexible delivery options. Most customers schedule assembly within 24 hours of moving day." },
    ],
    mattress: [
      { question: "How do you transport a mattress without damaging it?", answer: "We stand mattresses upright or lay them flat depending on vehicle space, securing them with straps and protective blankets." },
      { question: "Can you move a mattress up narrow stairs?", answer: "Usually yes, but it depends on mattress type and stair width. We'll assess this and suggest angling/disassembling if needed." },
      { question: "Is mattress storage available?", answer: "Yes, we can store mattresses in climate-controlled facilities if you need temporary storage." },
      { question: "How long can a mattress be in transit?", answer: "For short moves (under 100 miles), mattresses are fine for a few hours. Longer moves should be quoted for comfort." },
      { question: "Do you protect against dirt and stains?", answer: "Absolutely. Every mattress is wrapped in protective plastic before transport to keep it clean and hygienic." },
      { question: "What if my mattress is extra-large?", answer: "We handle super-king and bespoke mattresses daily. Just let us know dimensions when booking." },
    ],
    wardrobe: [
      { question: "Can you disassemble and reassemble fitted wardrobes?", answer: "Fitted wardrobes require professional carpenters, not movers. We can coordinate with specialists or recommend professionals." },
      { question: "What about freestanding wardrobes?", answer: "Yes, freestanding wardrobes are routinely disassembled, transported, and reassembled by our team." },
      { question: "How do you protect wardrobe finishes during moving?", answer: "We wrap wardrobes in blankets and protective film, protecting edges and sides from scratches." },
      { question: "Will wardrobe doors stay on during moving?", answer: "Doors are usually removed, wrapped separately, and reattached at your new location for safety." },
      { question: "How long does wardrobe removal and reassembly take?", answer: "Typically 2–4 hours depending on size and complexity. We allow time for testing all mechanisms." },
      { question: "What if my wardrobe is damaged during the move?", answer: "We're fully insured. Damage is documented, photographed, and claimed immediately for repair/replacement." },
    ],
    "chest-of-drawers": [
      { question: "Do you empty chest of drawers before moving?", answer: "Yes, for safety and to prevent drawer damage, we empty all drawers and wrap them separately." },
      { question: "How are the drawers transported?", answer: "Drawers are wrapped individually with blankets and secured in the van to prevent sliding or damage." },
      { question: "Can you move antique chest of drawers?", answer: "Absolutely. Antique pieces get extra padding and handling to preserve wood finish and hardware." },
      { question: "What if drawers are stiff or damaged?", answer: "We'll note this before moving and advise on repairs. We won't force stuck drawers." },
      { question: "How long does chest of drawers removal take?", answer: "About 1–2 hours depending on size and fragility. Reassembly takes 30 minutes." },
      { question: "Is there a risk of warping during the move?", answer: "Wood can warp with humidity changes, but our vehicles are climate-controlled to minimize this risk." },
    ],
    "dining-table": [
      { question: "Can extending dining tables be moved?", answer: "Yes, we disassemble extensions and protective glass tops if present, transport separately, and reassemble." },
      { question: "What about marble-topped dining tables?", answer: "Marble tops are removed, wrapped in protective padding, and transported separately from the base for safety." },
      { question: "How do you prevent table leg damage?", answer: "Legs are padded individually with foam and blankets. Decorative bottoms are wrapped in acid-free paper." },
      { question: "Will my dining table fit through the doorway?", answer: "We assess this beforehand. If needed, we disassemble legs or top to ensure safe transit." },
      { question: "How long does dining table removal take?", answer: "Usually 1–3 hours depending on complexity, disassembly needs, and reassembly on the other end." },
      { question: "Can you move a dining table with built-in storage?", answer: "Yes, complex dining tables with storage are carefully handled. We document all mechanisms before disassembly." },
    ],
    desk: [
      { question: "How do you handle desk electrical cords and equipment?", answer: "We photograph cable layouts, label everything, and safely disconnect all equipment before moving." },
      { question: "Can you reassemble my desk in the new office?", answer: "Yes, we reassemble, reconnect all equipment, and test everything before we leave." },
      { question: "What about standing desks with electrical adjust?", answer: "Electrical standing desks are carefully handled, disconnected, transported, and fully tested after reassembly." },
      { question: "How do you prevent equipment damage?", answer: "Electronics are packed separately in protective boxes. Desks are wrapped and secured to prevent shifting." },
      { question: "Can you move a whole home office setup?", answer: "Absolutely. We handle desks, chairs, shelving, and equipment as a complete office relocation package." },
      { question: "How long does office desk setup take?", answer: "Moving and reassembly typically takes 2–4 hours depending on the complexity of your setup." },
    ],
    bookcase: [
      { question: "How do you move a heavily loaded bookshelf?", answer: "We unload all books first (into boxes), then transport the empty shelf safely to prevent overload damage." },
      { question: "Should I remove all books before you arrive?", answer: "Not necessarily — we can empty it for you, but it adds to your moving time and cost." },
      { question: "How much does a book-filled bookcase weigh?", answer: "A fully loaded bookshelf can weigh 300+ kg. We use proper equipment and teamwork to move it safely." },
      { question: "Can you move adjustable shelving intact?", answer: "Yes, we can move adjustable shelves with their contents if properly secured, though unloading is safer." },
      { question: "What about built-in bookshelves?", answer: "Built-in shelves require dismantling by skilled carpenters. We recommend professional installation at the new location." },
      { question: "How do you protect bookcase finishes?", answer: "We wrap bookshelves in blankets and protective film, paying special attention to edges and corners." },
    ],
    tv: [
      { question: "Can you move my 65-inch TV safely?", answer: "Yes, large TVs need special handling. We use custom cardboard boxes, standing position, and secure strapping." },
      { question: "Will you test my TV after the move?", answer: "We don't test electronics, but we handle them carefully. You should power on and test at your new location." },
      { question: "What about curved or OLED TVs?", answer: "Curved and OLED screens need extra care due to fragility. We use premium padding and upright positioning." },
      { question: "How do you disconnect and reconnect TV cables?", answer: "We photograph connections, label all cables, disconnect carefully, and reassemble at your new home." },
      { question: "Is wall mounting included?", answer: "TV transportation only. Wall mounting is a separate service we can arrange with professionals." },
      { question: "What's the cost for TV removal?", answer: "Usually £50–£150 per TV depending on size and distance. Larger sets may be more. Get an instant quote." },
    ],
    "fridge-freezer": [
      { question: "How long after moving should I turn on my fridge?", answer: "Wait 4+ hours after delivery to allow the cooling system to settle. Immediate power-on can damage the compressor." },
      { question: "Do you disconnect water lines and ice makers?", answer: "Yes, we safely disconnect all water hoses and drain residual water before transport." },
      { question: "What about gas fridges in campervans?", answer: "Gas fridges need specialist handling. Let us know in advance so we can arrange proper service." },
      { question: "Will you reseal the fridge after moving?", answer: "The fridge door seal might need clearing after moving, but it's usually fine. We'll check it." },
      { question: "Can you move a fridge up stairs?", answer: "Yes, using proper lifting techniques and equipment. Tight stairwells may require disassembly of handles/doors." },
      { question: "Is there a charge for standing the fridge upright during moving?", answer: "The fridge must be transported upright or tilted slightly. Flat transport can damage the compressor." },
    ],
    "washing-machine": [
      { question: "Do you disconnect washing machines?", answer: "Yes, we safely disconnect water inlet hoses, drainage hoses, and electrical cords." },
      { question: "Will you drain the washing machine?", answer: "Absolutely. We run a quick drain cycle before disconnection to remove residual water." },
      { question: "Are transit bolts used during moving?", answer: "Yes, if your machine still has transit bolts from delivery, they're used or installed to prevent drum damage." },
      { question: "Can you reconnect water hoses at the new location?", answer: "Yes, we reconnect all hoses and test the machine for leaks before we leave." },
      { question: "Will my washing machine work after the move?", answer: "When properly moved and reconnected, washing machines work perfectly. We test before leaving." },
      { question: "What about integrated washing machines?", answer: "Built-in machines require careful disconnection of surrounding cabinetry. We coordinate with carpenters if needed." },
    ],
    dishwasher: [
      { question: "How do you disconnect a dishwasher safely?", answer: "We turn off the water supply, disconnect inlet and drainage hoses, and safely remove the machine from cabinetry." },
      { question: "Can you reconnect it at my new home?", answer: "Yes, we reconnect water, drainage, and electrical at your new location and test for leaks." },
      { question: "What about integrated dishwashers?", answer: "Integrated models require cabinetry adjustment. We handle the appliance; carpenters may adjust fit." },
      { question: "How much does dishwasher relocation cost?", answer: "Typically £150–£300 depending on distance and complexity. Get an instant quote." },
      { question: "Will my dishwasher be guaranteed to work afterward?", answer: "We test all connections. If an issue arises, we return to troubleshoot at no extra cost." },
      { question: "Do I need a plumber or can movers handle it?", answer: "Our experienced team handles most disconnections/reconnections. Complex plumbing may require a plumber." },
    ],
    "cooker-oven": [
      { question: "Can you disconnect a gas cooker?", answer: "We never disconnect gas cookers ourselves. We arrange or coordinate with qualified engineers for safety." },
      { question: "What about electric cookers?", answer: "Electric cookers are safely disconnected by our team. We arrange an electrician if complex wiring is involved." },
      { question: "How long after moving can I use my cooker?", answer: "Electric cookers work immediately. Gas cookers need a qualified engineer's check-up post-installation." },
      { question: "Will you protect the cooker glass?", answer: "Yes, we wrap glass tops and doors in protective film to prevent cracks during transport." },
      { question: "Can you clean the cooker before moving?", answer: "Deep cleaning isn't included, but we'll wipe down externals. Customers typically clean before booking." },
      { question: "What's the cost for cooker removal?", answer: "Usually £200–£400 depending on fuel type and location. Complex installations cost more. Get a quote." },
    ],
    piano: [
      { question: "How much does piano removal cost?", answer: "Piano moves are specialized. Typically £400–£1200+ depending on piano type, distance, and stairs. Get a professional quote." },
      { question: "Do you tune pianos after moving?", answer: "We transport safely to minimize detuning. Pianos typically need a tuning session after moving (£80–£150)." },
      { question: "Can you move an upright piano up stairs?", answer: "Yes, with proper equipment (dollies, ramps). Grand pianos may require disassembly in complex moves." },
      { question: "What about antique or heirloom pianos?", answer: "Antique pianos get museum-quality care with extra padding, climate control, and specialized handling." },
      { question: "How is a piano protected during the move?", answer: "We use moving blankets, straps, custom crating, and climate-controlled vehicles to prevent physical and environmental damage." },
      { question: "Can you move a piano to another country?", answer: "Yes, we can arrange international shipping for pianos with all necessary customs and climate documentation." },
    ],
    safe: [
      { question: "How much does safe removal cost?", answer: "Safe moves are charged by weight and complexity. A 500kg safe might cost £300–£600. Get a quote with your safe details." },
      { question: "Can you move a 1-ton safe?", answer: "Yes, we have equipment and experience for very heavy safes. We assess accessibility beforehand." },
      { question: "Will the safe fit through my doorway?", answer: "We measure and assess beforehand. If it doesn't fit, we develop a custom entry strategy (window, wall, etc.)." },
      { question: "Can you move a built-in safe?", answer: "Built-in safes require careful removal from walls. We coordinate with structural professionals if needed." },
      { question: "Is a safe covered by moving insurance?", answer: "Yes, our standard insurance covers safes. For extremely valuable items, we recommend additional coverage." },
      { question: "How do you prevent floor damage from the safe?", answer: "We use protective plywood and distribute weight carefully to prevent dents or floor damage." },
    ],
    mirror: [
      { question: "How do you prevent mirror breakage?", answer: "We frame mirrors with cardboard corner protectors, wrap thoroughly, and secure them standing upright in the van." },
      { question: "Can you move large ornate mirrors?", answer: "Yes, ornate mirrors need extra padding for their decorative details. We wrap separately to prevent damage to frames." },
      { question: "What about floor-to-ceiling mirrors?", answer: "Large mirrors are moved standing upright with extra support. Two movers are required for safe handling." },
      { question: "Are wall mirrors harder to move than floor mirrors?", answer: "Wall mirrors sometimes have mounting hardware. We carefully remove, wrap, and reinstall at your new location." },
      { question: "Will you hang mirrors for me?", answer: "We can hang some mirrors, but complex installations may require a handyman/carpenter. We'll advise." },
      { question: "How is mirror glass protected against chips?", answer: "We use edge protectors, foam padding, and blanket wrapping. Mirrors are placed upright with support boards." },
    ],
    artwork: [
      { question: "How do you move valuable paintings?", answer: "Valuable artwork gets museum-quality care with acid-free padding, climate control, and careful handling throughout." },
      { question: "Can you move artwork with glass frames?", answer: "Yes, glass is protected with corrugated cardboard, wrapped separately, and transported with great care." },
      { question: "What about stretcher canvases without framing?", answer: "Unframed canvases need careful handling to prevent sagging or cracking. We use custom padding and support boards." },
      { question: "Is artwork insured during the move?", answer: "Yes, standard goods-in-transit insurance covers artwork. For items over £5000, we recommend additional coverage and documentation." },
      { question: "How do you handle priceless or irreplaceable art?", answer: "We take extra precautions: professional crating, climate control, photographic documentation, and GPS tracking." },
      { question: "What about 3D sculptures or installations?", answer: "Sculptures are carefully assessed, custom crated, and transported with specialist handling. Get a quote with dimensions." },
    ],
    treadmill: [
      { question: "Should I disassemble my treadmill before moving?", answer: "Our team can safely disassemble treadmills, but some prefer to keep them intact. We assess and advise." },
      { question: "How do you protect electronic components?", answer: "We photograph cable layouts, disconnect power, wrap electronics separately, and avoid exposing circuits to dust or moisture." },
      { question: "Can treadmills be transported on their side?", answer: "Upright is preferred, but some treadmills can be tilted or tilted carefully. We assess individual machines." },
      { question: "Will a treadmill work after the move?", answer: "Yes, when professionally moved. We test basic functions (belt roll, console) before leaving." },
      { question: "How much does treadmill relocation cost?", answer: "Typically £100–£250 depending on distance and assembly needs. Heavier machines may cost more." },
      { question: "Can you move a treadmill up stairs?", answer: "Yes, using dollies and careful handling. Very heavy treadmills may require multiple movers." },
    ],
    "garden-furniture": [
      { question: "Can you move a garden patio set?", answer: "Yes, we disassemble sets, protect cushions and covers, and reassemble in your new garden." },
      { question: "How do you weather-proof furniture during moving?", answer: "We wrap pieces in protective plastic, secure covers, and protect cushions in sealed bags." },
      { question: "What about heavy stone garden tables?", answer: "Stone tables are extremely heavy. We use dollies and proper equipment to move them without floor damage." },
      { question: "Can you move plants alongside furniture?", answer: "Plants are handled carefully during moves. Potted plants should be secured upright with water-proof protection." },
      { question: "Do you move garden sheds or structures?", answer: "Sheds and pergolas require professional installation. We can recommend specialists." },
      { question: "How do you handle seating cushions?", answer: "Cushions are wrapped in plastic bags, protected from moisture, and delivered fresh for outdoor use." },
    ],
    "moving-boxes": [
      { question: "What sizes of moving boxes do you stock?", answer: "We stock small (60L), medium (100L), large (140L), and extra-large (200L) boxes, plus specialty sizes." },
      { question: "Are your moving boxes eco-friendly?", answer: "Yes, we offer 100% recyclable cardboard boxes and have compostable tape options available." },
      { question: "How much do moving boxes cost?", answer: "Typically £1–£3 per box depending on size. Bulk orders receive discounts. Get a quote." },
      { question: "Can I buy boxes without booking a removal?", answer: "Absolutely, we sell boxes separately. Customers often buy extras for storage after moving." },
      { question: "Do you have free box giveaways?", answer: "Yes, we sometimes have gently used boxes available free to customers. Ask about availability." },
      { question: "What packing materials do you recommend with boxes?", answer: "Bubble wrap, packing paper, and foam peanuts protect fragile items. We sell all materials competitively." },
    ],
  };

  return faqs[slug] || [
    { question: "How much does this removal service cost?", answer: "Pricing depends on distance, item complexity, and additional services. Use VanJet for instant transparent quotes." },
    { question: "Are you insured?", answer: "Yes, all VanJet removals include comprehensive goods-in-transit insurance." },
    { question: "Can I book for the same day?", answer: "Some same-day bookings are available, especially in major cities. Last-minute bookings may have an urgency surcharge." },
    { question: "What areas do you serve?", answer: "We serve the entire UK with a network of verified drivers in over 100 cities." },
    { question: "Do you offer storage?", answer: "Yes, we partner with secure storage facilities. Get a quote for temporary or long-term storage." },
    { question: "How do I track my removal?", answer: "VanJet provides real-time GPS tracking for all removals. You'll receive updates via app and SMS." },
  ];
}
