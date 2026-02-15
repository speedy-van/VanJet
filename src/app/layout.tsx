import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { SITE } from "@/lib/seo/site";
import {
  generateLocalBusinessSchema,
  generateHowItWorksSchema,
} from "@/lib/seo/schema";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: {
    default: "Free UK Moving Marketplace – Pay Drivers Directly | VanJet",
    template: "%s | VanJet UK",
  },
  description:
    "Get instant moving quotes from verified UK drivers. No platform fees. No hidden charges. You pay only the driver price.",
  keywords: [
    "free moving marketplace",
    "no platform fees",
    "man and van",
    "house removals",
    "removal company UK",
    "furniture delivery",
    "office removals",
    "piano movers",
    "student removals",
    "van hire with driver",
    "instant removal quotes",
    "cheap removals UK",
    "zero commission",
    "VanJet",
  ],
  applicationName: SITE.name,
  category: "Removals & Delivery",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.baseUrl,
    siteName: SITE.name,
    title: "Free UK Moving Marketplace – No Platform Fees",
    description:
      "Get instant quotes from verified UK drivers. No fees. Pay drivers directly.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VanJet — UK Removal & Delivery Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: "Free UK Moving Marketplace – No Platform Fees",
    description:
      "Get instant quotes from verified UK drivers. No fees. Pay drivers directly.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Preconnects */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.mapbox.com" />

        {/* UK geo meta */}
        <meta name="geo.region" content="GB" />
        <meta name="geo.placename" content="United Kingdom" />

        {/* Organisation + HowTo JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateHowItWorksSchema()),
          }}
        />
      </head>
      <body className={inter.variable} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <Providers>{children}</Providers>

        {/* Google Analytics (env-driven) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}

        {/* Google Tag Manager (env-driven) */}
        {gtmId && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </body>
    </html>
  );
}
