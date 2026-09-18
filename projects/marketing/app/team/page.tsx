import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { OrganisationRecord } from "@/components/site/OrganisationRecord";
import { TeamSection } from "@/components/team/TeamSection";
import { pageMetadata } from "@/lib/page-metadata";

const TEAM_DESCRIPTION =
  "Meet the engineers and researchers behind Elemwave's computational electromagnetics, EMC, RF, and engineering software work.";

export const metadata = pageMetadata({
  title: "Our Team",
  description: TEAM_DESCRIPTION,
  path: "/team",
});

export default function Team() {
  return (
    <>
      <OrganisationRecord />
      {/* The band clips the header glow, which is wider than the viewport. */}
      <div className="overflow-hidden bg-navy-950">
        <Header currentPath="/team" />
      </div>
      <main id="main-content">
        <TeamSection />
      </main>
      <Footer />
    </>
  );
}
