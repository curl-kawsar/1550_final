'use client';

import Image from 'next/image';
import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Inter_Tight } from 'next/font/google';

const STAGGER_S = 0.2;
const DURATION_S = 0.6;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

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

function BentoReveal({ children, active, reduceMotion, index, className = '' }) {
  const delay = reduceMotion ? 0 : index * STAGGER_S;
  const shown = reduceMotion || active;

  return (
    <div
      className={`transition-[transform,opacity] will-change-transform ${className}`}
      style={{
        transitionDuration: reduceMotion ? '0ms' : `${DURATION_S}s`,
        transitionTimingFunction: EASE,
        transitionDelay: `${delay}s`,
        transform: shown ? 'translateY(0)' : 'translateY(28px)',
        opacity: shown ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

const MidPoint = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);
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
      setActive(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-white pb-16 pt-14 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20 ${interTight.className}`}
    >
      {/* Decorative crystals */}
      <div
        className="
    pointer-events-none
    absolute
    top-8
    -left-32
    w-[160px]
    h-[160px]
    sm:w-[220px]
    sm:h-[220px]
    lg:w-[320px]
    lg:h-[320px]
    opacity-90
  "
        aria-hidden
      >
        <div
          className={`relative size-full ${reduceMotion ? '' : 'motion-reduce:animate-none animate-crystal-float'}`}
        >
          <div className="relative size-full -rotate-[-35deg]">
            <Image
              src="/mid-point/crystal.png"
              alt=""
              fill
              className="object-contain"
              sizes="(max-width:640px) 160px, (max-width:1024px) 220px, 320px"
            />
          </div>
        </div>
      </div>
      <div
        className="
    pointer-events-none
    absolute
    -bottom-6
    -right-32
    w-[160px]
    h-[160px]
    sm:w-[220px]
    sm:h-[220px]
    lg:w-[320px]
    lg:h-[320px]
    opacity-90
  "
        aria-hidden
      >
        <div
          className={`relative size-full ${reduceMotion ? '' : 'motion-reduce:animate-none animate-crystal-float'}`}
          style={
            reduceMotion ? undefined : { animationDelay: '2.85s' }
          }
        >
          <div className="relative size-full -rotate-[35deg]">
            <Image
              src="/mid-point/crystal.png"
              alt=""
              fill
              className="object-contain"
              sizes="(max-width:640px) 160px, (max-width:1024px) 220px, 320px"
            />
          </div>
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
              <div className="relative z-0 flex w-full shrink-0 flex-col gap-4 sm:w-[190px] has-[.score-tooltip-anchor:hover]:z-[80]">
                <BentoReveal
                  active={active}
                  reduceMotion={reduceMotion}
                  index={0}
                  className="flex-1"
                >
                  <GradientStat
                    value="+178"
                    label="Average increase"
                    className="flex-1"
                  />
                </BentoReveal>
                <BentoReveal
                  active={active}
                  reduceMotion={reduceMotion}
                  index={1}
                  className="flex-1"
                >
                  <div className="score-tooltip-anchor group relative flex min-h-0 flex-1 flex-col">
                    <GradientStat
                      value="86%"
                      label="score 1470+"
                      className="relative z-0 flex-1"
                    />
                    <span
                      className="pointer-events-none absolute right-3 top-3 z-[1] sm:right-4 sm:top-4"
                      aria-hidden
                    >
                      <Info
                        className="size-[18px] text-white/70 sm:size-5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    <div
                      role="tooltip"
                      className="
                        pointer-events-none
                        invisible
                        absolute
                        text-center
                        bottom-full
                        left-1/2
                        z-[9999]
                        mb-2
                        w-max
                        max-w-[min(380px,calc(100vw-1.25rem))]
                        -translate-x-1/2
                        rounded-xl
                        border border-white/20
                        bg-black/55
                        px-3.5
                        py-2.5
                        text-[13px]
                        leading-snug
                        text-white
                        opacity-0
                        shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]
                        backdrop-blur-xl
                        backdrop-saturate-150
                        transition-[opacity,visibility]
                        duration-200
                        ease-out
                        group-hover:visible
                        group-hover:opacity-100
                        sm:px-4
                        sm:text-sm
                      "
                    >
                      86% of our private clients scored a 1470 or higher in the 2025-2026 school year
                    </div>
                  </div>
                </BentoReveal>
              </div>

              {/* Included in the Program card */}
              <BentoReveal
                active={active}
                reduceMotion={reduceMotion}
                index={2}
                className="flex min-h-0 min-w-0 flex-1 flex-col"
              >
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
              </BentoReveal>
            </div>

            {/* Before & After bar */}
            <BentoReveal
              active={active}
              reduceMotion={reduceMotion}
              index={3}
              className="w-full"
            >
              <div className="flex min-h-[72px] items-center justify-center rounded-[20px] border border-solid border-[#2a4dff] bg-white px-6 py-5 sm:px-8">
                <p className="text-center font-['Norwester',sans-serif] text-lg tracking-[0.52px] text-[#2a4dff] sm:text-[22px]">
                  Before &amp; After tests for results you can see!
                </p>
              </div>
            </BentoReveal>
          </div>

          {/* Right column */}
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[401px]">
            {/* Everything You Need to Succeed card */}
            <BentoReveal
              active={active}
              reduceMotion={reduceMotion}
              index={4}
              className="flex w-full flex-1 flex-col"
            >
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
            </BentoReveal>

            {/* All Sessions on Zoom bar */}
            <BentoReveal
              active={active}
              reduceMotion={reduceMotion}
              index={5}
              className="w-full"
            >
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
            </BentoReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MidPoint;