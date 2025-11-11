'use client';

import React from 'react';
import Image from 'next/image';

const Execuse = () => {
  return (
    <section className="py-8 px-2 sm:px-4 lg:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-8 sm:mb-12 uppercase font-norwester">
          Top Excuses that Keep
          <br />
          Your Score Low :
        </h2>

        {/* Excuses Image */}
        <div className="flex justify-center mb-8 sm:mb-16">
          <Image
            src="/photo.png"
            alt="Top excuses that keep your score low"
            width={600}
            height={400}
            className="object-contain max-w-full h-auto"
            priority
          />
        </div>

        {/* Arrow Divider */}
        <div className="flex justify-left my-6 overflow-hidden">
          <div className="flex items-center space-x-1">
            {/* Use arrow.png when available, fallback to chevrons */}
            <div className="flex items-center">
              <Image
                src="/arrow.png"
                alt="Arrow decoration"
                width={1500}
                height={20}
                className="object-cover"
                onError={(e) => {
                  // Fallback to text arrows if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center space-x-1">
                {Array.from({length: 20}, (_, i) => (
                  <span key={i} className="text-blue-500 text-2xl font-bold">
                    &gt;
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Execuse;
