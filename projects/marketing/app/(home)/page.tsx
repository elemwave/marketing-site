import { Header } from "@/components/site/Header";
import { Hero } from "@/components/home/Hero";
import { SoftwareSection } from "@/components/home/SoftwareSection";
import { ScienceSection } from "@/components/home/ScienceSection";
import { BookMeeting } from "@/components/home/BookMeeting";
import { Footer } from "@/components/site/Footer";
import { OrganisationRecord } from "@/components/site/OrganisationRecord";
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
      <OrganisationRecord />
      <Header currentPath="/" />
      <main id="main-content">
        <Hero />
        <SoftwareSection />
        <ScienceSection />
        <BookMeeting />
      </main>
      <Footer />
    </>
  );
}
