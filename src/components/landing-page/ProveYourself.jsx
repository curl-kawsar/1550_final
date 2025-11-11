'use client';
import React, {useEffect} from 'react';

import {Check} from 'lucide-react';
// import {URL} from 'next/dist/compiled/@edge-runtime/primitives/url';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import './landing.css';

const ProveYourself = () => {
  useEffect(() => {
    // Load Norwester font dynamically
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Norwester&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section className="hero-image py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-center lg:justify-start h-full min-h-[70vh] sm:min-h-[75vh] lg:min-h-[80vh] lg:ml-[2rem] xl:ml-[5rem]">
          {/* Main Content */}
          <div className="w-full max-w-2xl lg:max-w-none lg:w-1/2 space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Main Heading - Responsive Typography */}
            <h2
              className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[8rem] xl:text-[10rem] 2xl:text-[12rem] font-bold text-white leading-[0.85] sm:leading-[0.9] lg:leading-tight tracking-tight"
              style={{fontFamily: 'Norwester'}}
            >
              1550+
            </h2>

            {/* Description - Responsive Typography */}
            <p
              className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl text-white leading-relaxed px-2 sm:px-0 lg:ml-2 xl:ml-5 font-light tracking-wide"
              style={{fontFamily: 'Norwester'}}
            >
              It's not just a score
            </p>
            
            {/* CTA Button - Responsive Positioning */}
            <div className="pt-4 sm:pt-6 lg:pt-8 lg:ml-2 xl:ml-5">
              <Link href="/register">
                <Button className="login-gradient-btn px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base lg:text-lg text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProveYourself;
