'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const MARQUEE_ITEMS = [
  'Entry into Top Colleges',
  'Athletic Scholarships',
  'Merit Scholarships',
  'Bragging Rights',
  'Confidence',
];

const BAR_DURATION_MS = 720;
const BAR_STAGGER_MS = 240;
const BAR_DELAYS_MS = [0, BAR_STAGGER_MS, BAR_STAGGER_MS * 2];

function BarRevealTrack({
  active,
  reduceMotion,
  delayMs,
  children,
  className = '',
}) {
  const shown = reduceMotion || active;
  const delay = reduceMotion ? 0 : delayMs;

  return (
    <div className={`min-h-0 min-w-0 overflow-hidden ${className}`}>
      <div
        className="h-full w-full origin-left will-change-transform transition-transform ease-out"
        style={{
          transform: shown ? 'scaleX(1)' : 'scaleX(0)',
          transitionDuration: reduceMotion ? '0ms' : `${BAR_DURATION_MS}ms`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [marqueeReady, setMarqueeReady] = useState(false);
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
      setInView(true);
      setMarqueeReady(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const t = window.setTimeout(
      () => setMarqueeReady(true),
      BAR_DELAYS_MS[2] + BAR_DURATION_MS + 80
    );
    return () => window.clearTimeout(t);
  }, [inView, reduceMotion]);

  const renderMarqueeItems = (suffix) =>
    MARQUEE_ITEMS.map((label) => (
      <span
        key={`${suffix}-${label}`}
        className="flex h-[72px] shrink-0 items-center gap-10 sm:gap-12"
      >
        <span className="whitespace-nowrap font-['Norwester',sans-serif] text-[clamp(1.125rem,3.5vw,3rem)] uppercase leading-[1.5] tracking-[0.045em] text-white sm:text-[48px] sm:leading-[72px] sm:tracking-[0.72px]">
          {label}
        </span>
        <span
          className="h-5 w-3 shrink-0 rounded-full bg-[#2a4dff]"
          aria-hidden
        />
      </span>
    ));

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-x-clip bg-[#010516] py-12 sm:py-14 lg:py-[60px] ${interTight.className}`}
    >
      <div className="px-6 sm:px-10 lg:px-16 xl:px-[115px]">
        <div className="flex w-full max-w-[1200px] flex-col items-start">
          <div className="flex w-full max-w-[800px] flex-col gap-4">
            <h2 className="flex flex-wrap items-end justify-start gap-[2px]">
              <span className="font-['Norwester',sans-serif] text-[clamp(1.75rem,5vw,3rem)] uppercase leading-none text-[#457bf5] lg:text-[48px]">
                Never
              </span>
              <span className="relative mx-0.5 inline-flex h-[clamp(3rem,8vw,5rem)] w-[clamp(3.25rem,9vw,5.5rem)] shrink-0 items-end overflow-hidden lg:h-[79px] lg:w-[88px]">
                <Image
                  src="/how-it-works/never-settle-icon.png"
                  alt=""
                  fill
                  className="object-cover object-[50%_56%] lg:object-[center_58%]"
                  sizes="88px"
                  priority={false}
                />
              </span>
              <span className="font-['Norwester',sans-serif] text-[clamp(1.75rem,5vw,3rem)] uppercase leading-none text-[#457bf5] lg:text-[48px]">
                Settle
              </span>
            </h2>

            <p className="max-w-[900px] text-left text-[clamp(0.9375rem,2vw,1.375rem)] leading-[1.6] text-white/[0.85]">
              <span className="font-medium">1550+ isn&apos;t just a score.</span>
              <span>
                {' '}
                It&apos;s proof you refuse to settle for less than your true
                potential. Your goals are worth fighting for, no matter what they
                are.
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-6 flex w-full max-w-[1200px] flex-col gap-2 sm:mt-7 sm:gap-2.5 lg:gap-3"
        aria-label="Score progression"
      >
        <div className="flex w-full items-center gap-x-3 sm:gap-x-[23px]">
          <BarRevealTrack
            active={inView}
            reduceMotion={reduceMotion}
            delayMs={BAR_DELAYS_MS[2]}
            className="h-[42px] flex-1 min-w-0 sm:h-[50px]"
          >
            <img
              src="/how-it-works/bar-top.svg"
              alt=""
              className="block h-full w-full min-h-[42px] object-fill object-left sm:min-h-[50px]"
            />
          </BarRevealTrack>
          <div className="relative h-[72px] w-[140px] shrink-0 sm:h-[96px] sm:w-[176px]">
            <Image
              src="/how-it-works/badge-1550.png"
              alt="1550+ score"
              fill
              className="object-contain object-left"
              sizes="176px"
            />
          </div>
        </div>

        <div className="flex w-[58%] min-w-0 items-center gap-x-3 sm:gap-x-4">
          <BarRevealTrack
            active={inView}
            reduceMotion={reduceMotion}
            delayMs={BAR_DELAYS_MS[1]}
            className="h-[42px] flex-1 min-w-0 sm:h-[50px]"
          >
            <img
              src="/how-it-works/bar-mid.svg"
              alt=""
              className="block h-full w-full object-fill object-left"
            />
          </BarRevealTrack>
          <p className="whitespace-nowrap font-['Norwester',sans-serif] text-[clamp(1.5rem,4vw,3rem)] capitalize leading-none text-[rgba(42,77,255,0.5)] lg:text-[48px]">
            1380
          </p>
        </div>

        <div className="flex w-[36%] min-w-0 items-center gap-x-3 sm:gap-x-4">
          <BarRevealTrack
            active={inView}
            reduceMotion={reduceMotion}
            delayMs={BAR_DELAYS_MS[0]}
            className="h-[42px] flex-1 min-w-0 sm:h-[50px]"
          >
            <div className="h-full w-full brightness-[0.65]">
              <img
                src="/how-it-works/bar-mid.svg"
                alt=""
                className="block h-full w-full object-fill object-left"
              />
            </div>
          </BarRevealTrack>
          <p className="whitespace-nowrap font-['Norwester',sans-serif] text-[clamp(1.5rem,4vw,3rem)] capitalize leading-none text-[rgba(42,77,255,0.5)] lg:text-[48px]">
            1050
          </p>
        </div>
      </div>

      <div className="relative mt-6 w-full overflow-hidden py-3 sm:mt-7">
        <div
          className={`flex w-max max-w-none items-center gap-x-10 ${
            reduceMotion ? '' : 'animate-hiw-marquee'
          }`}
          style={{
            animationPlayState:
              reduceMotion || marqueeReady ? 'running' : 'paused',
          }}
        >
          {renderMarqueeItems('a')}
          {renderMarqueeItems('b')}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;