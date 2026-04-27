import Image from 'next/image';
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const INCLUDED_ITEMS = [
  'Goal setting',
  'Punctuation',
  'Grammar',
  'Reading',
  'Math',
  'Strategy',
];

const SUCCEED_ITEMS = [
  'Homework Assignments',
  'Accountability',
  'Motivation',
  'Proctored Practice Exams',
  'Structured Lessons',
  'Live Tutoring',
];

function GradientStat({ value, label, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[24px] bg-[#010516] px-5 py-7 text-center sm:px-6 sm:py-8 ${className}`}
    >
      <span
        className="font-['Norwester',sans-serif] text-[clamp(2.25rem,6vw,3rem)] leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        style={{
          background:
            'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(82, 119, 255) 95%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {value}
      </span>
      <span className="mt-2.5 font-['Norwester',sans-serif] text-lg uppercase tracking-[0.04em] text-white sm:text-xl">
        {label}
      </span>
    </div>
  );
}

function ListRow({ children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex shrink-0 pt-[5px]">
        <img
          src="/mid-point/check-tick.svg"
          alt=""
          width={16}
          height={16}
          className="size-4"
        />
      </span>
      <p
        className={`min-w-0 flex-1 text-[17px] leading-[1.7] text-[#3d3d52] sm:text-lg ${interTight.className}`}
      >
        {children}
      </p>
    </div>
  );
}

const MidPoint = () => {
  return (
    <section
      className={`relative overflow-hidden bg-white pb-16 pt-14 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20 ${interTight.className}`}
    >
      {/* Decorative crystals */}
      <div
        className="pointer-events-none absolute -left-24 -top-16 size-[min(460px,90vw)] opacity-90 sm:-left-32 lg:-left-40 lg:-top-20"
        aria-hidden
      >
        <div className="relative size-full rotate-[41deg]">
          <Image
            src="/mid-point/crystal.png"
            alt=""
            fill
            className="object-cover"
            sizes="460px"
            priority={false}
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute -bottom-12 -right-16 size-[min(293px,55vw)] opacity-90 sm:-bottom-8 sm:-right-24 lg:right-[-4rem] lg:top-[38%]"
        aria-hidden
      >
        <div className="relative size-full -rotate-[35deg]">
          <Image
            src="/mid-point/crystal.png"
            alt=""
            fill
            className="object-cover"
            sizes="293px"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1037px] px-5 sm:px-6 lg:px-8">
        {/* Section heading */}
        <h2 className="mx-auto mb-10 max-w-4xl text-center font-['Norwester',sans-serif] text-[clamp(1.5rem,4.5vw,3rem)] uppercase leading-tight sm:mb-12 lg:mb-14">
          <span className="block text-[#2a4dff]">
            Most Aren&apos;t Willing to Do
          </span>
          <span className="mt-1 block sm:mt-0 sm:inline">
            <span className="text-[#2a4dff]">What It Takes.</span>{' '}
            <span className="text-[#141c42]">ARE YOU?</span>
          </span>
        </h2>

        {/* Cards grid */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-4">
          {/* Left cluster: stats + included card */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 lg:max-w-[609px]">
            {/* Top row: stat cards + included list */}
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:gap-4">
              {/* Stat cards column */}
              <div className="flex w-full shrink-0 flex-col gap-4 sm:w-[190px]">
                <GradientStat
                  value="+178"
                  label="Average increase"
                  className="flex-1"
                />
                <GradientStat
                  value="86%"
                  label="score 1470+"
                  className="flex-1"
                />
              </div>

              {/* Included in the Program card */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-[24px] border border-solid border-[#2a4dff] bg-white px-6 pb-8 pt-7 sm:px-8 sm:pt-8">
                <h3 className="mb-5 font-['Norwester',sans-serif] text-[22px] leading-tight text-[#2a4dff] sm:mb-6 sm:text-[28px]">
                  Included in the Program
                </h3>
                <div className="flex flex-col gap-[3px]">
                  {INCLUDED_ITEMS.map((item) => (
                    <ListRow key={item}>{item}</ListRow>
                  ))}
                </div>
              </div>
            </div>

            {/* Before & After bar */}
            <div className="flex min-h-[72px] items-center justify-center rounded-[20px] border border-solid border-[#2a4dff] bg-white px-6 py-5 sm:px-8">
              <p className="text-center font-['Norwester',sans-serif] text-lg tracking-[0.52px] text-[#2a4dff] sm:text-[22px]">
                Before &amp; After tests for results you can see!
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[401px]">
            {/* Everything You Need to Succeed card */}
            <div className="flex flex-1 flex-col rounded-[24px] border border-solid border-[#2a4dff] bg-white px-6 pb-8 pt-7 sm:px-8 sm:pt-8">
              <h3 className="mb-4 font-['Norwester',sans-serif] text-[22px] leading-tight text-[#2a4dff] sm:text-[28px]">
                <span className="block">Everything You Need</span>
                <span className="block">to Succeed</span>
              </h3>
              <div className="flex flex-col gap-[3px]">
                {SUCCEED_ITEMS.map((item) => (
                  <ListRow key={item}>{item}</ListRow>
                ))}
              </div>
            </div>

            {/* All Sessions on Zoom bar */}
            <div className="flex min-h-[72px] items-center justify-center gap-3 rounded-[20px] bg-[#010516] px-5 py-5 sm:gap-3.5 sm:px-6">
              <div className="relative size-9 shrink-0 sm:size-11">
                <Image
                  src="/mid-point/zoom-icon.png"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="44px"
                />
              </div>
              <p className="font-['Norwester',sans-serif] text-lg tracking-[0.02em] text-white sm:text-[22px]">
                All Sessions held on Zoom
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MidPoint;