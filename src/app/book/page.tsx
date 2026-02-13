import { BookingWizard } from "@/components/booking/BookingWizard";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Book your move | VanJet",
  description:
    "Book a removal in minutes. Choose items, set dates, pay securely.",
};

export default function BookPage() {
  return (
    <div>
      <Navbar />
      <BookingWizard />
    </div>
  );
}
