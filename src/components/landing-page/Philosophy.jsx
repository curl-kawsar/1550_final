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
/** Single-line window: neighbors are clipped, not shown. */
const VIEWPORT_PX = ROW_PX;
const CYCLE_PX = REEL_LINES.length * ROW_PX;
/** Long strip + periodic normalize (subtract cycles) — never snap to 0. */
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

const WORD_STAGGER_MS = 40;
const EASE_WORD = 'cubic-bezier(0.22, 1, 0.32, 1)';

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function useScrollStaggerReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.14, rootMargin: '0px 0px -10% 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  const animated = reducedMotion || visible;
  return { ref, animated, reducedMotion };
}

function WordSpans({
  text,
  startOffset = 0,
  animated,
  reducedMotion,
  staggerMs = WORD_STAGGER_MS,
  wordClassName = '',
}) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  return words.map((word, i) => {
    const globalIdx = startOffset + i;
    const on = animated;

    const staggerDelay = `${globalIdx * staggerMs}ms`;

    return (
      <span
        key={`${globalIdx}-${word.slice(0, 12)}`}
        className={`inline-block will-change-[opacity,transform] ${wordClassName} ${
          on
            ? 'translate-y-0 opacity-100'
            : 'translate-y-[0.35em] opacity-0'
        }`}
        style={
          reducedMotion
            ? undefined
            : {
                transitionProperty: 'opacity, transform',
                transitionDuration: '0.55s, 0.55s',
                transitionTimingFunction: `${EASE_WORD}, ${EASE_WORD}`,
                transitionDelay: `${staggerDelay}, ${staggerDelay}`,
              }
        }
      >
        {word}
        {i < words.length - 1 ? '\u00A0' : ''}
      </span>
    );
  });
}

/** Inline block that fades in on the same stagger timeline (image, reel, etc.). */
function StaggerFade({
  children,
  animated,
  reducedMotion,
  delayMs,
  className = '',
}) {
  const on = animated;

  return (
    <span
      className={`inline-flex ${className} ${
        on ? 'opacity-100' : 'opacity-0'
      }`}
      style={
        reducedMotion
          ? undefined
          : {
              transitionProperty: 'opacity',
              transitionDuration: '550ms',
              transitionTimingFunction: EASE_WORD,
              transitionDelay: `${delayMs}ms`,
            }
      }
    >
      {children}
    </span>
  );
}

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

// Copy strings — line breaks preserved for quotation block.
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

/**
 * Figma node 136:905 — philosophy / “1550+ is not just a score” + quote band.
 */
export default function Philosophy() {
  const head = useScrollStaggerReveal();
  const p1 = useScrollStaggerReveal();
  const p2 = useScrollStaggerReveal();
  const p3 = useScrollStaggerReveal();
  const quoteBand = useScrollStaggerReveal();

  const headN1 = wordCount(PHI_HEAD_A);
  /** Word index after the score icon fades in — last word stagger slot before “score”. */
  const headScoreWordOffset = headN1 + 1;

  const p2IntroWords = wordCount(PHI_P2A);
  const p3AfterImpossible = wordCount(PHI_P3A) + wordCount(PHI_P3B);
  const qLine1Words = wordCount(PHI_Q1);
  const attribWordOffset = wordCount(PHI_Q1) + wordCount(PHI_Q2);

  return (
    <section
      className={`relative bg-[#010516] px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-[67px] xl:px-[115px] ${interTight.className}`}
    >
      <div className="mx-auto flex w-full max-w-[1236px] flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-5 lg:gap-[19px]">
          <h2
            ref={head.ref}
            className="flex flex-wrap items-end gap-2 sm:gap-3"
          >
            <span className="font-['Norwester',sans-serif] text-[clamp(1.75rem,4.5vw,3rem)] uppercase leading-none text-white lg:text-[48px]">
              <WordSpans
                text={PHI_HEAD_A}
                animated={head.animated}
                reducedMotion={head.reducedMotion}
              />
            </span>
            <StaggerFade
              animated={head.animated}
              reducedMotion={head.reducedMotion}
              delayMs={headN1 * WORD_STAGGER_MS}
              className="relative inline-block h-[clamp(3.5rem,10vw,5rem)] w-[clamp(5.5rem,18vw,7.9rem)] shrink-0 lg:h-[81px] lg:w-[127px]"
            >
              <Image
                src="/philosophy/score-icon.png"
                alt="Score gauge illustration"
                fill
                className="object-cover"
                sizes="127px"
              />
            </StaggerFade>
            <span className="font-['Norwester',sans-serif] text-[clamp(1.75rem,4.5vw,3rem)] uppercase leading-none text-[#2a4dff] lg:text-[48px]">
              <WordSpans
                text={PHI_HEAD_B}
                startOffset={headScoreWordOffset}
                animated={head.animated}
                reducedMotion={head.reducedMotion}
              />
            </span>
          </h2>

          <p ref={p1.ref} className={bodyLg}>
            <span className="text-white">
              <WordSpans
                text={PHI_P1A}
                animated={p1.animated}
                reducedMotion={p1.reducedMotion}
                wordClassName="text-white"
              />
            </span>
            <span>
              {' '}
              <WordSpans
                text={PHI_P1B}
                startOffset={wordCount(PHI_P1A)}
                animated={p1.animated}
                reducedMotion={p1.reducedMotion}
              />
            </span>
          </p>

          <p ref={p2.ref} className={bodyLg}>
            <WordSpans
              text={PHI_P2A}
              animated={p2.animated}
              reducedMotion={p2.reducedMotion}
            />
            {' '}
            <StaggerFade
              animated={p2.animated}
              reducedMotion={p2.reducedMotion}
              delayMs={p2IntroWords * WORD_STAGGER_MS}
              className="inline-flex align-baseline"
            >
              <ObstacleReel />
            </StaggerFade>
            {' '}
            <WordSpans
              text={PHI_P2B}
              startOffset={p2IntroWords + 1}
              animated={p2.animated}
              reducedMotion={p2.reducedMotion}
            />
          </p>

          <p ref={p3.ref} className={bodyLg}>
            <WordSpans
              text={PHI_P3A}
              animated={p3.animated}
              reducedMotion={p3.reducedMotion}
            />
            {' '}
            <span className="font-['Norwester',sans-serif] text-[#2a4dff]">
              <WordSpans
                text={PHI_P3B}
                startOffset={wordCount(PHI_P3A)}
                animated={p3.animated}
                reducedMotion={p3.reducedMotion}
                wordClassName="font-['Norwester',sans-serif] text-[#2a4dff]"
              />
            </span>
            {' '}
            <WordSpans
              text={PHI_P3C}
              startOffset={p3AfterImpossible}
              animated={p3.animated}
              reducedMotion={p3.reducedMotion}
            />
          </p>
        </div>

        <div
          ref={quoteBand.ref}
          className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[rgba(42,77,255,0.3)] p-8 sm:p-10 lg:p-16"
        >
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
            <blockquote className="font-['Norwester',sans-serif] text-[clamp(1.25rem,3.2vw,2.5rem)] uppercase leading-tight text-white lg:text-[40px] lg:leading-normal">
              <p className="whitespace-pre-wrap">
                <WordSpans
                  text={PHI_Q1}
                  animated={quoteBand.animated}
                  reducedMotion={quoteBand.reducedMotion}
                />
              </p>
              <p>
                <WordSpans
                  text={PHI_Q2}
                  startOffset={qLine1Words}
                  animated={quoteBand.animated}
                  reducedMotion={quoteBand.reducedMotion}
                />
              </p>
            </blockquote>
            <p className="pl-0 text-sm uppercase leading-normal tracking-wide text-white/60 sm:pl-4 lg:text-base">
              <WordSpans
                text={PHI_ATTRIB}
                startOffset={attribWordOffset}
                animated={quoteBand.animated}
                reducedMotion={quoteBand.reducedMotion}
                wordClassName="text-white/60"
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
