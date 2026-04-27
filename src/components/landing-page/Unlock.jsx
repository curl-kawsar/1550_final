'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const STAGGER_S = 0.042;
const DURATION_S = 0.62;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const HEADLINE = 'Nobody is born into the top';
const BODY_1 =
  'The people achieving the most impressive results in school, work, and life do not have natural talent, luck, or some built-in difference that was there from the beginning.';
const BODY_2 =
  'Everybody who reached greatness or mastery in any area developed their raw talent and potential into excellence through coaching, training, and sustained practice and effort. A 1550+ puts a student in the top 1% of all test takers in the world, and it\'s our job to help get them there.';

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

const Unlock = () => {
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

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-[#010516] px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-[60px] xl:px-[115px] ${interTight.className}`}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[80px] h-[281px] w-[min(1277px,220vw)] max-w-none -translate-x-1/2 sm:left-auto sm:right-0 sm:top-[100px] sm:translate-x-[15%] lg:translate-x-[25%]"
        aria-hidden
      >
        <img
          alt=""
          src="/unlock-section/ellipse-glow.svg"
          className="block h-full w-full max-w-none object-contain object-center opacity-90"
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[1200px] flex-col gap-6 lg:gap-6">
        <div className="flex flex-col gap-5 lg:gap-6">
          {/* Headline row */}
          <h2 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-2 text-left font-['Norwester',sans-serif] uppercase not-italic leading-none tracking-[0.02em]">
            <span className="text-[clamp(1.75rem,5vw,3rem)] text-white">
              {mapTextToWords(HEADLINE, active, reduceMotion, nextIndex)}
            </span>
            {/* Icon + 1% inline with the headline baseline */}
            <span className="inline-flex shrink-0 items-baseline gap-2 sm:gap-2.5">
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
                    src="/unlock-section/vector-1pct.svg"
                    alt=""
                    width={77}
                    height={96}
                    className="h-[48px] w-auto object-contain sm:h-[64px] lg:h-[80px]"
                  />
                </span>
              </span>
              <span className="inline-block overflow-hidden pb-[0.12em]">
                <span
                  className="inline-block text-[clamp(1.75rem,5vw,3rem)] text-[#2a4dff] transition-[transform,opacity] will-change-transform"
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
                  1%
                </span>
              </span>
            </span>
          </h2>

          {/* Body paragraphs */}
          <p className="max-w-[900px] text-[clamp(0.9375rem,2vw,1.375rem)] leading-[1.6] text-white/[0.85]">
            {mapTextToWords(BODY_1, active, reduceMotion, nextIndex)}
          </p>
          <p className="max-w-[900px] text-[clamp(0.9375rem,2vw,1.375rem)] leading-[1.6] text-white/[0.85]">
            {mapTextToWords(BODY_2, active, reduceMotion, nextIndex)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Unlock;