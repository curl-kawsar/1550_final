'use client';

import React from 'react';
import Arrow from './Arrow';

const Program = () => {
  return (
    <section className="py-8 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 uppercase tracking-wide font-norwester">
          Our Program
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            1550+ isn't test prep…it's a mindset and a way of life.
          </p>

          <p className="text-lg">
            The same mindset that pushes you through test prep can change
            everything else in your life. Academics, sports, leadership,
            relationships, and career objectives. 1550+ is about choosing to
            change your life through our own daily choices.
          </p>

          <p className="text-lg">
            The program combines strategy, preparation, and self-discipline into
            a powerful formula. Our world-class coaching, effective lessons,
            firm accountability, and full support systems are designed to push
            students further than they thought possible.
          </p>

          <p className="text-lg">
            Our private clients get an entire team working with them to reach
            the top, and our school groups and free 7-day bootcamps follow the
            same system in a group setting.
          </p>
        </div>

        {/* Arrow Divider */}
        <Arrow />
      </div>
    </section>
  );
};

export default Program;
