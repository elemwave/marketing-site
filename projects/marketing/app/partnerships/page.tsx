import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { OrganisationRecord } from "@/components/site/OrganisationRecord";
import { PartnershipsHero } from "@/components/partnerships/PartnershipsHero";
import { PartnerMarquee } from "@/components/partnerships/PartnerMarquee";
import { PartnershipsNarrative } from "@/components/partnerships/PartnershipsNarrative";
import { BecomePartner } from "@/components/partnerships/BecomePartner";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: "Partnerships",
  description:
    "The aerospace and research collaborations behind Elemwave's computational electromagnetics work, and how to start one.",
  path: "/partnerships",
});

export default function Partnerships() {
  return (
    <>
      <OrganisationRecord />
      {/*
       * `relative` stays so the marquee can paint in front of this navy field.
       * Overflow is not clipped here: PartnerMarquee tucks under the band with
       * a negative margin, and clipping a positioned ancestor cuts the cards.
       */}
      <div className="relative bg-navy-950">
        <Header currentPath="/partnerships" />
        <main id="main-content">
          <PartnershipsHero />
          <PartnerMarquee />
          <PartnershipsNarrative />
          <BecomePartner />
        </main>
      </div>
      <Footer />
    </>
  );
}
