const criteriaItems = [
  {
    title: "Grade Level",
    badge: "9th, 10th, or 11th",
    description:
      "Students must be in 9th, 10th, or 11th grade. This ensures they have upcoming SAT opportunities to benefit from improved scores.",
    accent: "text-[#60a5fa]",
    badgeBg: "bg-[#3b74f626]",
    iconBg: "bg-[#3b74f626]",
    icon: "🎓",
  },
  {
    title: "Academic Standing",
    badge: "GPA 3.7+",
    description:
      "A GPA of 3.7 or higher indicates the academic foundation needed to maximize gains. This is a merit-based scholarship, not need-based.",
    accent: "text-[#a78bfa]",
    badgeBg: "bg-[#8b5cf626]",
    iconBg: "bg-[#8b5cf626]",
    icon: "☆",
  },
  {
    title: "High Potential",
    badge: "Top University Bound",
    description:
      "Nominate students you identify as high-potential: likely to attend a top university, graduate near the top of the class, or achieve outstanding results.",
    accent: "text-[#34d399]",
    badgeBg: "bg-[#10b98126]",
    iconBg: "bg-[#10b98126]",
    icon: "↗",
  },
];

export default function SelectionCriteriaSection() {
  return (
    <section className="bg-[#141c42] px-4 py-16 text-white sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
        <div className="flex h-full flex-col">
          <span className="inline-flex w-fit rounded-full border border-[#3b74f666] bg-[#3b74f61a] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">
            Selection Criteria
          </span>

          <h2 className="mt-5 font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-white sm:text-5xl">
            Who Should <span className="text-[#3b74f6]">You Nominate?</span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
            Counselors have complete control over selection. Use these criteria as a starting point
            but ultimately, trust your judgment. You know your students best.
          </p>

          <div
            className="mt-8 rounded-2xl border border-[#3b74f640] bg-[#3b74f624] p-5 sm:p-6 lg:mt-auto"
            style={{
              background:
                "linear-gradient(98deg, rgba(0, 40, 132, 0.60) -32.79%, rgba(35, 68, 144, 0.10) 47.19%, rgba(0, 40, 132, 0.60) 131.93%)",
            }}
          >
            <p className="text-sm leading-7 text-white/70">
              <span className="font-semibold text-[#3b74f6]">Note:</span> Each participating high
              school is initially allocated{" "}
              <span className="font-semibold text-white">10 scholarship spots</span>. If you&apos;d
              like to nominate more than 10 students, let us know additional spots may be available
              when capacity allows.
            </p>
          </div>
        </div>

        <div className="flex h-full flex-col gap-4">
          {criteriaItems.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[#3b74f633] bg-[#17306f] p-4 sm:p-5 lg:flex-1"
              style={{background: 'linear-gradient(90deg, rgba(35, 68, 144, 0) 0%, #002884 100%)'}}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-base ${item.iconBg} ${item.accent}`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-['Norwester',sans-serif] text-2xl uppercase leading-none tracking-wide text-white">
                      {item.title}
                    </h3>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.accent} ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-7 text-white/80">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
