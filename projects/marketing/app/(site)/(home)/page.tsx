import { Hero } from "@/components/home/Hero";
import { SoftwareSection } from "@/components/home/SoftwareSection";
import { ScienceSection } from "@/components/home/ScienceSection";
import { BookMeeting } from "@/components/home/BookMeeting";
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
      <Hero />
      <SoftwareSection />
      <ScienceSection />
      <BookMeeting />
    </>
  );
}
