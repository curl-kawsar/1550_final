'use client';
import React from 'react';
import Image from 'next/image';

const Arrow = () => {
  return (
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
  );
};

export default Arrow;
