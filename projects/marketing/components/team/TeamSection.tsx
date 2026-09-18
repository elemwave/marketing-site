import Image from "next/image";
import { TEAM_INTRO, TEAM_MEMBERS, type TeamMember } from "@/lib/team-content";

/** Page-specific presentation for the static team catalogue. */
export function TeamSection() {
  return (
    <section className="bg-white px-[clamp(20px,4vw,56px)] pb-[clamp(64px,8vw,112px)] pt-[clamp(56px,8vw,104px)]">
      <div className="mx-auto mb-[clamp(32px,4vw,48px)] flex max-w-[760px] flex-col gap-5">
        <span className="font-heading text-[12px] font-semibold uppercase tracking-[2.5px] text-ink-muted">
          {TEAM_INTRO.eyebrow}
        </span>
        <h1 className="m-0 text-balance font-heading text-[clamp(30px,4vw,48px)] font-semibold leading-[1.15] text-ink">
          {TEAM_INTRO.heading}
        </h1>
        <div aria-hidden className="h-[3px] w-16 rounded-[3px] bg-ink" />
        <p className="m-0 text-pretty text-[17px] leading-[1.7] text-ink-muted">
          {TEAM_INTRO.body}
        </p>
      </div>

      <div className="mx-auto flex max-w-[1100px] flex-wrap justify-center gap-[clamp(24px,3vw,36px)]">
        {TEAM_MEMBERS.map((member) => (
          <TeamCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article
      aria-labelledby={teamMemberHeadingId(member)}
      className="flex w-full max-w-[340px] flex-[0_1_340px] flex-col overflow-hidden rounded-[20px] border border-[#E6EAF0] bg-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.10)]"
    >
      <div className="relative aspect-[4/5] bg-surface">
        <Image
          src={member.portrait}
          alt={member.portraitAlt}
          fill
          sizes="(min-width: 1120px) 340px, (min-width: 760px) 45vw, calc(100vw - 40px)"
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-col gap-2 px-7 pb-7 pt-6">
        <h2
          id={teamMemberHeadingId(member)}
          className="m-0 font-heading text-[19px] font-semibold text-ink"
        >
          {member.name}
        </h2>
        <p className="m-0 font-heading text-[12px] font-semibold uppercase tracking-[2px] text-blue-500">
          {member.role}
        </p>
        <p className="m-0 mt-1 text-pretty text-[15px] leading-[1.65] text-ink-muted">
          {member.summary}
        </p>
      </div>
    </article>
  );
}

function teamMemberHeadingId(member: TeamMember): string {
  return `team-member-${member.portrait.slice("/images/staff/".length, -".webp".length)}`;
}
