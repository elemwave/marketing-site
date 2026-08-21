/** Two-column narrative: heading on the left, the prose on the right. */
export function PartnershipsNarrative() {
  return (
    <section className="bg-white px-[clamp(20px,4vw,56px)] py-[clamp(48px,7vw,96px)]">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-[clamp(32px,5vw,72px)]">
        <div className="min-w-[min(100%,300px)] flex-[1_1_380px]">
          <h2 className="m-0 font-heading text-[clamp(26px,3.5vw,40px)] font-semibold leading-[1.25] text-ink">
            Collaborations That Shape Our Work
          </h2>
          <div aria-hidden className="mt-[18px] h-[3px] w-16 rounded-[3px] bg-ink" />
        </div>
        <div className="flex min-w-[min(100%,300px)] flex-[1_1_420px] flex-col gap-4">
          <p className="m-0 text-[16px] leading-[1.75] text-ink-muted">
            Our work has connected us with leading aerospace and research
            organisations, including Airbus and the University of Granada. Our
            tools have integrated proprietary Airbus solvers, and our background
            includes European initiatives such as HECATE, led by Collins
            Aerospace with partners like Airbus, Safran, and NLR.
          </p>
          <p className="m-0 text-[16px] leading-[1.75] text-ink-muted">
            These collaborations reflect the standard we bring to every project:
            rigorous engineering, clear communication, and software that
            supports real decisions.
          </p>
        </div>
      </div>
    </section>
  );
}
