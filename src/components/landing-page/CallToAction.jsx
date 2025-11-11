'use client';
import React, {useEffect} from 'react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

const CallToAction = () => {
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
    <section
      className="py-20 relative overflow-hidden"
      style={{
        backgroundColor: '#F0F9FE',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, #93C5FD 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading - Single line as requested */}
        <h2
          className="text-3xl md:text-3xl lg:text-4xl font-bold text-blue-500 mb-8 leading-tight"
          style={{fontFamily: 'Norwester'}}
        >
          CLAIM YOUR SPOT AT THE TOP
        </h2>
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto">
          The path to success starts with the first step.
        </p>
        {/* CTA Button - Matching original design */}
        <Link href="/register">
          <Button className="login-gradient-btn px-10 mt-5 ml-5 text-white hover:scale-105 transition-all duration-200">
            Join Today
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
