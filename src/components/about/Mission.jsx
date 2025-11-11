'use client';

import React from 'react';
import Arrow from './Arrow';

const Mission = () => {
  return (
    <section className="py-8 px-2 sm:px-4 lg:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 uppercase tracking-wide font-norwester">
          Our Mission
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Our mission is to help students adopt the 1550+ way of
            life...thinking bigger, pushing harder, and transforming what they
            believe is possible.
          </p>
        </div>

        {/* Arrow Divider */}
        <Arrow />
      </div>
    </section>
  );
};

export default Mission;
