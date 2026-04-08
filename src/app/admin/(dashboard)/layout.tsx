// ─── VanJet · Admin Layout (Server Component) ────────────────
// Protects all /admin/* routes. Redirects unauthenticated users to login.
// Shows 403 if user is not an admin.
// Provides Arabic-first localization with RTL support.

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { NewOrderListener } from "@/components/admin/NewOrderListener";
import { ZyphonCursor } from "@/components/admin/ZyphonCursor";
import { getLocaleFromCookie, getDirection, type Locale } from "@/i18n/config";

export const metadata = {
  title: "Admin Dashboard | VanJet",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "48px", fontWeight: 800, color: "#e53e3e" }}>
            403
          </h1>
          <p style={{ fontSize: "18px", color: "#4a5568" }}>
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Get locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = getLocaleFromCookie(localeCookie);
  const direction = getDirection(locale);
  
  // Load messages for the locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div dir={direction} lang={locale} style={{ fontFamily: locale === 'ar' ? 'Cairo, Inter, sans-serif' : 'Inter, sans-serif' }}>
        <AdminShell user={session.user} locale={locale}>{children}</AdminShell>
        <NewOrderListener />
        <ZyphonCursor />
      </div>
    </NextIntlClientProvider>
  );
}
