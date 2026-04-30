'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Inter_Tight } from 'next/font/google';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const STAGGER_S = 0.42;
const DURATION_S = 0.62;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const headlineCls =
  "font-['Norwester',sans-serif] uppercase not-italic leading-none tracking-[0.02em] text-[clamp(2rem,5vw,3rem)] sm:text-[48px] sm:leading-[56px]";

function useReducedMotion() {
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

function EntrancePanel({ children, index, visible, reduceMotion }) {
  const shown = reduceMotion || visible;
  const delay = reduceMotion ? 0 : index * STAGGER_S;

  return (
    <div
      className="h-full min-h-0 will-change-[opacity,transform] motion-reduce:will-change-auto"
      style={{
        transitionDuration: reduceMotion ? '0ms' : `${DURATION_S}s`,
        transitionTimingFunction: EASE,
        transitionDelay: `${delay}s`,
        transitionProperty: 'opacity, transform',
        transform: shown ? 'translate3d(0,0,0)' : 'translate3d(0,22px,0)',
        opacity: shown ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Dark testimonial strip — navy base, Norwester + Inter Tight,
 * scroll-triggered entrance (matches YourPath / howitswork_2 rhythm).
 */
const Testimonial = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className={`relative bg-[#010516] px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-[115px] lg:py-[88px] ${interTight.className}`}
    >
      <div className="relative mx-auto flex w-full max-w-[1236px] flex-col">
        <header className="mb-6 text-center sm:mb-8 lg:mb-9">
          <h2 className={`${headlineCls} flex flex-wrap items-center justify-center gap-x-[0.35em] gap-y-1`}>
            <span className="text-white">Student</span>
            <span className="text-[#2a4dff]">Testimonial</span>
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:auto-rows-fr lg:grid-cols-2 lg:gap-6 lg:h-[max(480px,min(560px,62vh))]">
          <EntrancePanel index={0} visible={visible} reduceMotion={reduceMotion}>
            <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060b1a]/90 p-5 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-6">
              <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5">
                <div className="relative flex min-h-[min(220px,52vw)] flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-[#2a4dff]/20 bg-[#0d1228]/80 sm:min-h-[min(260px,44vw)]  lg:min-h-[min(300px,42vh)]">
                  <Image
                    src="/adam.png"
                    alt="Adam — Full SAT Program"
                    width={800}
                    height={800}
                    className="h-auto w-full max-h-full object-contain object-center"
                    sizes="(max-width: 1024px) 90vw, 46vw"
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-3 text-center lg:text-left">
                  <div>
                    <h3 className="font-['Norwester',sans-serif] text-[clamp(1.5rem,3.8vw,2.25rem)] uppercase leading-none tracking-wide text-[#2a4dff]">
                      Adam
                    </h3>
                    <p className="mt-1.5 text-[clamp(0.9375rem,2vw,1.0625rem)] font-medium leading-tight text-white/[0.82]">
                      Full SAT Program
                    </p>
                  </div>
                  <div className="flex justify-center lg:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#2a4dff]/35 bg-[#2a4dff]/12 px-3 py-1.5 text-sm font-medium text-white/90">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#2a4dff]" aria-hidden />
                      1550+ Success Story
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </EntrancePanel>

          <EntrancePanel index={1} visible={visible} reduceMotion={reduceMotion}>
            <div className="relative isolate h-full w-full min-h-[min(48vw,300px)] overflow-hidden rounded-2xl border border-[#2a4dff]/25 bg-[#050a18] shadow-[0_24px_64px_-20px_rgba(0,0,0,0.5)] lg:min-h-0">
              <div
                className="pointer-events-none absolute inset-0 z-[1] opacity-[0.25]"
                aria-hidden
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(42,77,255,0.35) 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />
              <span className="pointer-events-none absolute left-5 top-5 z-20 inline-flex items-center rounded-full border border-white/15 bg-black/35 px-3 py-1.5 backdrop-blur-sm font-['Norwester',sans-serif] text-xs font-normal uppercase tracking-[0.08em] text-white/95 sm:left-6 sm:top-6 sm:text-sm">
                Watch the story
              </span>
              <iframe
                allow="fullscreen"
                allowFullScreen
                className="absolute inset-0 z-0 block h-full w-full border-0"
                src="https://streamable.com/e/bz28tj?nocontrols=1"
                title="Adam video testimonial"
              />
            </div>
          </EntrancePanel>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
