// ─── VanJet · 404 Not Found ───────────────────────────────────
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "var(--font-inter), sans-serif",
        textAlign: "center",
        background: "#F9FAFB",
      }}
    >
      <p style={{ fontSize: "5rem", fontWeight: 900, color: "#E5E7EB", margin: 0 }}>
        404
      </p>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "#111827",
          marginBottom: 8,
        }}
      >
        Page Not Found
      </h1>
      <p style={{ color: "#6B7280", maxWidth: 400, marginBottom: 32, lineHeight: 1.7 }}>
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
        moved. Try one of these instead:
      </p>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <NavLink href="/">Home</NavLink>
        <NavLink href="/book">Book a Move</NavLink>
        <NavLink href="/blog">Blog</NavLink>
        <NavLink href="/man-and-van/london">Man &amp; Van London</NavLink>
        <NavLink href="/house-removals/manchester">House Removals</NavLink>
      </nav>
    </main>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        padding: "10px 20px",
        borderRadius: 8,
        background: "#EBF1FF",
        color: "#1D4ED8",
        fontWeight: 600,
        fontSize: "0.9rem",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
