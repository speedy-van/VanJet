// ─── VanJet · Admin Layout (Server Component) ────────────────
// Protects all /admin/* routes. Redirects unauthenticated users to login.
// Shows 403 if user is not an admin.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";

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

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
