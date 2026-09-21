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
  return <TeamSection />;
}
