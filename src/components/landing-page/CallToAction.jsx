'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Inter_Tight } from 'next/font/google';
import './landing.css';
import { useEffect, useRef, useState } from 'react';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
});

const STAGGER_BLOCK_S = 0.055;
const BLOCK_DURATION_S = 0.62;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

function StaggerReveal({
  children,
  delayIndex,
  active,
  reduceMotion,
  className = '',
}) {
  const shown = reduceMotion || active;
  const delay = reduceMotion ? 0 : delayIndex * STAGGER_BLOCK_S;

  return (
    <div className={`min-w-0 overflow-hidden ${className}`}>
      <div
        className="will-change-transform transition-[transform,opacity] motion-reduce:will-change-auto"
        style={{
          transitionDuration: reduceMotion ? '0ms' : `${BLOCK_DURATION_S}s`,
          transitionTimingFunction: EASE,
          transitionDelay: `${delay}s`,
          transform: shown ? 'translateY(0)' : 'translateY(110%)',
          opacity: shown ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Final CTA — dark strip consistent with Testimonial / Unlock / YourPath:
 * #010516 base, Norwester headline + #2a4dff accent, Inter Tight body, hero CTA tile.
 */
const CallToAction = () => {
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion]);

  const headlineCls =
    "font-['Norwester',sans-serif] uppercase not-italic leading-none tracking-[0.02em] text-[clamp(1.75rem,4.8vw,3rem)] sm:text-[clamp(2rem,5vw,3rem)] lg:text-[48px]";

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-[#010516] py-14 sm:py-18 lg:py-24 ${interTight.className}`}
    >
      {/* Soft blue wash — matches dotted accents elsewhere */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.22]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(42,77,255,0.45) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(420px,70vw)] w-[min(920px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a4dff]/[0.14] blur-[100px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1236px] flex-col items-center px-6 sm:px-10 lg:px-16 xl:px-[115px]">
        <div className="relative flex w-full flex-col items-center">
          <div
            className="pointer-events-none absolute bottom-[8%] left-0 z-0 hidden h-[min(260px,38vw)] w-[min(160px,26vw)] -translate-x-[8%] sm:block lg:bottom-[12%] lg:h-[min(300px,34vw)] lg:w-[min(200px,22vw)] lg:-translate-x-[18%]"
            aria-hidden
          >
            <div className="cta-card-deco cta-card-deco--float relative h-full w-full">
              <Image
                src="/call-to-action/decoration-1.png"
                alt=""
                fill
                sizes="200px"
                className="object-contain object-bottom"
                draggable={false}
              />
            </div>
          </div>
          <div
            className="pointer-events-none absolute bottom-[8%] right-0 z-0 hidden h-[min(260px,38vw)] w-[min(160px,26vw)] translate-x-[8%] sm:block lg:bottom-[12%] lg:h-[min(300px,34vw)] lg:w-[min(200px,22vw)] lg:translate-x-[18%]"
            aria-hidden
          >
            <div className="cta-card-deco cta-card-deco--float-delayed relative h-full w-full">
              <Image
                src="/call-to-action/decoration-2.png"
                alt=""
                fill
                sizes="200px"
                className="object-contain object-bottom"
                draggable={false}
              />
            </div>
          </div>

          <div className="relative z-10 flex w-full max-w-[52rem] flex-col items-center gap-6 rounded-2xl border border-white/[0.08] bg-[#060b1a]/75 px-6 py-10 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:gap-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <header className="flex flex-col items-center gap-5 text-center">
              <h2 className="flex flex-wrap items-baseline justify-center gap-x-[0.35em] gap-y-2">
                <StaggerReveal
                  delayIndex={0}
                  active={active}
                  reduceMotion={reduceMotion}
                  className="shrink-0"
                >
                  <span className={`${headlineCls} text-white`}>
                    Claim your spot at the
                  </span>
                </StaggerReveal>
                <StaggerReveal
                  delayIndex={1}
                  active={active}
                  reduceMotion={reduceMotion}
                  className="shrink-0"
                >
                  <span className={`${headlineCls} text-[#2a4dff]`}>top</span>
                </StaggerReveal>
              </h2>

              <StaggerReveal
                delayIndex={2}
                active={active}
                reduceMotion={reduceMotion}
                className="max-w-xl"
              >
                <p className="text-pretty text-[clamp(1rem,2.6vw,1.375rem)] font-light leading-relaxed text-white/[0.82] lg:text-[22px] lg:leading-snug">
                  The path to success starts with the first step.
                </p>
              </StaggerReveal>
            </header>

            <StaggerReveal
              delayIndex={3}
              active={active}
              reduceMotion={reduceMotion}
              className="flex justify-center"
            >
              <Button
                asChild
                className="hero-cta-btn mt-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Link href="/register">
                  Join Today
                  <ArrowUpRight className="hero-cta-icon" size={18} aria-hidden />
                </Link>
              </Button>
            </StaggerReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
