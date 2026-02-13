<div align="center">

# 🚐 VanJet

**UK's Modern Removal & Man-and-Van Marketplace**

Built with Next.js 16 · Chakra UI · Neon Postgres · Stripe Connect · Mapbox

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fspeedy-van%2FVanJet&env=DATABASE_URL,NEXT_PUBLIC_MAPBOX_TOKEN,STRIPE_SECRET_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,NEXTAUTH_SECRET,NEXTAUTH_URL,ADMIN_EMAIL,ADMIN_PASSWORD&project-name=vanjet&repository-name=VanJet)

</div>

---

## Overview

VanJet is a full-stack marketplace connecting customers who need removal services with verified van drivers across the UK. Customers get instant AI-validated pricing, book online with Stripe payments, and track their move — all from a modern, mobile-first interface.

### Key Features

- **7-Step Booking Wizard** — addresses (Mapbox autocomplete), date/time, items picker (666 real items with images), review, payment, confirmation
- **Hybrid Pricing Engine** — deterministic rules-based calculation + optional Grok AI price validation
- **Stripe Connect** — customer payments, 15% platform fee, driver payouts
- **Admin Dashboard** — manage jobs, bookings, quotes, drivers, users; edit/cancel/reprice bookings with full audit trail
- **40 SEO Landing Pages** — programmatic `/[service]/[city]` pages with JSON-LD structured data
- **Blog** — 4 SEO-optimised articles with rich content
- **Mobile-First Design** — responsive Chakra UI with Trust Blue (#1D4ED8) design system

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| UI | Chakra UI v3, Framer Motion |
| Database | Neon Postgres (serverless) via Drizzle ORM |
| Auth | NextAuth v4 (JWT, credentials provider) |
| Payments | Stripe Connect (Express) |
| Maps | Mapbox GL JS (geocoding, directions, markers) |
| AI | Grok (xAI) — optional pricing validation |
| Email | Resend (transactional) |
| Language | TypeScript (strict) |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (pages)           # Homepage, /book, /blog, /not-found
│   ├── [service]/[city]  # 40 SEO landing pages (SSG)
│   ├── admin/            # Admin dashboard (7 pages)
│   │   └── (dashboard)/  # Protected route group
│   ├── api/
│   │   ├── admin/        # Admin mutation endpoints
│   │   │   └── bookings/[id]/ # update, cancel, reprice
│   │   ├── auth/         # NextAuth
│   │   ├── jobs/         # Job creation, mark-paid
│   │   ├── payment/      # Stripe payment intents
│   │   └── pricing/      # Standalone price calculation
│   └── blog/[slug]       # Blog articles (SSG)
├── components/
│   ├── admin/            # AdminShell, BookingManagement, JobStatusForm, etc.
│   ├── booking/          # 7 wizard steps + AddressAutocomplete
│   └── seo/              # LocationPageContent, JSON-LD generators
├── lib/
│   ├── db/               # Drizzle client + schema (7 tables + audit log)
│   ├── pricing/          # Engine, rates, Grok validator, history stubs
│   ├── mapbox/           # Geocoding + directions
│   └── seo/              # Site metadata, schema.org generators
└── types/                # NextAuth type extensions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- [Stripe](https://stripe.com) account (test keys work)
- [Mapbox](https://mapbox.com) access token
- (Optional) [Grok/xAI](https://x.ai) API key for AI pricing

### 1. Clone & Install

```bash
git clone https://github.com/speedy-van/VanJet.git
cd VanJet
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) below for details.

### 3. Push Database Schema

```bash
npm run db:push
```

This pushes the Drizzle schema to your Neon database (no migration files needed for initial setup).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Access Admin Dashboard

Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env.local`. The admin user is auto-created on first login (dev bootstrap).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox public access token (GB geocoding) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (`pk_test_...` or `pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Prod | Stripe webhook signing secret |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | App URL (`http://localhost:3000` or production URL) |
| `NEXT_PUBLIC_URL` | Yes | Public-facing app URL |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `GROK_API_KEY` | No | Grok (xAI) API key for AI pricing validation |
| `ENABLE_AI_PRICING` | No | Set to `"true"` to enable Grok price validation |
| `RESEND_API_KEY` | No | Resend API key for transactional emails |
| `VOODOO_SMS_API_KEY` | No | VoodooSMS key for SMS notifications |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |

---

## Database Schema

7 tables + 1 audit log table, managed via Drizzle ORM:

- **users** — customers, drivers, admins (single table, role-based)
- **driver_profiles** — company info, van size, Stripe Connect, ratings
- **jobs** — removal jobs with addresses, coordinates, pricing, schedule
- **job_items** — line items per job (name, quantity, weight, volume, fragile)
- **quotes** — driver bids on jobs (price, message, expiry)
- **bookings** — confirmed orders (Stripe payment, status, repricing history)
- **reviews** — post-job ratings and comments
- **admin_audit_logs** — audit trail for admin actions (edit, cancel, reprice)

---

## Deploy to Vercel

### One-Click Deploy

Click the "Deploy with Vercel" button at the top of this README. You'll be prompted to fill in the required environment variables.

### Manual Deploy

1. Push to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com/new)
3. Set **Root Directory** to `my-vanjet` (if the repo root is the parent folder) or leave as `/` if the Next.js project is at root
4. Add all environment variables from the table above
5. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` to your Vercel domain (e.g. `https://vanjet.vercel.app`)
6. Deploy

### Post-Deploy

- Run `npm run db:push` locally (or via Vercel CLI) to ensure database schema is synced
- Set up Stripe webhooks pointing to `https://your-domain.com/api/webhooks/stripe`
- Test the booking flow end-to-end

---

## Admin Features

| Feature | Description |
|---|---|
| **Dashboard** | Overview stats: jobs, bookings, drivers, revenue |
| **Jobs** | View all jobs, filter by status, view details, update status |
| **Bookings** | List with payment filter, click into detail page |
| **Booking Management** | Edit addresses/schedule/items, recalculate price, cancel with reason |
| **Quotes** | Accept/reject driver quotes |
| **Drivers** | View/verify driver profiles |
| **Users** | Browse all users by role |
| **Audit Log** | Full history of admin actions with JSON diffs |

---

## Pricing Engine

The hybrid pricing engine in `src/lib/pricing/` calculates deterministic prices:

```
Total = (Base + Distance + Floor + Extras) × Vehicle × Demand + VAT(20%)
```

- **22 job types** with individual base prices
- **5-tier distance rates** (£2/km first 10km → £0.85/km 200km+) with 1.4× round-trip multiplier
- **Floor surcharges** (£15/floor, max £75, waived with lift)
- **Extra services** (packing, assembly, disassembly, cleaning, 3 insurance tiers)
- **Demand multipliers** (weekend, peak months, urgency/lead-time)
- **5 vehicle types** auto-recommended by volume/weight
- **Optional Grok AI validation** blends 60% engine / 40% AI when prices diverge >20%

---

## Licence

Private — All rights reserved.

---

<div align="center">
  <strong>VanJet</strong> — Moving made simple 🚐
</div>
