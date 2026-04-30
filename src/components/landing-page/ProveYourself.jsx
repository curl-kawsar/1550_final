'use client';

import React, {useEffect, useState} from 'react';

import {ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import './landing.css';

const LINE_STAGGER_MS = 72;
const BTN_INDEX = 4;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.32, 1)';

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

function HeroStaggerLine({index, reveal, reducedMotion, children}) {
  const on = reducedMotion ? true : reveal;
  const delay = reducedMotion ? 0 : index * LINE_STAGGER_MS;

  return (
    <span className="block overflow-hidden">
      <span
        className={`block will-change-[opacity,transform] ${
          on ? 'translate-y-0 opacity-100' : 'translate-y-[0.42em] opacity-0'
        }`}
        style={
          reducedMotion
            ? undefined
            : {
                transitionProperty: 'opacity, transform',
                transitionDuration: '0.62s, 0.62s',
                transitionTimingFunction: `${EASE_OUT}, ${EASE_OUT}`,
                transitionDelay: `${delay}ms`,
              }
        }
      >
        {children}
      </span>
    </span>
  );
}

function HeroStaggerFade({index, reveal, reducedMotion, className = '', children}) {
  const on = reducedMotion ? true : reveal;
  const delay = reducedMotion ? 0 : index * LINE_STAGGER_MS;

  return (
    <span
      className={`block will-change-[opacity,transform] ${className} ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-[0.42em] opacity-0'
      }`}
      style={
        reducedMotion
          ? undefined
          : {
              transitionProperty: 'opacity, transform',
              transitionDuration: '0.62s, 0.62s',
              transitionTimingFunction: `${EASE_OUT}, ${EASE_OUT}`,
              transitionDelay: `${delay}ms`,
            }
      }
    >
      {children}
    </span>
  );
}

const ProveYourself = () => {
  const reducedMotion = usePrefersReducedMotion();
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setReveal(true);
      return;
    }
    const id = requestAnimationFrame(() => setReveal(true));
    return () => cancelAnimationFrame(id);
  }, [reducedMotion]);

  return (
    <section className="hero-image" aria-label="Hero">
      <div
        className="absolute inset-0 z-[1] overflow-hidden"
        style={{
          opacity: reducedMotion ? 1 : reveal ? 1 : 0,
          transition: reducedMotion
            ? undefined
            : `opacity 1.25s ${EASE_OUT}`,
        }}
      >
        <img
          className="hero-image-bg"
          src="/hero-image.png"
          alt="Student preparing for SAT"
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content-wrap">
        {/* Same horizontal inset as Unlock + HowItWorks (container + px axis) */}
        <div className="container mx-auto w-full px-6 sm:px-10 lg:px-16 xl:px-[115px]">
          <div className="hero-content">
            <h2 className="hero-title norwes">
              <HeroStaggerLine index={0} reveal={reveal} reducedMotion={reducedMotion}>
                HOW THE
              </HeroStaggerLine>
              <HeroStaggerLine index={1} reveal={reveal} reducedMotion={reducedMotion}>
                TOP <span className="hero-title-accent">1%</span>
              </HeroStaggerLine>
              <HeroStaggerLine index={2} reveal={reveal} reducedMotion={reducedMotion}>
                PREPS FOR
              </HeroStaggerLine>
              <HeroStaggerLine index={3} reveal={reveal} reducedMotion={reducedMotion}>
                THE SAT.
              </HeroStaggerLine>
            </h2>

            <HeroStaggerFade index={BTN_INDEX} reveal={reveal} reducedMotion={reducedMotion}>
              <Button
                asChild
                className="hero-cta-btn focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Link
                  href="https://calendly.com/erin-donovan/collegeadmissions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a Call
                  <ArrowUpRight className="hero-cta-icon" size={18} aria-hidden />
                </Link>
              </Button>
            </HeroStaggerFade>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProveYourself;
