'use client';

import React from 'react';
import Arrow from './Arrow';

const Spark = () => {
  return (
    <section className="py-6 sm:py-8 px-2 sm:px-4 lg:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 uppercase tracking-wide font-norwester">
          The Spark
        </h2>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p className="text-lg">
            She referred nine friends. One of those friends referred twelve
            more. Word spread quickly.
          </p>

          <p className="text-lg">
            At the same time, our results were consistently above industry
            standards. Students starting with 1200+ scores were finishing in the
            top 2% of test-takers nationwide.
          </p>

          {/* <p className="text-lg">
            By 2021, those quiet referrals had expanded into Arizona and California, and today the majority of our most dedicated families still come from the West.
          </p> */}

          <p className="text-lg">
            Private family clients were limited to only 10-12 per year, and
            those spots became highly coveted, with families joining waitlists
            to secure them.
          </p>

          <p className="text-lg">
            For years, families guarded our name, sharing it only with their
            closest friends and relatives. We never advertised because
            word-of-mouth alone kept our limited private spaces full each year.
            By 2021, those quiet referrals had expanded into Arizona and
            California, and today the majority of our most dedicated families
            still come from the West.
          </p>
        </div>

        {/* Arrow Divider */}
        <Arrow />
      </div>
    </section>
  );
};

export default Spark;
