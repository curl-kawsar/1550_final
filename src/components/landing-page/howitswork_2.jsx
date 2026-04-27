import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const STEPS = [
  {
    id: '01',
    stepLabel: 'Step 01',
    labelMedium: true,
    title: 'Show up to every lesson.',
    cardSrc: '/how-it-works-2/step-card-1.svg',
    tabSrc: '/how-it-works-2/tab-arrow-1.svg',
    tabAlt: '',
    tabClassName: 'right-[7.5%] top-[5.5%] h-[18px] w-[18px] sm:h-5 sm:w-5',
  },
  {
    id: '02',
    stepLabel: 'Step 02',
    labelMedium: false,
    title: 'Complete every assignment',
    cardSrc: '/how-it-works-2/step-card-2.svg',
    tabSrc: '/how-it-works-2/tab-arrow-2.svg',
    tabAlt: '',
    tabClassName: 'right-[7.5%] top-[5.5%] h-[18px] w-[18px] sm:h-5 sm:w-5',
  },
  {
    id: '03',
    stepLabel: 'Step 03',
    labelMedium: false,
    title: (
      <>
        <span className="block">Get Out of Your</span>
        <span className="block">Own Way</span>
      </>
    ),
    cardSrc: '/how-it-works-2/step-card-2.svg',
    tabSrc: '/how-it-works-2/tab-dot.svg',
    tabAlt: '',
    tabClassName: 'right-[7%] top-[4.5%] size-[22px]',
  },
];

function StepCard({ stepLabel, labelMedium, title, cardSrc, tabSrc, tabAlt, tabClassName }) {
  return (
    <article className="relative mx-auto w-full max-w-[390px] shrink-0">
      <div className="relative aspect-[390/315] w-full overflow-hidden rounded-none">
        <img
          src={cardSrc}
          alt=""
          className="absolute inset-0 block size-full max-w-none object-fill"
        />
        <img
          src={tabSrc}
          alt={tabAlt}
          className={`pointer-events-none absolute z-[1] object-contain ${tabClassName}`}
        />
        <div className="absolute left-[8.5%] top-[29.5%] z-[1] w-[89%]">
          <p
            className={`text-xs uppercase leading-4 tracking-[0.08em] text-white/50 sm:text-[12px] ${interTight.className} ${
              labelMedium ? 'font-medium' : 'font-normal tracking-[0.1em]'
            }`}
          >
            {stepLabel}
          </p>
        </div>
        <div className="absolute bottom-[10%] left-[8.5%] z-[1] w-[88%] pr-2">
          <h3 className="font-['Norwester',sans-serif] text-[clamp(1.5rem,4.2vw,2.25rem)] leading-tight tracking-wide text-white sm:text-[36px] sm:leading-10">
            {title}
          </h3>
        </div>
      </div>
    </article>
  );
}

/**
 * Figma frame 142:1322 — “Paths” / How it works (three folder-tab steps).
 * Add to a page: `import HowItWorks2 from '@/components/landing-page/howitswork_2'`
 */
export default function HowItWorks2() {
  return (
    <section
      className={`relative overflow-hidden bg-[#010516] pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-[80px] ${interTight.className}`}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[10%] h-[min(834px,120vw)] w-[min(1703px,220vw)] max-w-none -translate-x-1/2 opacity-90"
        aria-hidden
      >
        <img
          src="/how-it-works-2/ellipse-bg.svg"
          alt=""
          className="block size-full max-w-none object-cover object-center"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-12 xl:px-[121px]">
        <header className="mb-10 sm:mb-12 lg:mb-14">
          <h2 className="font-['Norwester',sans-serif] text-[clamp(2rem,5vw,3rem)] uppercase leading-tight tracking-[0.72px] text-white sm:text-[48px] sm:leading-[68px]">
            <span>How It </span>
            <span className="text-[#2a4dff]">Works</span>
          </h2>
        </header>

        <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:justify-between lg:gap-6">
          {STEPS.map((s) => (
            <StepCard key={s.id} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
