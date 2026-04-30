'use client';

import { useEffect, useRef, useState } from 'react';
import { Inter_Tight } from 'next/font/google';
const CARD_STAGGER_S = 0.41;
const CARD_DURATION_S = 0.62;
const EASE_IN = 'cubic-bezier(0.16, 1, 0.3, 1)';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const CARD_DEFAULT = '/how-it-works-2/step-card-2.svg';
const CARD_HOVER = '/how-it-works-2/step-card-1.svg';

const STEPS = [
  {
    id: '01',
    stepLabel: '/how-it-works-2/step-num-01.png',
    labelMedium: true,
    title: 'Show up to every lesson.',
    tabSrc: '/how-it-works-2/tab-arrow-1.svg',
    tabAlt: '',
    tabClassName: 'right-[7.5%] top-[5.5%] h-[18px] w-[18px] sm:h-5 sm:w-5',
  },
  {
    id: '02',
    stepLabel: '/how-it-works-2/step-num-02.png',
    labelMedium: false,
    title: 'Complete every assignment',
    tabSrc: '/how-it-works-2/tab-arrow-2.svg',
    tabAlt: '',
    tabClassName: 'right-[7.5%] top-[5.5%] h-[18px] w-[18px] sm:h-5 sm:w-5',
  },
  {
    id: '03',
    stepLabel: '/how-it-works-2/step-num-03.png',
    labelMedium: false,
    title: (
      <>
        <span className="block">Get Out of Your</span>
        <span className="block">Own Way</span>
      </>
    ),
    tabSrc: '/how-it-works-2/tab-dot.svg',
    tabAlt: '',
    tabClassName: 'right-[7%] top-[4.5%] size-[22px]',
  },
];

function StepCard({
  stepLabel,
  labelMedium,
  title,
  tabSrc,
  tabAlt,
  tabClassName,
  staggerIndex,
  entranceVisible,
  reduceMotion,
}) {
  const shown = reduceMotion || entranceVisible;
  const delay = reduceMotion ? 0 : staggerIndex * CARD_STAGGER_S;

  return (
    <article
      className="group relative mx-auto w-full max-w-[390px] shrink-0 will-change-[opacity,transform] motion-reduce:will-change-auto"
      style={{
        transitionDuration: reduceMotion ? '0ms' : `${CARD_DURATION_S}s`,
        transitionTimingFunction: EASE_IN,
        transitionDelay: `${delay}s`,
        transitionProperty: 'opacity, transform',
        transform: shown ? 'translate3d(0,0,0)' : 'translate3d(-28px,0,0)',
        opacity: shown ? 1 : 0,
      }}
    >
      <div className="relative aspect-[390/315] w-full overflow-hidden rounded-none">
        <img
          src={CARD_DEFAULT}
          alt=""
          className="absolute inset-0 block size-full max-w-none object-fill transition-opacity duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:opacity-0"
        />
        <img
          src={CARD_HOVER}
          alt=""
          className="absolute inset-0 block size-full max-w-none object-fill opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:opacity-100"
        />
        <img
          src={tabSrc}
          alt={tabAlt}
          className={`pointer-events-none absolute z-[1] object-contain ${tabClassName}`}
        />
        <div className="absolute left-[8.5%] top-[29.5%] z-[1] w-[89%]">
          <img src={stepLabel} alt={stepLabel} width={100} height={100} />
        </div>
        <div className="absolute bottom-[10%] left-[8.5%] z-[1] w-[88%] pr-2">
          <h3 className="font-['Norwester',sans-serif] uppercase text-[clamp(1.5rem,4.2vw,2.25rem)] leading-tight tracking-wide text-white sm:text-[36px] sm:leading-10">
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
  const sectionRef = useRef(null);
  const [entranceVisible, setEntranceVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setEntranceVisible(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEntranceVisible(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
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
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <h2 className="font-['Norwester',sans-serif] text-[clamp(2rem,5vw,3rem)] uppercase text-center leading-tight tracking-[0.72px] text-white sm:text-[48px] sm:leading-[68px]">
            <span>How It </span>
            <span className="text-[#2a4dff]">Works</span>
          </h2>
        </header>

        <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:justify-center lg:gap-6">
          {STEPS.map((s, i) => (
            <StepCard
              key={s.id}
              {...s}
              staggerIndex={i}
              entranceVisible={entranceVisible}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
