'use client';

import React from 'react';
import Arrow from './Arrow';

const Plus = () => {
  return (
    <section className="lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 uppercase tracking-wide font-norwester">
          1550+
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            In 2020, test prep as an industry began to fade as more families
            chose test-optional admissions. A few years earlier, we had already
            expanded into college admissions services for our most elite
            clients, so we shifted focus and stopped offering group test prep
            classes altogether.
          </p>

          <p className="text-lg">
            We continued working privately with a small handful of students each
            year, and our results only got stronger. Families eventually
            realized that admissions and scholarships were still tied to test
            scores, and when top universities reinstated testing requirements,
            demand surged again.
          </p>

          <p className="text-lg">
            By 2024, 22% of our students had achieved a perfect score, and
            nearly every student we worked with scored 1500 or higher. That same
            year, we launched free community programs as both service and
            research, adapting our methods after the major shift to the digital
            SAT. Since then, we’ve tested, refined, and built what we believe is
            the most effective SAT prep system available today.
          </p>
        </div>

        {/* Arrow Divider */}
        <Arrow />
      </div>
    </section>
  );
};

export default Plus;
