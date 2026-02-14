// ─── VanJet · Tracking Test Layout (Dev Guard) ────────────────
import { redirect } from "next/navigation";

export default function TrackingTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    redirect("/driver/dashboard");
  }

  return <>{children}</>;
}
