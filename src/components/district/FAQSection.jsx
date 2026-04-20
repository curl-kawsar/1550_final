const faqItems = [
  "Is there any cost to families?",
  "Are families required to buy anything?",
  "What commitment is required from families?",
  "How much time will this take from school staff?",
  "What does the program involve?",
  "Does this interfere with school hours?",
  "Is participation confidential?",
  "Why does your company offer this for free?",
  "Who created this program?",
  "How often is this program offered?",
];

const PLACEHOLDER_ANSWER =
  "Placeholder answer: add your final response here. This text is temporary and can be replaced manually.";

export default function FAQSection() {
  return (
    <section className="bg-[#141c42] px-4 py-16 text-white sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-[#3b74f666] bg-[#3b74f61a] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">
            Frequently Asked
          </span>

          <h2 className="mt-5 font-['Norwester',sans-serif] text-4xl uppercase tracking-wide sm:text-5xl">
            <span className="text-[#3b74f6]">Frequently Asked</span>{" "}
            <span className="text-white">Questions</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/55">
            You may have specific questions regarding the 1550+ Scholarship Program. Here are some
            frequently asked questions.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl bg-white text-[#141c42] shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
          {faqItems.map((question, index) => (
            <details key={question} className="group border-b border-[#141c4212] last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-8">
                <span className="text-sm font-semibold sm:text-[15px]">{question}</span>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-[#141c4226] text-xs text-[#141c4280] transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="px-5 pb-5 sm:px-8">
                <p className="text-sm leading-7 text-[#141c4299]">
                  {PLACEHOLDER_ANSWER} ({index + 1})
                </p>
              </div>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/35">Have a question that&apos;s not answered here?</p>
        <p className="mt-3 text-center text-sm font-semibold text-[#3b74f6]">contact@1550plus.com</p>
      </div>
    </section>
  );
}
