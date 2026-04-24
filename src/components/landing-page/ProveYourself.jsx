'use client';
import React, {useEffect} from 'react';

import {ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import './landing.css';

const ProveYourself = () => {
  // useEffect(() => {
  //   // Load Norwester font dynamically
  //   const link = document.createElement('link');
  //   link.href =
  //     'https://fonts.googleapis.com/css2?family=Norwester&display=swap';
  //   link.rel = 'stylesheet';
  //   document.head.appendChild(link);

  //   return () => {
  //     document.head.removeChild(link);
  //   };
  // }, []);

  return (
    <section className="hero-image">
      <img
        className="hero-image-bg"
        src="/hero-image.png"
        alt="Student preparing for SAT"
      />

      <div className="hero-overlay" />

      <div className="hero-content-wrap">
        <div className="hero-content">
          <h2 className="hero-title norwes">
            HOW THE
            <br />
            TOP <span>1%</span>
            <br />
            PREPS FOR
            <br />
            THE SAT.
          </h2>

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
        </div>
      </div>
    </section>
  );
};

export default ProveYourself;
