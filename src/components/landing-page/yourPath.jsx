'use client';

import Image from 'next/image';
import { Inter_Tight } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const STAGGER_BLOCK_S = 0.055;
const BLOCK_DURATION_S = 0.62;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const MASKS = [
  {
    id: 'left',
    src: '/your-path/mask-left.svg',
    /** Shortest peak — left in sequence */
    heightClass: 'h-[220px] sm:h-[300px] md:h-[340px] lg:h-[380px]',
    widthClass: 'max-w-[200px] sm:max-w-[240px] md:max-w-[260px]',
  },
  {
    id: 'mid',
    src: '/your-path/mask-mid.svg',
    heightClass: 'h-[260px] sm:h-[340px] md:h-[400px] lg:h-[440px]',
    widthClass: 'max-w-[210px] sm:max-w-[250px] md:max-w-[270px]',
  },
  {
    id: 'right',
    src: '/your-path/mask-right.svg',
    /** Tallest peak — right in sequence (mask viewBox is also taller) */
    heightClass: 'h-[300px] sm:h-[380px] md:h-[460px] lg:h-[500px]',
    widthClass: 'max-w-[220px] sm:max-w-[260px] md:max-w-[280px]',
  },
];

function StaggerReveal({ children, delayIndex, active, reduceMotion, className = '' }) {
  const shown = reduceMotion || active;
  const delay = reduceMotion ? 0 : delayIndex * STAGGER_BLOCK_S;

  return (
    <div className={`min-w-0 overflow-hidden ${className}`}>
      <div
        className="will-change-transform transition-[transform,opacity]"
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

function MaskedPathPeak({ maskSrc, heightClass, widthClass, stackIndex = 0 }) {
  const z =
    stackIndex === 0 ? 'md:z-10' : stackIndex === 1 ? 'md:z-20' : 'md:z-30';
  return (
    <div
      className={`relative mx-auto w-full md:mx-0 ${widthClass} ${z} shrink-0`}
    >
      <div
        className={`relative w-full overflow-hidden ${heightClass}`}
        style={{
          WebkitMaskImage: `url(${maskSrc})`,
          maskImage: `url(${maskSrc})`,
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center bottom',
          maskPosition: 'center bottom',
        }}
      >
        <img
          src="/your-path/path-photo.png"
          alt=""
          className="absolute inset-0 block size-full max-w-none object-cover object-center"
        />
      </div>
    </div>
  );
}

/**
 * Figma node 181:990 — “Your path to 1550+”, podium art, three peaks, supporting copy.
 * Usage: `import YourPath from '@/components/landing-page/yourPath'`
 */
export default function YourPath() {
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
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-[#010516] px-6 py-10 sm:py-12 lg:px-12 lg:py-14 xl:px-[115px] ${interTight.className}`}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[12%] h-[min(882px,120vw)] w-[min(1246px,200vw)] max-w-none -translate-x-1/2 opacity-80 sm:translate-x-[10%]"
        aria-hidden
      >
        <div className="relative size-full rotate-[30deg]">
          <img
            src="/your-path/glow-1.svg"
            alt=""
            className="block size-full max-w-none object-contain"
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-[-5%] left-1/2 h-[min(882px,120vw)] w-[min(1246px,200vw)] max-w-none -translate-x-1/2 opacity-70 sm:-translate-x-[35%]"
        aria-hidden
      >
        <div className="relative size-full -scale-y-100 rotate-[150deg]">
          <img
            src="/your-path/glow-2.svg"
            alt=""
            className="block size-full max-w-none object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1236px] flex-col items-center gap-3 text-center sm:gap-4 lg:gap-5">
        <header>
          <h2 className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2">
            <StaggerReveal
              delayIndex={0}
              active={active}
              reduceMotion={reduceMotion}
              className="shrink-0"
            >
              <span className="font-['Norwester',sans-serif] text-[clamp(1.75rem,4.5vw,3rem)] uppercase leading-none tracking-wide text-white lg:text-[48px]">
                Your Path to
              </span>
            </StaggerReveal>
            <StaggerReveal
              delayIndex={1}
              active={active}
              reduceMotion={reduceMotion}
              className="shrink-0"
            >
              <div className="relative h-[clamp(3.25rem,8vw,4.25rem)] w-[clamp(6.5rem,18vw,8.125rem)] shrink-0">
                <img
                  src="/your-path/logo-frame.svg"
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 block size-full object-contain"
                />
                <img
                  src="/your-path/logo-inner.svg"
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-[10%] block size-[80%] max-h-[80%] max-w-[80%] object-contain"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-0.5 pr-[8%] font-['Norwester',sans-serif] leading-none drop-shadow-[0_1.6px_1.6px_rgba(0,24,147,0.4)]">
                  <span className="bg-gradient-to-b from-[#fefefe] from-[36%] to-[#aaa] bg-clip-text text-[clamp(1.5rem,4.2vw,2.75rem)] text-transparent">
                    1550
                  </span>
                  <span className="text-[clamp(1.25rem,3.5vw,2.4rem)] text-white">
                    +
                  </span>
                </span>
              </div>
            </StaggerReveal>
          </h2>
        </header>

        <div className="relative w-full max-w-[597px]">
          <Image
            src="/your-path/hero-podium.png"
            alt="Students on a podium representing different starting levels"
            width={597}
            height={761}
            className="h-auto w-full object-contain"
            sizes="(max-width: 768px) 100vw, 597px"
            priority={false}
          />
        </div>

        <StaggerReveal
          delayIndex={2}
          active={active}
          reduceMotion={reduceMotion}
          className="w-full max-w-[716px]"
        >
          <p className="text-[clamp(1.05rem,2.4vw,2rem)] leading-snug text-white/[0.8] lg:text-[32px] lg:leading-normal">
            There is no single path to a top 1% score, because students do not
            all begin in the same place.{' '}
          </p>
        </StaggerReveal>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 md:flex-row md:items-end md:justify-center md:gap-0 md:-space-x-8 lg:-space-x-12 xl:-space-x-16">
          {MASKS.map((m, i) => (
            <MaskedPathPeak
              key={m.id}
              maskSrc={m.src}
              heightClass={m.heightClass}
              widthClass={m.widthClass}
              stackIndex={i}
            />
          ))}
        </div>

        <StaggerReveal
          delayIndex={3}
          active={active}
          reduceMotion={reduceMotion}
          className="w-full max-w-[995px]"
        >
          <p className="text-[clamp(1.05rem,2.4vw,2rem)] leading-snug text-white/[0.8] lg:text-[32px] lg:leading-normal">
            Some students need to rebuild their foundation before momentum is
            possible, others are ready to train hard immediately, and a select
            few are already scoring at an elite level and need the final layer of
            precision that most programs cannot provide.
          </p>
        </StaggerReveal>
      </div>
    </section>
  );
}
