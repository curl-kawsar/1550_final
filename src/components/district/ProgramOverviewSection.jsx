const overviewCards = [
  {
    title: "Zero Cost",
    subtitle: "No Financial Risk",
    description:
      "Each scholarship covers full enrollment in the group SAT program at absolutely no cost to the district or families. No hidden fees, no upsells.",
    accent: "text-[#22c55e]",
    iconBg: "bg-[#22c55e14]",
    icon: "$",
  },
  {
    title: "6 Weeks",
    subtitle: "Minimal Disruption",
    description:
      "The program is intentionally short and runs entirely outside school hours evenings, weekends, and summers to avoid any scheduling conflicts.",
    accent: "text-[#3b74f6]",
    iconBg: "bg-[#3b74f614]",
    icon: "◔",
  },
  {
    title: "18 Sessions",
    subtitle: "Structured Curriculum",
    description:
      "Students attend 18 live virtual sessions with trained tutors, covering content mastery, test-taking strategy, and full practice assessments.",
    accent: "text-[#f59e0b]",
    iconBg: "bg-[#f59e0b14]",
    icon: "◫",
  },
  {
    title: "No Obligation",
    subtitle: "Complete Control",
    description:
      "Districts retain complete control over which students participate. No contracts, no commitments, no obligations after the program ends.",
    accent: "text-[#e879f9]",
    iconBg: "bg-[#e879f914]",
    icon: "⬡",
  },
  {
    title: "10 Spots",
    subtitle: "Per High School",
    description:
      "Each participating high school receives an initial allocation of 10 scholarship spots. Additional spots may be available when capacity allows.",
    accent: "text-[#06b6d4]",
    iconBg: "bg-[#06b6d414]",
    icon: "👥",
  },
  {
    title: "Full Reporting",
    subtitle: "Transparent Results",
    description:
      "Districts receive a confidential report showing scores for all students. Parents receive a personal score report for their child.",
    accent: "text-[#f97316]",
    iconBg: "bg-[#f9731614]",
    icon: "▥",
  },
];

export default function ProgramOverviewSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#3b74f64d] bg-[#3b74f60d] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">
            Program Overview
          </span>

          <h2 className="mt-5 font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-[#141c42] sm:text-5xl">
            Designed to Be <span className="text-[#3b74f6]">Simple</span> for Schools
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#141c4299]">
            Each cycle, a select number of districts receive 10 fully-funded scholarships for promising students from each high school. Counselors nominate we handle everything else.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#141c4214] bg-white p-6 shadow-[0_2px_20px_rgba(20,28,66,0.06)]"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-xl text-base ${card.iconBg} ${card.accent}`}>
                <span aria-hidden="true">{card.icon}</span>
              </div>

              <h3 className="mt-5 font-['Norwester',sans-serif] text-[32px] uppercase leading-none tracking-wide text-[#141c42]">
                {card.title}
              </h3>

              <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.18em] ${card.accent}`}>
                {card.subtitle}
              </p>

              <p className="mt-3 text-sm leading-7 text-[#141c4299]">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
