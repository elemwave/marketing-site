import { SOFTWARE_DESCRIPTION, TABS } from "@/lib/home-content";
import { ItemTabs } from "./ItemTabs";
import { Segments } from "./Segments";
import { SectionHeading } from "./SectionHeading";

/** "Our Solution" — tab circles + active item card. */
export function SoftwareSection() {
  return (
    <section
      id="software"
      className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(48px,7vw,88px)]"
    >
      <SectionHeading
        title="Our Solution"
        description={<Segments segments={SOFTWARE_DESCRIPTION} />}
      />
      <ItemTabs items={TABS} groupLabel="Capabilities" />
    </section>
  );
}
