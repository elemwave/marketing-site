import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ContactSection } from "@/components/contact/ContactSection";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Elemwave in Granada, Spain about electromagnetic simulation, EMC, RF, and engineering software projects.",
  path: "/contact",
});

export default function Contact() {
  return (
    <>
      {/* The band clips the header glow, which is wider than the viewport. */}
      <div className="overflow-hidden bg-navy-950">
        <Header currentPath="/contact" />
      </div>
      <main id="main-content">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
