'use client';

import React from 'react';
import Arrow from './Arrow';

const Will = () => {
  return (
    <section className="lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 uppercase tracking-wide font-norwester">
          Will This Work for You?
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Here's the truth…if you only “try,” it won't. This program demands
            more than trying and will require that you bring out parts of
            yourself you've been hiding.
          </p>

          <p className="text-lg">
            The program works, if you follow it. If you do nothing, nothing
            happens. 
          </p>
        </div>

        {/* Arrow Divider */}
        <Arrow />
      </div>
    </section>
  );
};

export default Will;
