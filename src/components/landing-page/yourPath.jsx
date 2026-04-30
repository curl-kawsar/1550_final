'use client';

import Image from 'next/image';
import Link from 'next/link';
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

/** Program cards — exported PNG figures from Figma (node 181:990); overlap top of panel. */
const PROGRAM_CARDS = [
  {
    id: 'foundations',
    title: 'Foundations',
    description:
      'Targeted skill rebuilding to strengthen core math or reading skills',
    figureSrc: '/your-path/small.png',
    figureWidth: 210,
    figureHeight: 269,
    figureMaxClass:
      'w-[min(210px,72vw)] sm:w-[min(210px,68vw)] lg:w-[210px]',
    figureLiftClass: '-translate-y-[6%] sm:-translate-y-[8%] lg:-translate-y-[12%]',
  },
  {
    id: 'intensive',
    title: 'Intensive Prep',
    description:
      'Intensive group classes or one-on-one tutoring to reach 1400+',
    figureSrc: '/your-path/mid.png',
    figureWidth: 239,
    figureHeight: 289,
    figureMaxClass:
      'w-[min(239px,78vw)] sm:w-[min(239px,72vw)] lg:w-[239px]',
    figureLiftClass: '-translate-y-[10%] sm:-translate-y-[12%] lg:-translate-y-[16%]',
  },
  {
    id: 'last100',
    title: 'The Last 100 Program',
    description:
      'Specialized training for 1450+ scorers, ready to go for the top 1%',
    figureSrc: '/your-path/big.png',
    figureWidth: 250,
    figureHeight: 319,
    figureMaxClass:
      'w-[min(250px,82vw)] sm:w-[min(250px,76vw)] lg:w-[250px]',
    figureLiftClass: '-translate-y-[12%] sm:-translate-y-[14%] lg:-translate-y-[18%]',
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

function ProgramCard({ card }) {
  return (
    <article className="relative max-h-fit mx-auto w-full max-w-[390px] self-end overflow-visible pb-6">
      <div
        className={`pointer-events-none relative z-30 mx-auto flex min-h-[min(160px,42vw)] shrink-0 justify-center sm:min-h-[min(200px,40vw)] lg:min-h-[220px] ${card.figureLiftClass}`}
      >
        <div className={`relative shrink-0 -left-16 top-16 sm:top-20 lg:top-[4.25rem] ${card.figureMaxClass}`}>
          <Image
            src={card.figureSrc}
            alt=""
            width={card.figureWidth}
            height={card.figureHeight}
            className="pointer-events-none block h-auto w-full object-contain object-bottom"
            sizes="(max-width: 640px) 72vw, (max-width: 1024px) 280px, 280px"
          />
        </div>
      </div>

      {/* Card panel: sits under the figure; overlap matches reference */}
      <div className="relative z-20 -mt-[clamp(3.25rem,14vw,5.5rem)] h-[270px] w-full overflow-visible">
        <img
          src="/your-path/card-frame.svg"
          alt=""
          className="pointer-events-none absolute inset-0 z-0 size-full object-fill"
          width={390}
          height={270}
        />
        <div className="relative z-10 flex h-full flex-col justify-end px-[clamp(1.25rem,6vw,2rem)] pb-5 pt-[5.5rem] sm:pb-6 sm:pt-[5.75rem] lg:px-8 lg:pb-7 lg:pt-24">
          <h3
            className="font-norwester text-[clamp(1.35rem,3.8vw,2.25rem)] uppercase leading-none text-[#2a4dff] lg:text-[30px]"
            style={{ fontFeatureSettings: "'liga' off" }}
          >
            {card.title}
          </h3>
          <p className="mt-3 text-[clamp(0.9375rem,2.1vw,1.25rem)] leading-[1] text-white/[0.8] lg:mt-[14px] lg:max-w-[310px] lg:text-[20px]">
            {card.description}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * Figma node 181:990 — “Your path to 1550+”, two-column story, program cards, CTA.
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

  const figureSrc = '/your-path/figure-photo.png';

  return (
    <section
      ref={sectionRef}
      className={`relative h-fit min-h-0 overflow-x-clip bg-[#010516] px-6 py-10 sm:py-12 lg:px-12 lg:py-24 xl:px-[115px] ${interTight.className}`}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[4%] h-[min(882px,130vw)] w-[min(1246px,220vw)] max-w-none -translate-x-1/2 opacity-80 sm:left-[calc(50%+min(18vw,200px))] lg:top-[5%]"
        aria-hidden
      >
        <div className="relative size-full rotate-[30deg]">
          <img
            src="/your-path/glow-a.svg"
            alt=""
            className="block size-full max-w-none object-contain object-center"
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-[0%] left-1/2 h-[min(882px,130vw)] w-[min(1246px,220vw)] max-w-none -translate-x-1/2 opacity-70 sm:left-[calc(50%-min(22vw,240px))]"
        aria-hidden
      >
        <div className="relative size-full -scale-y-100 rotate-[150deg]">
          <img
            src="/your-path/glow-b.svg"
            alt=""
            className="block size-full max-w-none object-contain object-center"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1236px] flex-col items-center gap-8 sm:gap-10 lg:gap-0">
        <header className="w-full text-center">
          <h2 className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-[12px]">
            <StaggerReveal
              delayIndex={0}
              active={active}
              reduceMotion={reduceMotion}
              className="shrink-0"
            >
              <span className="font-norwester text-[clamp(1.375rem,4.2vw,3rem)] uppercase leading-none tracking-wide text-white lg:text-[48px]">
                Your Path to
              </span>
            </StaggerReveal>
            <StaggerReveal
              delayIndex={1}
              active={active}
              reduceMotion={reduceMotion}
              className="shrink-0"
            >
              <span className="relative inline-block h-[clamp(2.75rem,8vw,4.375rem)] w-[clamp(6.5rem,22vw,8.004rem)] shrink-0">
                <Image
                  src="/your-path/logo-1550.png"
                  alt="1550+"
                  width={128}
                  height={70}
                  className="size-full object-contain object-center"
                  sizes="(max-width: 640px) 120px, 128px"
                />
              </span>
            </StaggerReveal>
          </h2>
        </header>

        <div className="grid w-full max-w-[1236px] grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-x-10 xl:gap-x-[74px]">
          <div className="relative mx-auto w-full max-w-[493px] justify-self-center lg:justify-self-start">
            <Image
              src="/your-path/hero-left.png"
              alt="Students at different levels on a podium"
              width={393}
              height={502}
              className="h-auto w-full object-contain"
              sizes="(max-width: 1024px) 90vw, 393px"
            />
          </div>

          <StaggerReveal
            delayIndex={2}
            active={active}
            reduceMotion={reduceMotion}
            className="flex w-full max-w-[698px] flex-col gap-4 text-[rgba(255,255,255,0.8)] lg:justify-self-end"
          >
            <div className="flex flex-col gap-4 text-[clamp(1.0625rem,2.2vw,1.5rem)] leading-normal lg:text-[24px]">
              <p>
                There is no single path to a top 1% score, because students do
                not all begin in the same place.
              </p>
              <p>
                Some students need to rebuild their foundation before momentum
                is possible, others are ready to train hard immediately, and a
                select few are already scoring at an elite level and need the
                final layer of precision that most programs cannot provide.
              </p>
            </div>
          </StaggerReveal>
        </div>

        <div className="-mt-6 flex w-full max-w-[1236px] flex-wrap items-end content-end justify-center gap-8 sm:-mt-8 md:gap-6 lg:-mt-14 lg:gap-[26px]">
          {PROGRAM_CARDS.map((card) => (
            <ProgramCard key={card.id} card={card} />
          ))}
        </div>

        <div className="flex w-full justify-center pt-2 sm:pt-4">
          <Button
            asChild
            className="hero-cta-btn focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Link href="/register">
              Explore Programs
              <ArrowUpRight className="hero-cta-icon" size={18} aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
