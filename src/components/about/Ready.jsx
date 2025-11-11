'use client';

import React from 'react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

const Ready = () => {
  return (
    <section className="py-8 px-2 sm:px-4 lg:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 uppercase tracking-wide text-center font-norwester">
          Are You Ready?
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 sm:mb-12 text-center max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-0">
          Confidence and success at 1550+ levels aren't handed to anyone. They
          are earned through effort, day after day. Today can be the day you
          finally become the person who's been waiting for you to get out of
          your own way.
        </p>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Private Tutoring Card */}
          <div className="bg-blue-600 text-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl lg:text-3xl font-bold uppercase tracking-wide mb-6">
              Private Tutoring
            </h3>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Schedule a Call Now
            </Button>
          </div>

          {/* School Group Card */}
          <div className="bg-blue-600 text-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl lg:text-3xl font-bold uppercase tracking-wide mb-6">
              School Group
            </h3>
            <Link href="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                Register Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Note */}
        <p className="text-sm text-gray-600 text-center">
          Note: All ACT score results mentioned were converted into equivalent
          SAT scores for consistency and comparison.
        </p>
      </div>
    </section>
  );
};

export default Ready;
