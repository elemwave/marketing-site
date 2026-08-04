import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { SoftwareSection } from "@/components/home/SoftwareSection";
import { ScienceSection } from "@/components/home/ScienceSection";
import { BookMeeting } from "@/components/home/BookMeeting";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <div id="top" className="overflow-hidden bg-navy-950">
        <Header />
        <Hero />
      </div>
      <SoftwareSection />
      <ScienceSection />
      <BookMeeting />
      <Footer />
    </>
  );
}
