const districtNeverPays = [
  "No contract",
  "No financial cost",
  "No academic disruption",
  "No staff workload beyond nominations",
  "No obligation after completion",
];

const concerns = [
  {
    title: "What if students lose time?",
    description:
      "The program is intentionally short (6 weeks) and runs outside school hours. If a student disengages, there is no academic or financial impact on the district. If they commit, the upside is measurable score improvement.",
  },
  {
    title: "What about limited allocation per cohort?",
    description:
      "We work with a small number of districts per cycle to maintain quality. Once confirmed, your 10 seats are held for 10 business days. If unused, they are reassigned to another district.",
  },
];

const PLACEHOLDER_QUOTE_IMAGE = "/district-risk-quote-placeholder.jpg";

export default function ZeroRiskSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-[#3b74f64d] bg-[#3b74f60d] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">
            Risk Assessment
          </span>

          <h2 className="mt-5 font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-[#141c42] sm:text-5xl">
            The School Carries <span className="text-[#3b74f6]">Zero Risk</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="flex h-full flex-col gap-6">
            <article className="overflow-hidden rounded-2xl border border-[#141c421a] shadow-[0_4px_30px_rgba(20,28,66,0.08)]">
              <div className="bg-[#141c42] px-6 py-5">
                <h3 className="font-['Norwester',sans-serif] text-3xl uppercase tracking-wide text-white">
                  What the District Never Pays
                </h3>
              </div>

              <ul className="divide-y divide-[#141c420f]">
                {districtNeverPays.map((item) => (
                  <li key={item} className="flex items-center gap-3 px-6 py-4 text-[15px] text-[#141c42cc]">
                    <span className="grid h-5 w-5 place-items-center rounded-full text-xs text-[#22c55e]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="relative overflow-hidden rounded-2xl px-6 py-8 text-white">
              <img
                src={PLACEHOLDER_QUOTE_IMAGE}
                alt="Motivational quote background placeholder"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#141c42d9] to-[#141c4240]" />
              <p className="relative max-w-[290px] font-['Norwester',sans-serif] text-3xl uppercase leading-[1.2] tracking-wide">
                &quot;When high-potential students receive strong coaching, they achieve more.&quot;
              </p>
            </article>
          </div>

          <div className="flex h-full flex-col gap-5">
            <h3 className="font-['Norwester',sans-serif] text-[34px] uppercase tracking-wide text-[#141c42]">
              Common Concerns Addressed
            </h3>

            {concerns.map((concern) => (
              <article
                key={concern.title}
                className="rounded-2xl border border-[#141c4214] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(20,28,66,0.06)] sm:px-6"
              >
                <h4 className="text-sm font-bold text-[#141c42]">{concern.title}</h4>
                <p className="mt-3 text-sm leading-7 text-[#141c4299]">{concern.description}</p>
              </article>
            ))}

            <article className="rounded-2xl bg-gradient-to-r from-[#141c42] to-[#002884] px-6 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">About 1550+</p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                1550+ has been offering test prep for over{" "}
                <span className="font-bold text-white">15 years</span>, with the majority of our private clients
                achieving scores in the <span className="font-bold text-[#3b74f6]">top 2%</span>. The founder
                received full scholarships to both Denison University and Johns Hopkins University.
              </p>
              <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3b74f6]">
                Read our full story <span aria-hidden="true">→</span>
              </a>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
