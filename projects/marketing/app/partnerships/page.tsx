import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PartnershipsHero } from "@/components/partnerships/PartnershipsHero";
import { PartnerMarquee } from "@/components/partnerships/PartnerMarquee";
import { PartnershipsNarrative } from "@/components/partnerships/PartnershipsNarrative";
import { BecomePartner } from "@/components/partnerships/BecomePartner";

export const metadata: Metadata = {
  title: "Partnerships",
  description:
    "The aerospace and research collaborations behind Elemwave's computational electromagnetics work, and how to start one.",
};

export default function Partnerships() {
  return (
    <>
      {/* The band clips the header glow, which is wider than the viewport. */}
      <div className="relative overflow-hidden bg-navy-950">
        <Header currentPath="/partnerships" />
        <PartnershipsHero />
      </div>
      <PartnerMarquee />
      <PartnershipsNarrative />
      <BecomePartner />
      <Footer />
    </>
  );
}
