import { PROBLEMS } from "@/lib/home-content";
import { ItemTabs } from "./ItemTabs";
import { SectionHeading } from "./SectionHeading";

/** "The challenges" — the applications a platform has to answer for, ahead of Our Solution. */
export function ProblemsSection() {
  return (
    <section
      id="problems"
      className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(48px,7vw,88px)]"
    >
      <SectionHeading title="The challenges" />
      <ItemTabs items={PROBLEMS} groupLabel="Applications" />
    </section>
  );
}
