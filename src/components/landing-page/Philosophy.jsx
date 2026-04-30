'use client';

import Image from 'next/image';
import { Inter_Tight } from 'next/font/google';
import { useCallback, useEffect, useRef, useState } from 'react';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300'],
  display: 'swap',
});

const bodyLg = `text-[clamp(1rem,3.2vw,2.25rem)] leading-[1] text-white/[0.85] xl:text-[36px]`;

const REEL_LINES = ['Self-doubt', 'Low confidence', 'Weak habits'];

const ROW_PX = 56;
const VIEWPORT_PX = ROW_PX;
const CYCLE_PX = REEL_LINES.length * ROW_PX;
const COPIES = 48;
const STRIP = Array.from(
  { length: REEL_LINES.length * COPIES },
  (_, i) => REEL_LINES[i % REEL_LINES.length]
);
const NORMALIZE_ABOVE_PX = CYCLE_PX * 24;
const NORMALIZE_DROP_PX = CYCLE_PX * 12;

const TRANSITION_MS = 720;
const PAUSE_MS = 900;
const EASE = 'cubic-bezier(0.22, 1, 0.32, 1)';

function ObstacleReel() {
  const [offsetPx, setOffsetPx] = useState(0);
  const [bypassTransition, setBypassTransition] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pauseTimerRef = useRef(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    offsetRef.current = offsetPx;
  }, [offsetPx]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const clearPause = () => {
    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  };

  const scheduleAdvance = useCallback(() => {
    if (reduceMotion) return;
    clearPause();
    pauseTimerRef.current = window.setTimeout(() => {
      setOffsetPx((prev) => prev + ROW_PX);
    }, PAUSE_MS);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    scheduleAdvance();
    return clearPause;
  }, [reduceMotion, scheduleAdvance]);

  const onTransitionEnd = useCallback(
    (e) => {
      if (reduceMotion || e.propertyName !== 'transform') return;
      const cur = offsetRef.current;
      if (cur > NORMALIZE_ABOVE_PX) {
        setBypassTransition(true);
        setOffsetPx((o) => {
          let n = o;
          while (n > NORMALIZE_ABOVE_PX) n -= NORMALIZE_DROP_PX;
          return n;
        });
        window.requestAnimationFrame(() => {
          setBypassTransition(false);
          scheduleAdvance();
        });
      } else {
        scheduleAdvance();
      }
    },
    [reduceMotion, scheduleAdvance]
  );

  const activeIndex = Math.round(offsetPx / ROW_PX) % REEL_LINES.length;
  const activeLabel = REEL_LINES[activeIndex] ?? REEL_LINES[0];

  if (reduceMotion) {
    return (
      <span
        className="inline-flex min-h-[1.2em] min-w-[min(100%,220px)] shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[rgba(37,37,37,0.4)] px-3 py-1 align-baseline font-['Norwester',sans-serif] text-[clamp(0.95rem,2.8vw,1.35rem)] uppercase leading-none tracking-wide text-white lg:min-w-[190px] lg:px-4 lg:text-[22px]"
        aria-label="Common obstacles students overcome"
      >
        {REEL_LINES[0]}
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex min-h-[1.2em] min-w-[min(100%,220px)] shrink-0 align-baseline font-['Norwester',sans-serif] uppercase lg:min-w-[190px]"
      aria-live="polite"
      aria-label={`Current obstacle: ${activeLabel}`}
    >
      <span
        className="relative inline-block overflow-hidden rounded-2xl border border-white/10 bg-[rgba(37,37,37,0.4)] px-3 align-middle lg:px-4"
        style={{ height: VIEWPORT_PX, maxHeight: VIEWPORT_PX }}
      >
        <span
          className="flex flex-col items-stretch"
          style={{
            transform: `translateY(-${offsetPx}px)`,
            transition: bypassTransition
              ? 'none'
              : `transform ${TRANSITION_MS}ms ${EASE}`,
            willChange: 'transform',
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {STRIP.map((label, i) => (
            <span
              key={`${i}-${label}`}
              className="flex shrink-0 items-center justify-center whitespace-nowrap text-center text-[clamp(0.95rem,2.8vw,1.35rem)] leading-none tracking-wide text-white lg:text-[22px]"
              style={{ height: ROW_PX }}
            >
              {label}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

const PHI_HEAD_A = '1550+ is not just a';
const PHI_HEAD_B = 'score';

const PHI_P1A = 'Of course the score matters,';
const PHI_P1B =
  'because it affects scholarships, admissions, and future opportunity, but when approached correctly, SAT prep is not just about mastering content or raising a number.';

const PHI_P2A =
  'It becomes an opportunity for students to overcome';
const PHI_P2B = 'and even past academic limitations.';

const PHI_P3A =
  'Students enter a training ground for discipline, resilience, and the belief that difficult goals are worth attempting, and they leave with elite scores and knowing they can achieve';
const PHI_P3B = '\u201Cimpossible\u201D';
const PHI_P3C = 'things.';

const PHI_Q1 =
  '\u201Cwe believe in students doing what seems impossible';
const PHI_Q2 = "and then proving to themselves it wasn't\u201D";

const PHI_ATTRIB = '1550+ SAT - Core philosophy';

const headingClass =
  "font-['Norwester',sans-serif] text-[clamp(1.75rem,4.5vw,3rem)] uppercase leading-none lg:text-[48px]";

/**
 * Philosophy / “1550+ is not just a score” + quote band.
 */
export default function Philosophy() {
  return (
    <section
      className={`relative bg-[#010516] px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-[67px] xl:px-[115px] ${interTight.className}`}
    >
      <div className="mx-auto flex w-full max-w-[1236px] flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-5 lg:gap-[19px]">
          <h2 className="flex flex-wrap items-end gap-2 sm:gap-3">
            <span className={`${headingClass} text-white`}>{PHI_HEAD_A}</span>
            <span className="relative inline-block h-[clamp(3.5rem,10vw,5rem)] w-[clamp(5.5rem,18vw,7.9rem)] shrink-0 lg:h-[84px] lg:w-[127px]">
              <Image
                src="/philosophy/score-icon.png"
                alt="Score gauge illustration"
                fill
                className="object-cover"
                sizes="127px"
              />
            </span>
            <span className={`${headingClass} text-[#2a4dff]`}>{PHI_HEAD_B}</span>
          </h2>

          <p className={bodyLg}>
            <span className="text-white">{PHI_P1A}</span>{' '}
            <span>{PHI_P1B}</span>
          </p>

          <p className={bodyLg}>
            {PHI_P2A}{' '}
            <span className="inline-flex align-baseline">
              <ObstacleReel />
            </span>{' '}
            {PHI_P2B}
          </p>

          <p className={bodyLg}>
            {PHI_P3A}{' '}
            <span className="font-['Norwester',sans-serif] text-[#2a4dff]">
              {PHI_P3B}
            </span>{' '}
            {PHI_P3C}
          </p>
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[rgba(42,77,255,0.3)] p-8 sm:p-10 lg:p-16">
          <div
            className="pointer-events-none absolute -left-20 top-1/2 h-[min(328px,55vw)] w-[min(1440px,220%)] max-w-none -translate-y-1/2 opacity-80 sm:-left-28 lg:left-[-112px] lg:top-[85px] lg:h-[328px] lg:w-[1439px] lg:translate-y-0"
            aria-hidden
          >
            <img
              src="/philosophy/quote-bg.svg"
              alt=""
              className="block size-full max-w-none object-cover object-left"
            />
          </div>

          <div className="relative z-10 flex flex-col gap-5 lg:gap-5">
            <blockquote className="font-['Norwester',sans-serif] text-[clamp(1.1rem,3vw,2.5rem)] uppercase leading-snug text-pretty text-white sm:leading-tight lg:text-[36px] lg:leading-normal">
              <p>
                <span className="lg:block">{PHI_Q1}</span>
                <span className="inline lg:hidden"> </span>
                <span className="lg:block">{PHI_Q2}</span>
              </p>
            </blockquote>
            <p className="pl-0 text-sm uppercase leading-normal tracking-wide text-white/60 sm:pl-4 lg:text-base">
              {PHI_ATTRIB}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
