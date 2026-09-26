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
      <PartnershipsHero />
      <PartnerMarquee />
      <PartnershipsNarrative />
      <BecomePartner />
    </>
  );
}
