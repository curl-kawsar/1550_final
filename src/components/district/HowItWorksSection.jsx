const steps = [
  {
    step: "Step 01",
    title: "You Identify Students",
    description:
      "You identify 10 high potential students to participate (9th-11th grade).",
    number: 1,
    accent: "text-[#3b74f6]",
    chipBg: "bg-[#3b74f612]",
    chipBorder: "border-[#3b74f633]",
    badgeBg: "bg-[#3b74f6]",
    icon: "👥",
  },
  {
    step: "Step 02",
    title: "We Invite Families",
    description:
      "We provide the invitation that you will send to parents of your selected students.",
    number: 2,
    accent: "text-[#8b5cf6]",
    chipBg: "bg-[#8b5cf612]",
    chipBorder: "border-[#8b5cf633]",
    badgeBg: "bg-[#8b5cf6]",
    icon: "✉",
  },
  {
    step: "Step 03",
    title: "Parents Register",
    description:
      "Parents register their child for the program at no cost. Their data is never sold.",
    number: 3,
    accent: "text-[#06b6d4]",
    chipBg: "bg-[#06b6d412]",
    chipBorder: "border-[#06b6d433]",
    badgeBg: "bg-[#06b6d4]",
    icon: "🧑",
  },
  {
    step: "Step 04",
    title: "We Handle Everything",
    description:
      "Our trained tutors and support staff handle all parent questions, scheduling, and live instructions.",
    number: 4,
    accent: "text-[#22c55e]",
    chipBg: "bg-[#22c55e12]",
    chipBorder: "border-[#22c55e33]",
    badgeBg: "bg-[#22c55e]",
    icon: "💬",
  },
  {
    step: "Step 05",
    title: "You Receive a Report",
    description:
      "You receive a final report of your students' results. Parents receive a report for their child.",
    number: 5,
    accent: "text-[#f59e0b]",
    chipBg: "bg-[#f59e0b12]",
    chipBorder: "border-[#f59e0b33]",
    badgeBg: "bg-[#f59e0b]",
    icon: "📋",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#3b74f64d] bg-[#3b74f60d] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">
            The Process
          </span>

          <h2 className="mt-5 font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-[#141c42] sm:text-5xl">
            How It <span className="text-[#3b74f6]">Works</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#141c4299]">
            The process is designed to be simple for the district and structured for the students.
            Five steps from nomination to results.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {steps.map((step) => (
            <article key={step.step} className="text-center">
              <div className="mx-auto flex justify-center">
                <div
                  className={`relative grid h-20 w-20 place-items-center rounded-2xl border-2 text-2xl ${step.chipBg} ${step.chipBorder}`}
                >
                  <span aria-hidden="true">{step.icon}</span>
                  <span
                    className={`absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full font-['Norwester',sans-serif] text-xs text-white ${step.badgeBg}`}
                  >
                    {step.number}
                  </span>
                </div>
              </div>

              <p className={`mt-4 text-xs font-bold uppercase tracking-[0.18em] ${step.accent}`}>
                {step.step}
              </p>

              <h3 className="mt-3 font-['Norwester',sans-serif] text-[30px] uppercase leading-none tracking-wide text-[#141c42]">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#141c428c]">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#141c4214] bg-[#141c420a] px-6 py-5 sm:px-8">
          <p className="mx-auto max-w-4xl text-center text-sm leading-7 text-[#141c42b3]">
            Once confirmed, your{" "}
            <span className="font-semibold text-[#141c42]">
              10 seats are held for 10 business days
            </span>
            . If unused, they are reassigned to another district. We work with a small number of
            districts per cycle to maintain quality.
          </p>
        </div>
      </div>
    </section>
  );
}
