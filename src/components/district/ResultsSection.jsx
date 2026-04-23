const studentResults = [
  { name: "Jiya G.", start: 500, final: 1030, improvement: 530, initial: "J" },
  { name: "Aarush T.", start: 950, final: 1370, improvement: 420, initial: "A" },
  { name: "Akil E.", start: 900, final: 1310, improvement: 410, initial: "A" },
  { name: "Dylan T.", start: 1190, final: 1480, improvement: 290, initial: "D" },
  { name: "Luke C.", start: 1240, final: 1510, improvement: 270, initial: "L" },
  { name: "Kavin P.", start: 970, final: 1070, improvement: 100, initial: "K" },
  { name: "Sarvesh P.", start: 1110, final: 1210, improvement: 100, initial: "S" },
  { name: "Aiden C.", start: 1430, final: 1500, improvement: 70, initial: "A" },
  { name: "Alex C.", start: 1490, final: 1500, improvement: 10, initial: "A" },
];

const highlightBars = studentResults.slice(0, 5);
const maxImprovement = Math.max(...studentResults.map((student) => student.improvement));

export default function ResultsSection() {
  return (
    <section className="bg-[#141c42] px-4 py-16 text-white sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#3b74f666] bg-[#3b74f61a] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b74f6]">
            Most Recent Cohort
          </span>

          <h2 className="mt-5 font-['Norwester',sans-serif] text-4xl uppercase tracking-wide text-white sm:text-5xl">
            Real Results, <span className="text-[#3b74f6]">Real Students</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/50">
            We love transparency and share your commitment to student success. Below are results
            from our Summer cohort.
          </p>
        </div>

        <div className="mt-12 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="grid grid-cols-[minmax(160px,1.2fr)_90px_90px_110px] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30 sm:px-6">
              <p>Student</p>
              <p>Start</p>
              <p>Final</p>
              <p>Improvement</p>
            </div>

            <div>
              {studentResults.map((student) => (
                <div
                  key={student.name}
                  className="grid grid-cols-[minmax(160px,1.2fr)_90px_90px_110px] items-center gap-3 border-b border-white/5 px-4 py-4 last:border-b-0 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-[#3b74f61a] font-['Norwester',sans-serif] text-xs text-[#3b74f6]">
                      {student.initial}
                    </span>
                    <span className="text-sm text-white">{student.name}</span>
                  </div>

                  <p className="text-sm text-white/50">{student.start}</p>
                  <p className="text-sm font-semibold text-white">{student.final}</p>
                  <p className="font-['Norwester',sans-serif] text-sm tracking-wide text-[#22c55e]">
                    +{student.improvement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Score Improvements
              </h3>

              <div className="mt-5 space-y-4">
                {highlightBars.map((student) => {
                  const width = (student.improvement / maxImprovement) * 100;

                  return (
                    <div key={`bar-${student.name}`} className="space-y-2">
                      <p className="text-xs text-white/50">{student.name}</p>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0e1640]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#3b74f6] to-[#60a5fa]"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="font-['Norwester',sans-serif] text-sm tracking-wide text-[#3b74f6]">
                          +{student.improvement}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <article className="rounded-2xl border border-[#3b74f64d] bg-[#3b74f61a] px-4 py-5 text-center">
                <p className="font-['Norwester',sans-serif] text-5xl leading-none tracking-wide text-[#3b74f6]">
                  +178
                </p>
                <p className="mt-2 text-xs text-white/50">Group Average</p>
              </article>

              <article className="rounded-2xl border border-[#22c55e4d] bg-[#22c55e1a] px-4 py-5 text-center">
                <p className="font-['Norwester',sans-serif] text-5xl leading-none tracking-wide text-[#22c55e]">
                  10/12
                </p>
                <p className="mt-2 text-xs text-white/50">Students Improved</p>
              </article>
            </div>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-xs leading-6 text-white/50">
                General results are publicly posted and updated on our website so districts always
                have access to the latest program effectiveness data.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
