'use client';

import { useEffect, useRef, useState } from 'react';
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['500'],
  display: 'swap',
});

const STAGGER_S = 0.042;
const DURATION_S = 0.62;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const HEADLINE_BLUE = 'The Success Is in the';
const HEADLINE_DARK = 'Goal';
const BODY =
  'We believe most people are capable of far more than they accomplish because very few are ever trained to think, prepare, and perform at the level their potential actually demands. A student who can set a difficult goal and actually reach it learns how to achieve anything difficult in life.';

function splitWords(text) {
  return text.split(/(\s+)/).filter((p) => p.length > 0);
}

function WordReveal({ token, active, reduceMotion, delayIndex }) {
  const delay = reduceMotion ? 0 : delayIndex * STAGGER_S;
  const shown = reduceMotion || active;

  return (
    <span className="inline-block overflow-hidden align-baseline pb-[0.12em]">
      <span
        className="inline-block align-baseline transition-[transform,opacity] will-change-transform"
        style={{
          transitionDuration: reduceMotion ? '0ms' : `${DURATION_S}s`,
          transitionTimingFunction: EASE,
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

/** Figma node 198:1064 — “The Success Is in the [target] Goal” + body (Inter Tight 500). */
const Success = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const indexRef = useRef(0);
  indexRef.current = 0;
  const nextIndex = () => indexRef.current++;

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

  const headlineCls =
    "font-['Norwester',sans-serif] uppercase not-italic leading-none tracking-[0.02em] text-[clamp(1.625rem,calc(0.75rem+3.25vw),3rem)] xl:text-[48px]";

  const bodyCls = `max-w-[1204px] text-pretty text-center text-[clamp(1.0625rem,calc(0.65rem+2.2vw),2.5rem)] font-medium leading-[1] text-[#1d1d1d] sm:leading-[1] lg:text-[40px] ${interTight.className}`;

  return (
    <section
      ref={sectionRef}
      className="bg-[#fefeff] px-5 py-12 sm:px-8 sm:py-14 md:px-12 lg:px-[115px] lg:py-[120px]"
    >
      <div className="mx-auto flex w-full max-w-[1236px] flex-col items-center justify-center gap-5 sm:gap-[19px]">
        <h2 className="flex w-full max-w-full flex-col items-center justify-center gap-3 text-center sm:flex-row sm:flex-wrap sm:items-end sm:justify-center sm:gap-2 md:gap-3">
          <span className={`${headlineCls} text-[#2a4dff]`}>
            {mapTextToWords(HEADLINE_BLUE, active, reduceMotion, nextIndex)}
          </span>
          <span className="inline-flex shrink-0 items-end justify-center leading-none">
            <span className="inline-block overflow-hidden pb-[0.12em]">
              <span
                className="inline-block transition-[transform,opacity] will-change-transform"
                style={{
                  transitionDuration: reduceMotion ? '0ms' : `${DURATION_S}s`,
                  transitionTimingFunction: EASE,
                  transitionDelay: reduceMotion
                    ? '0ms'
                    : `${nextIndex() * STAGGER_S}s`,
                  transform:
                    reduceMotion || active ? 'translateY(0)' : 'translateY(110%)',
                  opacity: reduceMotion || active ? 1 : 0,
                }}
              >
                <img
                  alt=""
                  src="/success-section/goal-target.svg"
                  width={93}
                  height={93}
                  className="h-[clamp(2.25rem,10vw,5.8rem)] w-[clamp(2.25rem,10vw,5.8rem)] object-contain"
                  decoding="async"
                />
              </span>
            </span>
          </span>
          <span className={`${headlineCls} text-[#141c42]`}>
            {mapTextToWords(HEADLINE_DARK, active, reduceMotion, nextIndex)}
          </span>
        </h2>

        <div className="flex w-full justify-center py-2 sm:py-[10px]">
          <p className={bodyCls}>
            {mapTextToWords(BODY, active, reduceMotion, nextIndex)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Success;
