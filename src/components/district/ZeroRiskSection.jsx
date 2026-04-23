import Link from "next/link";

const districtNeverPays = [
  "No contract",
  "No financial cost",
  "No academic disruption",
  "No staff workload beyond nominations",
  "No obligation after completion",
];

const PLACEHOLDER_QUOTE_IMAGE = "/zero-risk.png";

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

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-[#141c421a] shadow-[0_4px_30px_rgba(20,28,66,0.08)]">
            <div className="bg-[#141c42] px-6 py-5">
              <h3 className="font-['Norwester',sans-serif] text-3xl uppercase tracking-wide text-white">
                What the District Never Pays
              </h3>
            </div>

            <ul className="divide-y divide-[#141c420f]">
              {districtNeverPays.map((item) => (
                <li key={item} className="flex items-center gap-3 px-6 py-4 text-[15px] text-[#141c42cc]">
                  <span className="grid h-5 w-5 place-items-center rounded-full text-xs text-[#22c55e]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-r from-[#141c42] to-[#002884] px-6 py-6 text-white">
            <p className="font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-[#3b74f6]">
              About 1550+
            </p>
            <p className="mt-5 text-2xl leading-[1.3] text-white/80">
              1550+ has been offering test prep for over <span className="font-bold text-white">15 years</span>,
              with the majority of our private clients achieving scores in the{" "}
              <span className="font-bold text-[#3b74f6]">top 2%</span>. The founder received full scholarships to
              both Denison University and Johns Hopkins University.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-[#3b74f6] transition-colors hover:text-white"
            >
              Read our full story <span aria-hidden="true">→</span>
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-2xl px-6 py-8 text-white lg:col-span-2">
            <img
              src={PLACEHOLDER_QUOTE_IMAGE}
              alt="Motivational quote background placeholder"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141c42] to-[#141c4233]" />
            <p className="relative w-full font-['Norwester',sans-serif] text-4xl uppercase leading-[1.2] tracking-wide sm:text-5xl">
              &quot;When high-potential students receive strong coaching, they achieve more.&quot;
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
