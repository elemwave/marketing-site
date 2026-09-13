import { Header } from "@/components/site/Header";
import { Hero } from "@/components/home/Hero";
import { SoftwareSection } from "@/components/home/SoftwareSection";
import { ScienceSection } from "@/components/home/ScienceSection";
import { BookMeeting } from "@/components/home/BookMeeting";
import { Footer } from "@/components/site/Footer";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: "Elemwave - Advanced electromagnetics simulations",
  description: "Innovative solutions for advanced electromagnetics simulations.",
  path: "/",
  isBrandTitle: true,
});

export default function Home() {
  return (
    <>
      <div id="top" className="overflow-hidden bg-navy-950">
        <Header currentPath="/" />
        <Hero />
      </div>
      <SoftwareSection />
      <ScienceSection />
      <BookMeeting />
      <Footer />
    </>
  );
}
