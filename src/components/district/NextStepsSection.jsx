const steps = [
  {
    label: "Step 01",
    title: "Submit Interest",
    description: "Provide your district name and a primary contact. Takes less than 2 minutes.",
    accent: "text-[#3b74f6]",
    iconBg: "bg-[#3b74f612]",
    icon: "✈",
  },
  {
    label: "Step 02",
    title: "Confirmation",
    description: "To confirm availability in our upcoming group class",
    accent: "text-[#8b5cf6]",
    iconBg: "bg-[#8b5cf612]",
    icon: "◔",
  },
  {
    label: "Step 03",
    title: "Nominate Students",
    description:
      "Once confirmed, we'll send you the nomination form. You'll fill it out and we'll take care of the rest.",
    accent: "text-[#22c55e]",
    iconBg: "bg-[#22c55e12]",
    icon: "👥",
  },
];

export default function NextStepsSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3b74f64d] bg-[#3b74f60d] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">
            <span className="h-2 w-2 rounded-full bg-[#3b74f6]" />
            Limited Availability
          </span>

          <h2 className="mt-5 font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-[#141c42] sm:text-5xl">
            Reserve Your District&apos;s <span className="text-[#3b74f6]">10 Spots</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#141c4299]">
            To reserve your district&apos;s scholarship awards, please fill out the form below.
            Spaces are limited and are first come first served. Spots are limited and assigned on a
            first-confirmed basis.
          </p>
        </div>

        <h3 className="mt-10 text-center font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-[#141c42]">
          Next Steps
        </h3>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="flex gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-base ${step.iconBg} ${step.accent}`}>
                <span aria-hidden="true">{step.icon}</span>
              </div>

              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${step.accent}`}>{step.label}</p>
                <h4 className="mt-1 font-['Norwester',sans-serif] text-[28px] uppercase leading-none tracking-wide text-[#141c42]">
                  {step.title}
                </h4>
                <p className="mt-2 text-sm leading-7 text-[#141c428c]">{step.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="/district/register?district=District"
            className="inline-flex items-center gap-2 rounded-xl bg-[#004eff] px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)] transition hover:bg-[#0e5dff]"
          >
            Reserve Your Spots
            <span aria-hidden="true">›</span>
          </a>
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-[#141c42] p-5 text-white">
          <p className="text-xs text-white/40">Or email us directly</p>
          <p className="mt-1 text-sm font-semibold">contact@1550plus.com</p>
        </div>
      </div>
    </section>
  );
}
