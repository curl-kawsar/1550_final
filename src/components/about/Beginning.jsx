'use client';
import React from 'react';
import Arrow from './Arrow';

const Beginning = () => {
  return (
    <section className="py-10 px-2 sm:px-4 lg:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 uppercase tracking-wide font-norwester">
          In the Beginning
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            Fifteen years ago, we worked with our very first test prep student
            in a library in Ohio. She came to us really embarrassed about her
            low score, which wasn't even breaking 900.
          </p>

          <p className="text-lg">
            After the program, she scored a 1520, and she and her family were
            thrilled. Her family knew she wasn't going to qualify for financial
            aid, so they were pleasantly surprised when she earned an $8,000 per
            year merit scholarship to her top choice. That covered nearly 40% of
            her tuition, which was a 3.2x ROI in scholarships.
          </p>

          <p className="text-lg">
            Her original goal was a 1250, which she needed to be competitive for
            a selective track in a top business school. She wanted that program
            because of its focus on social media, and she was already building
            her brand with nearly 20,000 Instagram followers at the time.
          </p>
        </div>

        {/* Arrow Divider */}
        <Arrow />
      </div>
    </section>
  );
};

export default Beginning;
