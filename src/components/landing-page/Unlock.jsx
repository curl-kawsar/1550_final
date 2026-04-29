'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300'],
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

  /** Figma: Norwester 48px / 52px accent; fluid below xl */
  const headlineWhiteCls =
    'text-[clamp(1.625rem,calc(0.75rem+3.25vw),3rem)] text-white xl:text-[48px]';

  /** Accent "1%" one step larger than white per design */
  const headlineAccentCls =
    'text-[clamp(1.75rem,calc(0.8125rem+3.45vw),3.25rem)] text-[#2a4dff] xl:text-[52px]';

  /** Figma body: Inter Tight 36px, rgba white 85% */
  const bodyCls = `text-[clamp(1rem,3.2vw,2.25rem)] leading-[1] text-white/[0.85] xl:text-[36px]`;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#010516] px-6 py-12 sm:py-24 sm:px-10  lg:px-16 xl:px-[115px]"
    >
      {/* Background glow — Figma: 1277×281, center at 50%+486px from top 137 */}
      <div
        className="pointer-events-none absolute left-[calc(50%+min(96px,18vw))] top-[72px] h-[281px] w-[min(1277px,calc(100vw+80px))] max-w-none -translate-x-1/2 sm:left-[calc(50%+min(180px,28vw))] sm:top-[100px] lg:left-[calc(50%+486px)] lg:top-[137px] lg:w-[1277px] lg:-translate-x-1/2"
        aria-hidden
      >
        <div className="absolute inset-[-120%_-27%] sm:inset-[-100%_-24%] lg:inset-[-124.56%_-27.41%]">
          <img
            alt=""
            src="/unlock-section/ellipse-glow.svg"
            className="absolute block h-full w-full max-w-none object-contain object-center opacity-90"
          />
        </div>
      </div>

      <div className="relative container py-8 mx-auto z-10 flex w-full flex-col gap-6 lg:gap-6">
        {/* Figma: row gap 16px, items-end; stack on small screens */}
        <h2 className="flex w-full flex-col items-start gap-3 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-end min-[480px]:gap-4">
          <span
            className={`font-['Norwester',sans-serif] uppercase not-italic leading-none tracking-[0.02em] ${headlineWhiteCls}`}
          >
            {mapTextToWords(HEADLINE, active, reduceMotion, nextIndex)}
          </span>
          <span className="inline-flex shrink-0 items-end gap-3 min-[480px]:gap-4">
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
                  className="h-[clamp(40px,11vw,96px)] w-[min(77px,19vw)] object-contain sm:h-[min(80px,18vw)] lg:h-[96px] lg:w-[77px]"
                />
              </span>
            </span>
            <span className="inline-block overflow-hidden pb-[0.12em]">
              <span
                className={`inline-block font-['Norwester',sans-serif] uppercase not-italic leading-none transition-[transform,opacity] will-change-transform ${headlineAccentCls}`}
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

        <p className={`w-full ${bodyCls} ${interTight.className}`}>
          {mapTextToWords(BODY_1, active, reduceMotion, nextIndex)}
        </p>
        <p className={`w-full ${bodyCls} ${interTight.className}`}>
          {mapTextToWords(BODY_2, active, reduceMotion, nextIndex)}
        </p>
      </div>
    </section>
  );
};

export default Unlock;
