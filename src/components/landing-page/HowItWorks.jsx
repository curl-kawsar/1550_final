'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Inter_Tight } from 'next/font/google';

const TEXT_STAGGER_S = 0.042;
const TEXT_DURATION_S = 0.62;
const TEXT_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const TITLE_NEVER = 'Never';
const TITLE_SETTLE = 'Settle';
const DESCR_LEAD = "1550+ isn't just a score.";
const DESCR_REST =
  "It's proof you refuse to settle for less than your true potential. Your goals are worth fighting for, no matter what they are.";

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300'],
  display: 'swap',
});

const MARQUEE_ITEMS = [
  'Entry into Top Colleges',
  'Athletic Scholarships',
  'Merit Scholarships',
  'Bragging Rights',
  'Confidence',
];

const BAR_DURATION_MS = 3500;
const BAR_STAGGER_MS = 540;
const BAR_DELAYS_MS = [0, BAR_STAGGER_MS, BAR_STAGGER_MS * 2];

const BLUE_LINE_SRC = '/how-it-works/blue-line.png';

/** Same PNG each row; parent clips overflow; opacity steps −25% per row */
const SCORE_LINES = [
  {
    rowClass: 'w-[85%]',
    delayMs: BAR_DELAYS_MS[0],
    opacity: 1,
  },
  {
    rowClass: 'w-[58%]',
    delayMs: BAR_DELAYS_MS[1],
    opacity: 0.5,
  },
  {
    rowClass: 'w-[36%]',
    delayMs: BAR_DELAYS_MS[2],
    opacity: 0.2,
  },
];

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
      {/* w-max: long PNG keeps intrinsic width; scaleX reveal does not stretch pixels */}
      <div
        className="h-full w-max max-w-none origin-left will-change-transform transition-transform ease-out"
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

function splitWords(text) {
  return text.split(/(\s+)/).filter((p) => p.length > 0);
}

function WordReveal({ token, active, reduceMotion, delayIndex }) {
  const delay = reduceMotion ? 0 : delayIndex * TEXT_STAGGER_S;
  const shown = reduceMotion || active;

  return (
    <span className="inline-block overflow-hidden align-baseline pb-[0.12em]">
      <span
        className="inline-block align-baseline transition-[transform,opacity] will-change-transform"
        style={{
          transitionDuration: reduceMotion ? '0ms' : `${TEXT_DURATION_S}s`,
          transitionTimingFunction: TEXT_EASE,
          transitionDelay: `${delay}s`,
          transform: shown ? 'translateY(0)' : 'translateY(110%)',
          opacity: shown ? 1 : 0,
        }}
      >
        {token}
      </span>
    </span>
  );
}

function mapTextToWords(text, active, reduceMotion, nextIndex) {
  return splitWords(text).map((token, i) => {
    if (/^\s+$/.test(token)) {
      return <span key={`${i}-sp`}>{token}</span>;
    }
    return (
      <WordReveal
        key={`${i}-w`}
        token={token}
        active={active}
        reduceMotion={reduceMotion}
        delayIndex={nextIndex()}
      />
    );
  });
}

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const textIndexRef = useRef(0);
  textIndexRef.current = 0;
  const nextTextIndex = () => textIndexRef.current++;

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
      className={`relative mx-auto bg-[#010516] py-12 sm:py-14 lg:py-[60px] ${interTight.className}`}
    >
      <div className="container mx-auto px-6 sm:px-10 lg:px-16 xl:px-[115px]">
        <div className="flex w-full flex-col items-start">
          <div className="flex w-full flex-col gap-4">
            <h2 className="flex flex-wrap items-baseline justify-start gap-[2px] text-left">
              <span className="font-['Norwester',sans-serif] text-[clamp(1.75rem,5vw,3rem)] uppercase leading-none text-[#ffffff] lg:text-[48px]">
                {mapTextToWords(
                  TITLE_NEVER,
                  inView,
                  reduceMotion,
                  nextTextIndex
                )}
              </span>
              <span className="relative mx-2 inline-block h-[clamp(3rem,8vw,5rem)] w-[clamp(3.25rem,9vw,5.5rem)] shrink-0 overflow-hidden lg:h-[79px] lg:w-[100px]">
                <span
                  className="absolute inset-0 transition-[transform,opacity] will-change-transform"
                  style={{
                    transitionDuration: reduceMotion
                      ? '0ms'
                      : `${TEXT_DURATION_S}s`,
                    transitionTimingFunction: TEXT_EASE,
                    transitionDelay: reduceMotion
                      ? '0ms'
                      : `${nextTextIndex() * TEXT_STAGGER_S}s`,
                    transform:
                      reduceMotion || inView ? 'translateY(0)' : 'translateY(110%)',
                    opacity: reduceMotion || inView ? 1 : 0,
                  }}
                >
                  <Image
                    src="/how-it-works/pushing.png"
                    alt=""
                    fill
                    className="object-cover object-[50%_56%] lg:object-[center_58%]"
                    sizes="100px"
                    priority={false}
                  />
                </span>
              </span>
              <span className="font-['Norwester',sans-serif] text-[clamp(1.75rem,5vw,3rem)] uppercase leading-none text-[#457bf5] lg:text-[48px]">
                {mapTextToWords(
                  TITLE_SETTLE,
                  inView,
                  reduceMotion,
                  nextTextIndex
                )}
              </span>
            </h2>

            <p className="w-full text-left text-[clamp(1rem,3.2vw,2.25rem)] text-white/[0.85] xl:text-[36px] leading-[1.2] ">
              <span className="font-medium">
                {mapTextToWords(
                  DESCR_LEAD,
                  inView,
                  reduceMotion,
                  nextTextIndex
                )}
              </span>{' '}
              <span>
                {mapTextToWords(
                  DESCR_REST,
                  inView,
                  reduceMotion,
                  nextTextIndex
                )}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        className="py-16 flex w-full flex-col gap-14 sm:mt-7"
        aria-label="Score progression"
      >
        {SCORE_LINES.map((row, index) => (
          <div
            key={`score-${index}`}
            className={`flex min-w-0 items-center gap-x-3 sm:gap-x-[23px] ${row.rowClass}`}
          >
            <BarRevealTrack
              active={inView}
              reduceMotion={reduceMotion}
              delayMs={row.delayMs}
              className="h-[42px] min-w-0 flex-1 sm:h-[50px]"
            >
              <img
                src={BLUE_LINE_SRC}
                alt=""
                className="pointer-events-none block h-full w-auto max-w-none select-none"
                style={{ opacity: row.opacity }}
                draggable={false}
              />
            </BarRevealTrack>
            {index === 0 ? (
              <div className="relative h-[72px] w-[140px] shrink-0 sm:h-[96px] sm:w-[176px]">
                <Image
                  src="/how-it-works/badge-1550.png"
                  alt="1550+ score"
                  fill
                  className="object-contain object-left"
                  sizes="176px"
                />
              </div>
            ) : (
              <p className="whitespace-nowrap font-['Norwester',sans-serif] text-[clamp(1.5rem,4vw,3rem)] capitalize leading-none text-[rgba(42,77,255,0.5)] lg:text-[48px]">
                {index === 1 ? '1380' : '1050'}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="relative mt-6 w-full overflow-hidden py-3 sm:mt-7">
        <div
          className={`flex w-max max-w-none items-center gap-x-10 ${
            reduceMotion ? '' : 'animate-hiw-marquee'
          }`}
          style={{
            animationPlayState:
              reduceMotion || inView ? 'running' : 'paused',
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