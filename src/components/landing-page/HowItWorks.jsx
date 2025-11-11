"use client"
import React, { useEffect } from 'react'

const HowItWorks = () => {
  useEffect(() => {
    // Load Norwester font dynamically
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Norwester&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section className="relative">
      {/* Black Header Section with Dots */}
      <div className="py-16 relative" style={{ backgroundColor: '#000000' }}>
        {/* Dots overlay with opacity-30 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          {/* Main Heading */}
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-400 mb-6"
            style={{ fontFamily: 'Norwester' }}
          >
            HOW IT WORKS
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The fail-proof method to a top<br />
            score requires you to go ALL-IN!
          </p>
        </div>
      </div>

      {/* Step 1 - Light Blue */}
      <div 
        className="py-12"
        style={{
          background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
            style={{ fontFamily: 'Norwester' }}
          >
            SHOW UP TO EVERY LESSON.
          </h3>
        </div>
      </div>

      {/* Step 2 - Medium Blue */}
      <div 
        className="py-12"
        style={{
          background: 'linear-gradient(135deg, #123FA6 0%, #123FA6 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
            style={{ fontFamily: 'Norwester' }}
          >
            COMPLETE EVERY ASSIGNMENT
          </h3>
        </div>
      </div>

      {/* Step 3 - Dark Blue */}
      <div 
        className="py-12"
        style={{
          background: 'linear-gradient(135deg, #162C5E 0%, #162C5E 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
            style={{ fontFamily: 'Norwester' }}
          >
            GET OUT OF YOUR OWN WAY
          </h3>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks