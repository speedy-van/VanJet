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
  "how-to-move-a-sofa-safely": {
    slug: "how-to-move-a-sofa-safely",
    title: "How to Move a Sofa Safely: Expert Tips & Techniques",
    date: "2026-01-20",
    readTime: "5 min read",
    category: "Furniture Moving",
    content: `Moving a sofa is one of the most common furniture removal challenges. Sofas are bulky, heavy, and often have delicate fabrics that can be easily damaged. This guide shows you how to move your sofa safely.

**Measure Before You Book**
Before starting, measure your sofa, hallways, doors, and stairwells. If your sofa is wider than your doorway, you may need to: (1) Remove feet or legs, (2) Angle it diagonally, or (3) Disassemble modular sections. Many sofas have removable feet held on with bolts — check yours before moving day.

**Protect Your Sofa**
- Wrap in plastic furniture covers or sheeting to protect from dirt, dust, and water damage
- Use blankets or padding around the bottom and arms
- For leather sofas, avoid plastic covers that trap moisture — use breathable cloth instead
- For light-coloured fabrics, use clean protective material only

**Protect Your Home**
- Lay cardboard or plywood on floors to prevent scuffs
- Use corner protectors (buy or make from cardboard tubes) on doorframes and banisters
- Protect walls with protective film or old blankets
- Ask your building manager before removing protective moldings

**Move Your Sofa Safely**
- Always recruit at least 2 people; sofas are typically 80–150 kg
- Tilt the sofa diagonally to fit through doorways (testing beforehand saves time)
- Use furniture sliders under the base to reduce friction on floors
- Take breaks to prevent injury; rushing causes accidents
- For stairs: remove the sofa's feet, lean it against the bannister at an angle, and slide/tilt it up or down
- Never drag a sofa across floors — it damages both the sofa and your home

**Special Considerations**
- Recliners & sectionals have moving parts; test mechanisms before and after moving
- L-shaped sofas may require removing the chaise section separately
- Don't tilt a sofa onto its back unless necessary — this puts stress on glued joints

**After Delivery**
Leave your sofa to settle for a few hours before using it. Check for damage, test reclining mechanisms, and photograph any concerns. If damage occurred during the move, report it within 24 hours.

**Should You Hire Professionals?**
If your sofa is valuable, delicate (designer, antique), or your home has complex access (narrow staircases, tight hallways), hiring professional movers is worth the cost. VanJet's furniture removal service handles sofas with expert care — get a quote at /book.`,
    faqs: [
      {
        question: "Can you fit a sectional sofa through a standard door?",
        answer:
          "Depends on the sofa's width and the door width. Most standard doors are about 75cm wide. Sectionals often need angling, feet removal, or sectioning to fit. Measure both before committing to purchase or moving.",
      },
      {
        question: "Is it safe to move a sofa up stairs?",
        answer:
          "Yes, but it requires planning. Remove feet if possible, tilt the sofa carefully, and use at least 2 strong people. Never try alone — injuries are common. Professional help is recommended for stairs.",
      },
      {
        question: "What's the best way to protect a leather sofa?",
        answer:
          "Use breathable protective covers (avoid plastic that traps moisture). Wrap each section individually. For high-value leather, professional moving is recommended.",
      },
      {
        question: "How much does sofa removal cost with VanJet?",
        answer:
          "VanJet charges by distance and complexity. Most sofa moves cost £100–£300. Get an instant quote at /book with your details.",
      },
      {
        question: "Should I disassemble my sofa before moving?",
        answer:
          "Only if necessary. Removing feet takes 10 minutes. Removing cushions or sections helps with tight spaces. Disassembling the frame itself is not recommended unless done by a professional.",
      },
    ],
  },
  "how-to-move-a-wardrobe-safely": {
    slug: "how-to-move-a-wardrobe-safely",
    title: "How to Move a Wardrobe Safely: Disassembly & Transport",
    date: "2026-01-19",
    readTime: "6 min read",
    category: "Furniture Moving",
    content: `Wardrobes are among the trickiest furniture pieces to move. They're tall, heavy, and fragile. The good news: most wardrobes can be disassembled for safe transport. Here's how.

**Types of Wardrobes & Moving Strategies**

**Freestanding Wardrobes** can be disassembled by removing shelves, rails, and backs. Most require unscrewing 10–20 bolts and removing the base panel. Once disassembled, pieces are much more manageable.

**Built-in & Fitted Wardrobes** are fixed to walls and require professional carpenters to remove carefully without damaging walls or plaster. These should not be attempted by amateurs.

**PAX-Style (Modular) Wardrobes** like IKEA ranges disassemble like assembly. Remove doors, rails, and shelves. Storage units separate from side panels. Keep all hardware in labeled bags.

**Assess Before Moving**
Measure: doorways, hallways, stairwells, and your new room. Call the wardrobe manufacturer if you have the manual — they often provide disassembly guides with diagrams. If you've lost the manual, check the manufacturer's website.

**Empty Completely**
Remove all clothing, fold neatly, and pack in separate suitcases or boxes. Empty hangers separately. This reduces weight significantly (up to 30% lighter) and prevents damage to the wardrobe's pivots.

**Remove Hardware**
- Doors: Hold from both sides, lift up and out of hinges. Lay flat, protected, on the van floor
- Shelves: Life straight up and out of support rails. Stack with cardboard between each
- Rails & Hanging bars: Twist or unscrew, depending on bracket type. Wrap in bubble wrap
- Handles & hooks: Unscrew and bag separately with labels
- Back panel (if removable): Slide out carefully after removing side supports
- Label Everything: Use masking tape to label ALL parts. A photo of the assembly is invaluable

**Protect the Wardrobe**
- Wrap the main body (after removing doors) with plastic sheeting or blankets
- Protect the top, corners, and base from bumps
- Use corner guards (£2 cardboard tubes) at all edges
- Protect floors: lay cardboard under sliders/dolly wheels

**Transport Carefully**
- Stand the wardrobe upright on a dolly (not flat)
- Secure with ratchet straps to prevent tipping
- Don't stack other furniture against it — it tips easily
- Take corners slowly; sharp turns risk tipping
- Never transport beyond its height limit in a van

**Reassemble at Your New Home**
- Allow 30–90 minutes depending on complexity
- Lay out all parts in order before starting
- Use the manufacturer's manual or your photos as reference
- Start with the base frame, then add side panels, shelves, and rails
- Hang doors last
- Test all hinges, drawers, and rails move smoothly

**Special Considerations**
- Mirrors on wardrobes: Remove before transport, wrap separately, reinstall after
- Sliding door wardrobes: Remove doors before moving. Transport them flat, wrapped, separately
- Corner wardrobes: Often require custom measurements. Confirm fit before purchasing
- Wardrobe with internal drawers: Remove each drawer and pack contents separately

**When to Hire Professionals**
- Built-in or fitted wardrobes requiring carpenter removal
- Large walk-in wardrobes (£500+) needing specialist handling
- Awkward staircases or access issues
- Antique wardrobes (requires specialist care)

VanJet offers professional wardrobe removal with full disassembly, transport, and reassembly. Get a quote at /book.`,
    faqs: [
      {
        question: "How long does it take to disassemble a wardrobe?",
        answer:
          "30–60 minutes for a standard 2-door wardrobe. Larger units take longer. Most bolt/bracket connections take 5 minutes to remove each.",
      },
      {
        question: "Do I need to keep all the original hardware?",
        answer:
          "Yes. Keep bolts, brackets, and hinges in labeled bags. Photos of hardware placement are helpful. Replacement brackets cost £5–£20 each.",
      },
      {
        question: "What if my wardrobe won't fit through the door?",
        answer:
          "Disassemble into smaller sections. Remove doors, rails, and shelves first. If side panels are still too large, they may need to go through windows or be custom cut (not recommended).",
      },
      {
        question: "Can you move a built-in wardrobe?",
        answer:
          "Built-ins are difficult to move. They often require wall modification at both locations. Hiring a carpenter is necessary — movers cannot remove fitted wardrobes safely.",
      },
      {
        question: "How much does professional wardrobe removal cost?",
        answer:
          "VanJet typically charges £150–£400 for full wardrobe removal including disassembly and reassembly. Get a quote at /book.",
      },
    ],
  },
  "how-to-move-a-bed-and-mattress-safely": {
    slug: "how-to-move-a-bed-and-mattress-safely",
    title: "How to Move a Bed and Mattress Safely",
    date: "2026-01-18",
    readTime: "5 min read",
    category: "Furniture Moving",
    content: `Moving beds and mattresses requires more care than you might think. Improper handling damages the frame's joints, warps the mattress, and risks injury. Here's the right way to do it.

**Prepare Your Bed**

Before moving day, gather all parts: headboard, frame, slats (if any), and mattress. Locate all bolts, connectors, and hardware. Take photos of how everything fits together — this saves hours during reassembly.

**Disassemble Your Bed Frame**

Most bed frames disconnect into sections:
- **Headboard**: Usually bolts to the frame at the top. Unscrew these first (typically 4 bolts)
- **Side rails**: Connect to the footboard and legs via bolts or dowels. Remove these
- **Legs**: Usually bolt on to the underside. Unscrew each
- **Slats/Base**: Some beds have a wooden slat system underneath. Remove if detachable
- **Bottom rails**: Some fold or detach separately

Keep all hardware in a labeled bag. Don't tighten bolts before the move — you'll adjust them during reassembly.

**Protect the Frame**

- Wrap wooden frames in blankets or furniture padding (prevents scratches)
- Protect corners with cardboard tubes or corner guards
- Lay rails flat; don't lean them (they can bend or crack)
- For antique or high-value frames, use professional moving blankets

**Handle the Mattress Properly**

- **Stand it upright** in the van (never lay flat unless the van is at least 2 meters long)
- **Wrap in plastic** to protect against dirt and moisture
- **Never fold or bend** the mattress (damages internal springs and foam)
- **Secure with straps** to prevent shifting during transport
- **Transport carefully** — bumps can damage the mattress internally without visible signs

**Note on Mattress Size:**
- Single: Easily fits upright in most vans
- Double: Fits upright but is snug
- King size: Requires a Luton van or professional mover

**Reassemble at Your New Location**

1. Set up the frame base first (legs + side rails)
2. Add the bottom rails or slat system
3. Check everything is level using a level tool
4. Attach the headboard
5. Place the mattress on top — don't compress it while other parts are being assembled
6. Test the stability by gently pressing on corners

**Special Considerations**

- **Adjustable beds**: Require electrical connections. Photograph cable layouts before unplugging. Never transport while powered on.
- **Bed with storage drawers**: Remove drawers, pack contents separately. Transport the frame without drawers.
- **Metal frames**: These can dent. Wrap more protective padding than wooden frames.
- **Antique bed frames**: Use professional movers. These are often valuable and can break easily at joints.
- **Bunk beds**: Disassemble completely. Transport upper and lower frames separately.

**Moving Upstairs or Down Tight Staircases?**

This is where most bed frame damage happens:
- Disassemble fully before attempting stairs
- Remove door from hinges if it blocks access
- Tilt larger pieces at an angle — never force
- Have 2+ people to manage the weight

**Cost of Professional Bed Removal**

VanJet handles bed frame and mattress removal for £50–£150 depending on size and distance. Professional reassembly is included. Get a quote at /book.`,
    faqs: [
      {
        question: "Can you transport a mattress on its side?",
        answer:
          "It's not ideal, but possible for short distances. Always stand mattresses upright if you have space. Mattresses stored on their side can develop permanent dips.",
      },
      {
        question: "Should I remove the mattress before moving the frame?",
        answer:
          "Yes. Remove the mattress, wrap it separately, and transport it separately from the frame. This reduces weight and prevents damage.",
      },
      {
        question: "What if my bed frame doesn't disassemble?",
        answer:
          "Some platform beds and metal frames don't disassemble. Transport them carefully, wrapped, in a large van. Most can still fit diagonally.",
      },
      {
        question: "How do I prevent mattress damage during moving?",
        answer:
          "Wrap in plastic, stand upright, secure with straps, and avoid sharp impacts. Never fold, compress, or transport flat (horizontal) unless absolutely necessary.",
      },
    ],
  },
  "how-to-move-a-fridge-freezer-safely": {
    slug: "how-to-move-a-fridge-freezer-safely",
    title: "How to Move a Fridge Freezer Safely: A Complete Guide",
    date: "2026-01-17",
    readTime: "6 min read",
    category: "Appliance Moving",
    content: `Moving a fridge or freezer is trickier than moving furniture. These appliances contain delicate cooling systems, water hoses, and electrical components that can be damaged. Here's how to move a fridge safely.

**Before Moving Day: Preparation**

**Empty the Fridge (24 hours ahead)**: Remove all food and items. Clean the interior to prevent mold and odors during transit. Leave the door open for 2–4 hours to air dry.

**Turn Off the Fridge (12 hours ahead)**: Turn off the ice maker (if present) and power down the fridge. This allows the refrigerant to settle and prevents compressor damage.

**Defrost the Fridge**: If it has a manual defrost system, allow 8–12 hours for ice to melt. Drain the water into a tray — don't leave water inside.

**Disconnect Water Hoses**: 
- Locate the inlet valve (usually behind the fridge)
- Turn off the water supply (should be a small valve near the hose)
- Depress the release button and carefully remove the hose
- Cap both ends with electrical tape to prevent water spillage
- Drain any remaining water into a bucket

**Disconnect the Power Cable**: Unplug from the wall outlet. Wrap the cable around the back of the fridge or in a bag — don't let it dangle.

**Take a Photo**: Photograph the back of the fridge showing all connections. This is invaluable for reconnection.

**Prepare for Transport**

- **Wrap the fridge**: Use furniture blankets or moving plastic. Secure with soft straps (not tight)
- **Protect corners**: Use corner guards to prevent denting
- **Protect floors**: Lay cardboard where the fridge will rest
- **Secure in the van**: Use ratchet straps to prevent tipping during sharp turns

**Transport & Positioning**

- **Keep upright**: Transport the fridge in an upright position ONLY. Never lay it flat or on its side.
- **Why upright?**: The cooling system has oil that lubricates the compressor. If laid flat, oil reaches the compressor before the refrigerant settles, causing damage.
- **Temperature during transport**: Keep the van relatively cool (avoid extreme heat)
- **Avoid shaking**: Drive smoothly; bumps and vibrations can damage the compressor

**After Delivery: Reconnection**

**Wait 4+ Hours Before Powering On**: This is critically important. After transport (especially if bumped), the refrigerant needs time to settle. Turning on too soon can damage the compressor and void warranties.

**Reconnect Water Hoses**:
- Check hose ends for debris
- Push the inlet hose onto the inlet valve until it clicks
- Ensure hoses are not kinked or crushed
- Turn on the water supply slowly and check for leaks
- Leave the water off if you just traveled > 100 miles

**Reconnect the Power Cable**: Plug into a grounded outlet. Turn on the fridge and set to your preferred temperature.

**Test for Leaks**: Check under and behind the fridge after 30 minutes for water leaks.

**Special Considerations**

- **American fridge freezers**: These are heavier and sometimes wider than standard doorways. Measure beforehand.
- **Built-in fridge freezers**: May require carpentry to remove from cabinetry. Coordinate with a furniture removal service.
- **Fridge with ice maker**: Cap water inlet before transport. Reconnect after 4+ hour settling period.
- **Moving in summer**: Use an air-conditioned van if possible. High temperatures can damage cooling systems during transport.

**When to Hire Professionals**

- Fridge freezers in tight kitchens with narrow doorways
- Built-in / integrated models requiring carpentry
- Moving upstairs or into difficult-access locations
- Fridge > 80cm wide (American models)

VanJet's appliance removal service safely moves fridges and freezers with disconnect and reconnect. Get a quote at /book.`,
    faqs: [
      {
        question: "Why can't you lay a fridge flat during moving?",
        answer:
          "If laid flat, the compressor oil reaches the cooling lines before the refrigerant settles. This causes compressor damage and possible system failure.",
      },
      {
        question: "How long should I wait before turning on a moved fridge?",
        answer:
          "At least 4 hours. For long-distance moves (> 100 miles), wait 8+ hours. This allows the refrigerant to resettle safely.",
      },
      {
        question: "Will my fridge still work after moving?",
        answer:
          "Yes, when moved properly. The only risk is improper transport (laying flat, bumps) damaging the compressor. Professional movers prevent this.",
      },
      {
        question: "Do you need a plumber to disconnect/reconnect a fridge?",
        answer:
          "Not usually. Most hose connections are simple push-fit. However, if your fridge is built-in or uses complex plumbing, a plumber may help.",
      },
      {
        question: "What if the fridge was damaged during moving?",
        answer:
          "Report damage within 24 hours. Most goods-in-transit insurance covers fridge damage. Professional moving services are fully insured.",
      },
    ],
  },
  "how-to-move-a-washing-machine-safely": {
    slug: "how-to-move-a-washing-machine-safely",
    title: "How to Move a Washing Machine Safely: Disconnect & Reconnect",
    date: "2026-01-16",
    readTime: "6 min read",
    category: "Appliance Moving",
    content: `Washing machines are heavy, water-filled, and electrically complex. Moving one requires careful disconnection, transport, and reconnection. Here's the step-by-step process.

**Before Moving Day: Disconnect the Machine**

**Run a Drain Cycle**: Run the washing machine on a standard cycle with no clothes. Let it complete fully — this drains residual water.

**Locate the Turn-off Valves**: Behind the washing machine, find the water supply valves (usually two: hot and cold):
- Turn both valves clockwise until tight
- Listen for the water flow to stop

**Disconnect Water Inlet Hoses**:
- Press the release button or unscrew the hose connectors
- Drain remaining water into a bucket (expect 0.5–1 litre)
- Cap the hose ends with electrical tape or plastic caps to prevent spillage

**Disconnect the Drainage Hose**: The drain hose runs from the machine to your sink or drain pipe:
- If hooked to a sink, simply remove it
- If hardwired to a drain pipe, loosen the clamp and slide off
- Drain any water in the hose into a bucket

**Install Transit Bolts/Feet Locks**: Most washing machines have transit bolts (ships with the machine at purchase):
- Locate the bolt holes on the back/underside of the machine
- Screw in the transit bolts (prevents the drum from moving during transport)
- If you've lost the original bolts, buy replacements (£6–£15 per set) or wrap the machine tightly with straps

**Disconnect the Power Cable**: Unplug from the wall socket. Wrap the cable around the back of the machine or place in a bag.

**Take Photos**: Photograph the back of the machine showing:
- Water valve locations
- Hose connection points
- Drain hose route
- Any other connections

These photos are invaluable during reconnection.

**Prepare for Transport**

- **Wrap the machine**: Use moving blankets or plastic wrapping to protect against dirt and bumps
- **Protect corners**: Use corner guards
- **Use a dolly**: Washing machines (typically 50–100 kg) require a dolly or hand truck. Never drag.
- **Secure in the van**: Use ratchet straps to prevent tipping

**Transport**

- **Keep upright**: Transport upright only; never lay flat
- **Drive smoothly**: Avoid bumps and sharp turns
- **Avoid extreme temperatures**: High heat can damage seals and hoses

**Reconnection at Your New Location**

**Leave to Settle (2+ hours)**: Before reconnecting water or power, let the machine settle. This ensures the drum is stable.

**Reconnect Water Inlets**:
- Locate the two water inlet valves (hot and cold)
- Turn them on slowly and listen for water flowing
- If leaks are present, turn off immediately and check connections
- Connect the washed hoses: push firmly until they click, or hand-tighten connectors
- Test with a quick 2-minute cycle to check for leaks

**Reconnect the Drain Hose**:
- If draining to a sink, position the hose securely (bend U-shaped to prevent backflow)
- If connecting to a standpipe, slide on and clamp securely

**Remove Transit Bolts/Unlock the Drum**: 
- Remove the transit bolts from the back/underside
- Keep these bolts in case you move again
- If the drum is locked, consult your machine's manual for the unlock procedure

**Reconnect the Power**: Plug into a grounded, earthed outlet.

**Test the Machine**: Run a short cycle (15 minutes) with no clothes to test for leaks and proper operation.

**Special Considerations**

- **Integrated washing machines**: Built into cabinetry; may require a carpenter to remove
- **Washer-dryer combos**: More complex; require professional handling
- **Top-loaders vs. front-loaders**: Front-loaders are more susceptible to drum damage if tilted
- **Old machines without transit bolts**: Check your manual or contact the manufacturer for specifications

**When to Hire Professionals**

- Complex plumbing setups
- Built-in or integrated machines
- Moving to a different floor/building (heavy machinery)
- Any concerns about your ability to safely disconnect/reconnect

VanJet handles washing machine removal with full disconnect and reconnect. Water hose connections are professionally checked. Get a quote at /book.`,
    faqs: [
      {
        question: "What are transit bolts and why do you need them?",
        answer:
          "Transit bolts lock the drum to prevent movement during transport. They come with your washing machine (in the box). If lost, the manufacturer can provide replacements.",
      },
      {
        question: "Can you lay a washing machine flat?",
        answer:
          "Not recommended. The drum can damage internal components if tilted. Keep upright during transport.",
      },
      {
        question: "How do you prevent water leakage during moving?",
        answer:
          "Run a drain cycle, disconnect hoses, and cap the ends with electrical tape. Most water leaks come from incomplete draining or loose hose connections.",
      },
      {
        question: "Will the washing machine work after moving?",
        answer:
          "Yes, when properly moved. Keep it upright, install transit bolts, and reconnect carefully. Most machines work perfectly after moving.",
      },
      {
        question: "Do I need a plumber to disconnect/reconnect?",
        answer:
          "Not usually. Most connections are simple hose push-fits. However, if valves are stuck or plumbing is complex, a plumber can help (typically £50–£100).",
      },
    ],
  },
  "how-to-move-a-piano-safely": {
    slug: "how-to-move-a-piano-safely",
    title: "How to Move a Piano Safely: Professional Techniques",
    date: "2026-01-15",
    readTime: "7 min read",
    category: "Specialist Moving",
    content: `Pianos are the most expensive furniture items to move and among the most delicate. Never attempt a piano move yourself — always hire professional piano movers. Here's what you need to know.

**Why Pianos Require Professional Moving**

A piano is not just furniture; it's a precision instrument. Its value ($5,000–$100,000+) and delicate internal mechanisms require:
- Specialized equipment (dollies designed for pianos)
- Protective wrapping (wood and felt protection)
- Professional insurance (standard moving insurance may not cover damage)
- Expert knowledge of angles, bracing, and securing
- Climate control during transport

Improper handling can cost thousands in repairs and devalue the piano permanently.

**Types of Pianos & Moving Challenges**

**Upright Pianos** (home use, practice rooms):
- Weight: 200–500 kg
- Fit through standard doorways if tilted carefully
- Risk: Weight distribution is at the back; improper tilting tips pianos forward
- Requires: Special upright piano dolly, minimum 2 professionals

**Grand Pianos** (concert halls, studios):
- Weight: 300–800+ kg
- Do NOT fit through standard doorways; legs must be removed for transport
- Risk: Exposed strings and pedal mechanisms are fragile; legs are valuable
- Requires: Specialized grand piano dolly, 3+ professionals, professional crating

**Digital Pianos**: Less delicate than acoustic; professional moving still recommended for large models.

**Before You Move: Preparation**

**Measure Everything**:
- Width of piano (with lid open, if upright)
- Height (including lid if open)
- Depth
- Doorway widths and heights
- Staircase widths (critical for delivery)
- Van height clearance needed

**Hire a Certified Piano Mover**:
- Look for movers with piano-specific experience
- Request references from previous clients
- Ensure they carry professional piano moving insurance
- Get written quotes detailing transport, insurance, and any special handling fees
- VanJet works with certified piano movers in the UK — ask for a referral

**Choose the Right Time**:
- Spring or autumn (moderate temperatures)
- Avoid extreme heat or cold (expansion/contraction damages wood and tuning)
- Avoid humid months when possible

**Prepare the Route**:
- Remove obstacles from doorways
- Remove door hinges if needed for access
- Protect floor with cardboard and plastic
- Ensure staircase is clear and strong
- Have adequate indoor space at both ends (pianos need space to maneuver)

**The Professional Moving Process**

**1. Stabilization & Wrapping** (30 minutes)
- The lid is closed and secured
- All knobs, pedals, and keys are protected with foam
- The entire piano is wrapped in protective blankets (not plastic)
- Legs are cushioned (for grand pianos, legs are sometimes removed)

**2. Loading** (30–60 minutes)
- Upright pianos: Tilted at a 45° angle on a specialized dolly
- Grand pianos: May be partially disassembled (legs removed, lid detached)
- The piano is wheeled onto the van with ramps, not lifted
- Inside the van, it's secured with professional straps and blocking

**3. Transport**:
- The van is climate-controlled if possible
- Driving is smooth and careful (no sharp turns or heavy impacts)
- The route avoids rough or unpaved sections
- Travel time varies (typically 2–4 hours for UK moves)

**4. Unloading & Placement** (30–60 minutes)
- The piano is wheeled out on the dolly
- Legs are reattached (if removed)
- The piano is positioned in its new location
- Protective wrapping is removed

**5. Professional Tuning** (within 1–2 weeks):
- After moving, pianos are always out of tune
- Hire a certified piano tuner (£80–£200 per session)
- First tuning should occur 1–2 weeks after moving
- Additional humidity adjustment may be needed in new environments

**Special Considerations**

- **Antique pianos**: Even more delicate; require specialized antique moving services
- **Distance moves**: Long-distance moves require climate-controlled trucks
- **Stairs**: Pianos cannot go up many standard residential staircases. Specialist equipment (external lifts, hoists) may be needed (adds £500–£2000)
- **Narrow doorways**: Some doorways (200 years old homes) are too narrow. Pianos may need to be moved through windows with external hoists
- **Insurance**: Verify your homeowner's insurance covers the piano. Additional mover's insurance covers most scenarios

**Cost of Piano Moving**

- Local move (< 10 miles): £500–£800
- Regional move (10–50 miles): £800–£1500
- Long-distance move (> 50 miles): £1500–£5000+
- Stairs or special access: Add £300–£2000
- Professional tuning after: £80–£200

**Why Not DIY?**

A single mistake (wrong angle, improper strapping, or impact) can damage the piano's internal mechanisms, chords, and casing. Repair costs ($2000–$10000+) far exceed the moving cost. Professional piano movers have insurance to cover any damage.

VanJet partners with certified piano movers across the UK. Get a quote at /book.`,
    faqs: [
      {
        question: "How much does professional piano moving cost?",
        answer:
          "£500–£3000+ depending on distance, piano type, and access difficulty. Always get quotes from 2–3 piano movers.",
      },
      {
        question: "Do pianos go out of tune after moving?",
        answer:
          "Yes, always. Movement, temperature changes, and vibrations affect tuning. Budget £80–£200 for professional retuning 1–2 weeks after moving.",
      },
      {
        question: "Can you move a piano up stairs?",
        answer:
          "It depends. Standard residential stairs often can't fit pianos. External hoists or specialized lifting equipment may be needed (costs extra). A piano mover will assess before quoting.",
      },
      {
        question: "What happens if the piano is damaged during moving?",
        answer:
          "Professional piano movers carry comprehensive insurance. Damage claims are typically handled within 5–7 business days. Always ensure you have written insurance confirmation before the move.",
      },
      {
        question: "Should I hire professional movers for a piano?",
        answer:
          "Absolutely. Piano damage from improper handling can cost thousands. Professional expertise is worth the investment.",
      },
    ],
  },
  "how-to-move-a-safe-safely": {
    slug: "how-to-move-a-safe-safely",
    title: "How to Move a Safe Safely: Heavy-Load Handling",
    date: "2026-01-14",
    readTime: "6 min read",
    category: "Specialist Moving",
    content: `Safes are extremely heavy (often 300–1000+ kg for large models), valuable, and designed to be immovable. Moving one requires specialized equipment, planning, and expertise. Never attempt this yourself.

**Why Safes Are Difficult to Move**

Safes are:
- **Extremely heavy**: A medium safe (600 kg) requires 4+ people and equipment
- **Designed not to move**: Heavy-duty bolts, friction pads, and wheels (often disabled)
- **Expensive if damaged**: Damage to the locking mechanism, hinges, or door can cost hundreds
- **Floor-damaging**: The weight concentrated in one area can damage or crack floors
- **Dangerous if mishandled**: Crushing injuries are a real risk

**Types of Safes & Moving Challenges**

**Floor Safes**: Embedded in the floor, need professional removal
**Wall Safes**: Bolted to studs; require careful unscrewing and wall repair
**Freestanding Safes**: Heavy but moveable with proper equipment
**Deposit Box Safes**: Large commercial safes; need multiple people and equipment
**Gun Safes**: Usually 300–500 kg; specialized secured transport needed

**Before Moving Day: Assessment**

**Weigh and Measure**:
- Check the safe's weight (manual or manufacturer specs)
- Measure width, depth, and height
- Identify doorway widths and clearances
- Check staircase widths (most safes cannot go up stairs)
- Assess floor strength (weak floors risk collapse)

**Locate Floor Anchors**: Many safes are bolted to the floor:
- Check underneath for bolts (usually 4–8)
- Take a photo
- Plan how to remove them safely

**Determine Floor Protection Needs**:
- Calculate weight per square inch
- Assess if floors will handle concentrated weight
- Plan protective plywood under the safe both before and after moving

**Prepare the Safe**

- **Empty it completely**: Remove all contents
- **Lock it securely**: Ensure the door is locked (for security during moving)
- **Disconnect any power**: If it's an electronic safe with a battery backup, disconnect the battery
- **Check the hinges**: Ensure they're not damaged before moving

**Professional Move Equipment**

**Proper Equipment Is Essential**:
- Heavy-duty dollies rated for 500+ kg
- Furniture sliders (reduce floor damage)
- Ramps (for loading into vans)
- Protective blankets and wooden blocking
- Ratchet straps (to secure in the van)
- Multiple people (minimum 3–4 for medium safes)
- Proper footwear (steel-toed boots recommended)

**The Safe Moving Process**

**1. Floor Preparation**: Lay protective plywood under the safe and along the moving path
**2. Equipment Setup**: Position the dolly and straps before lifting
**3. Positioning**: Carefully position the safe on the dolly using (if needed) small hydraulic jacks or furniture sliders
**4. Securing**: Strap the safe firmly to the dolly; double-check straps
**5. Transport**: Move slowly, avoiding sudden turns or bumps
**6. Ramp Loading**: Use ramps (not lifting) to load into the van
**7. Van Securing**: Secure with ratchet straps to prevent moving during transit
**8. Unloading**: Reverse the loading process
**9. Floor Protection at New Location**: Lay plywood before placing the safe

**Special Handling for Stairs**

**Important**: Most safes CANNOT go upstairs in residential buildings:
- Standard staircases are typically 75–80 cm wide
- Safes are usually 40–60 cm deep + width
- Safes are too heavy to carry up many staircases

**Solutions**:
- Exterior hoists (crane rental) — £500–£2000+
- Removing windows and using equipment lifts
- Ground floor placement only

Confirm floor access with a professional mover before purchasing a safe for an upstairs location.

**Cost of Safe Moving**

- Local move (< 10 miles): £300–£600
- Weight surcharge: £50–£100+ per 100 kg over 500 kg
- Exterior hoist (stairs): £500–£2000
- Long-distance moves: £800–£3000+

**When to Hire Professional Safe Movers**

- **Always**: Safes are too risky for amateur moving
- Medium to large safes (> 300 kg)
- Moving upstairs or into difficult-access locations
- Antique or valuable safes
- Wall-mounted safes requiring carpentry removal

VanJet partners with certified safe movers. Confirm your safe's weight with the manufacturer before requesting a quote at /book.

**After Moving**

- Check the door locks and mechanism work smoothly
- Verify the combination still functions (should be unaffected)
- Secure the safe to the floor if it's anchored
- Update your lock combination if you changed access methods`,
    faqs: [
      {
        question: "Why do safes need to be professionally moved?",
        answer:
          "Safes are extremely heavy (often 300+ kg), damage easily, and pose crushing injuries if dropped. Professional movers have proper equipment to prevent damage and protect safety.",
      },
      {
        question: "Can you move a safe up stairs?",
        answer:
          "Rarely. Most residential staircases are too narrow and weight-limited. External hoists may be needed (add £500–£2000). Confirm with a professional before attempting.",
      },
      {
        question: "How much does safe moving cost?",
        answer:
          "£300–£600 for local moves; heavier safes cost more (£50–£100 per 100 kg over 500 kg). External hoists or long-distance moves cost significantly more.",
      },
      {
        question: "Will the safe's lock still work after moving?",
        answer:
          "Yes. Locks are internal and unaffected by movement. The combination should work exactly as before.",
      },
      {
        question: "What if the safe is too heavy for the van?",
        answer:
          "Tell the moving company your safe's weight beforehand. They'll send an appropriately sized vehicle. Weight limit is usually 2000+ kg for a van.",
      },
    ],
  },
  "how-to-pack-moving-boxes-like-a-pro": {
    slug: "how-to-pack-moving-boxes-like-a-pro",
    title: "How to Pack Moving Boxes Like a Pro: 10 Expert Tips",
    date: "2026-01-13",
    readTime: "5 min read",
    category: "Packing Tips",
    content: `Professional packers pack efficiently, safely, and in a way that makes unpacking faster. Here are 10 expert tips to pack like a pro.

**1. Use the Right Box Sizes**

- **Small boxes** (10L–15L): Books, files, kitchen utensils, heavier items
- **Medium boxes** (25L–35L): Clothes, linens, kitchen items, office supplies
- **Large boxes** (40L–60L): Light items only (blankets, pillows, towels, clothing)
- **Extra-large boxes** (70L+): Lightweight items only (styrofoam packaging, inflatable items)

**Rule**: If you can't comfortably lift a box, it's too heavy. Aim for maximum 15 kg per box.

**2. Protect the Box Bottom**

- Use 2–3 layers of packing tape along the seams
- Wrap the bottom exterior with tape as well
- This prevents box failure mid-move

**3. Create a Cushioning Layer**

- Place 5–10 cm of packing paper, bubble wrap, or old newspaper on the box bottom
- This protects items from impacts and prevents them shifting when the box is set down

**4. Pack Heavy Items on the Bottom, Light Items on Top**

- Bottom: Books, tools, small appliances (heavier items)
- Middle: Medium-weight items (glassware, plates, kitchen utensils)
- Top: Lightweight items (blankets, pillows, clothes)

This prevents crushing and makes the box stable when stacked.

**5. Fill Every Empty Space**

- Don't stack fragile items without cushioning between them
- Fill gaps with packing paper, towels, or old clothing
- A shifting box damages contents; a full box is a safe box

**6. Label Clearly on Multiple Sides**

- Label the contents on **two sides** of the box (not just the top)
- Write the room/destination: "Kitchen", "Master Bedroom", "Lounge"
- Add a description: "Kitchen — Glasses & Plates", not just "Kitchen"
- Use colored tape or markers for different rooms (red for kitchen, blue for bedroom, etc.)

**Pro tip**: Photograph the contents on your phone before sealing. If you lose track, you've got a record.

**7. Wrap Fragile Items Individually**

- **Plates**: Stack with packing paper between each. Wrap the stack in bubble wrap.
- **Glasses**: Wrap each glass individually in bubble wrap with extra protection at the base
- **Bowls**: Wrap individually; nest gently with paper between
- **Fragile electronics**: Wrap in anti-static bubble wrap; protect corners with foam

**Don't rely on "Fragile" stickers** — they're often ignored. Professional movers pay more attention to lighter boxes that are clearly labeled.

**8. Pack Clothes Efficiently**

- For short moves: Keep clothes on hangers in wardrobe boxes (saves 30% space)
- For long moves: Fold clothes rolling-style (prevents creasing and saves space)
- Use suitcases for clothes; they're stackable and double as storage later

**9. Smart Packing for Books**

- Books are heavy; use small-to-medium boxes only
- Don't make book boxes too heavy (max 15 kg)
- Pack books spine-down alternating with spine-up (prevents warping)
- Fill gaps with packing paper (prevents movement)

**10. Label a "First Night" or "Essentials" Box**

Pack immediately before moving day:
- Phone chargers
- Toiletries & medications
- Pajamas & underwear
- Snacks & drinks
- Bedding (sheets, pillows)
- Basic tools (hammer, screwdriver)
- Kettle & mugs
- Toilet paper & paper towels

**Bonus Tips**

- **Use suitcases & laundry baskets**: They're boxes that serve double duty
- **Don't pack heavy items on top**: Nothing heavier than 5 kg on the top layer
- **Photograph your packing**: Take photos of room-by-room packing for reference
- **Use old blankets as moving blankets**: Save money while reducing waste
- **Seal ALL boxes with tape**: Open boxes spill during the move
- **Pack room-by-room**: Easier to unpack when all kitchen items are together

**Signs You've Packed Wrong**

- Boxes so heavy you can't lift them (should be comfortable to carry)
- Fragile items not individually wrapped
- Light and heavy items mixed randomly
- Unlabeled boxes (can't find anything)
- Tape not covering seams (boxes fail)
- Electronic cords tangled inside (hard to reconnect)

**When to Hire Professional Packers**

- High-value items (artwork, antiques)
- Fragile items requiring museum-quality packing
- Time pressure (work full-time, can't pack yourself)
- Large moves (3+ bed houses)
- Specialty packing (pianos, safes, machinery)

VanJet offers professional packing services starting from £30/hour. Get a quote at /book.`,
    faqs: [
      {
        question: "How many boxes do I need for a 2-bed flat?",
        answer:
          "Typically 40–60 medium boxes, depending on furniture. A professional packer can assess and provide accurate estimates.",
      },
      {
        question: "What's the difference between professional packing and DIY packing?",
        answer:
          "Professional packing is faster, uses optimal space, and provides better protection for fragile items. It also means you can wait longer before unpacking.",
      },
      {
        question: "Should I label every box?",
        answer:
          "Yes. Clear labeling saves hours during unpacking. If you can't find a specific item, you know exactly which box to check.",
      },
      {
        question: "What's the best material for wrapping dishes?",
        answer:
          "Bubble wrap is best (protects against impact). Packing paper is more sustainable. Newspaper can transfer ink to dishes — use paper between newspaper wrapping.",
      },
      {
        question: "Can you reuse moving boxes?",
        answer:
          "Yes, most boxes are reusable 3–4 times. Store them flat after your move. VanJet can collect and recycle boxes after your move.",
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
