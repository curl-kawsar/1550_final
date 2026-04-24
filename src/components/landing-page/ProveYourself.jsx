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

          <Link href="https://calendly.com/erin-donovan/collegeadmissions" target='blank'>
            <Button className="hero-cta-btn py-10 px-16">
              Book a Call <ArrowUpRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProveYourself;
