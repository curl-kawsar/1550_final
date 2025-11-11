'use client';
import React, {useEffect} from 'react';
import {Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import './landing.css';

const Unlock = () => {
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
    <section className="max-h-[800px] flex flex-col justify-between relative items-center overflow-hidden lg:flex-row">
      {/* Right Side - Full Height Image (Top on mobile, Right on desktop) */}
      <div className="w-full h-96 lg:h-screen lg:w-1/2 relative overflow-hidden lg:order-2">
        {/* Responsive Image */}

        <Image
          src="/unlock-bar.png"
          alt="SAT Score Chart"
          fill
          className="object-cover object-top h-full w-full"
          priority
          // sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Left Side - White Background with Text & Checklist (Bottom on mobile, Left on desktop) */}
      <div className="w-full h-fit px-4 sm:h-fit lg:w-1/2 bg-white flex items-center sm:px-8 py-12 sm:py-16 lg:pl-32 lg:order-1 min-h-[50vh] lg:min-h-fit">
        <div className="max-w-md sm:max-w-lg lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto lg:mx-0 space-y-8 sm:space-y-10 lg:space-y-12 w-full">
          {/* Main Heading - Responsive Typography */}
          <h2
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-blue-500 tracking-wider text-center lg:text-left leading-tight"
            style={{fontFamily: 'Norwester'}}
          >
            NEVER SETTLE
          </h2>

          {/* Description - Responsive Typography */}
          <p className="text-gray-600 text-base xs:text-lg sm:text-xl md:text-xl lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed text-center lg:text-left max-w-prose mx-auto lg:mx-0">
            1550+ isn't just a score. It's proof you refuse to settle for less
            than your true potential. Your goals are worth fighting for, no
            matter what they are.
          </p>

          {/* Benefits List - Responsive Design */}
          <ul className="space-y-4 sm:space-y-5 lg:space-y-6 max-w-sm sm:max-w-md mx-auto lg:mx-0">
            {[
              'Entry into Top Colleges',
              'Athletic Scholarships',
              'Merit Scholarships',
              'Bragging Rights',
              'Confidence',
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-4 sm:gap-5 text-[#141C42] font-semibold text-base xs:text-lg sm:text-xl lg:text-lg xl:text-xl transition-all duration-200 hover:translate-x-1"
              >
                {/* Checkmark Icon - Responsive Sizing */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-6 lg:h-6 xl:w-7 xl:h-7 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span
                  className="tracking-wide leading-tight"
                  style={{fontFamily: 'Norwester'}}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Unlock;
