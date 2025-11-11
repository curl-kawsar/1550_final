"use client"
import React, { useEffect } from 'react'
import { Check, Video } from 'lucide-react'

const MidPoint = () => {
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
  const programItems = [
    "Diagnostic Test",
    "Week 1 - Goal setting and Punctuation", 
    "Week 2 - Advanced Commas",
    "Week 3 - Advanced Punctuation",
    "Week 4 - Grammar",
    "Week 5 - Reading",
    "Week 6 - Mastery and Strategy"
  ]

  const successItems = [
    "Homework Assignments",
    "Accountability", 
    "Motivation",
    "Proctored Practice Exams",
    "Structured Lessons",
    "Live Tutoring"
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Dotted Background Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #93C5FD 2px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Heading */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ fontFamily: 'Norwester' }}>
            <span className="text-blue-500">Most Aren't Willing to Do</span>
            <br />
            <span className="text-blue-500">What It Takes.</span>{' '}
            <span className="text-black">ARE YOU?</span>
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Left Side - Stats Cards */}
          <div className="flex flex-col space-y-6 lg:w-1/4">
            {/* 6 Weeks Card */}
            <div 
              className="text-white rounded-2xl p-10 text-center"
              style={{ backgroundColor: '#1E293B', fontFamily: 'Norwester' }}
            >
              <div className="text-7xl font-bold mb-1">6</div>
              <div className="text-2xl font-bold tracking-wider">WEEKS</div>
            </div>

            {/* 100% Free Card */}
            <div 
              className="text-white rounded-2xl p-10 text-center"
              style={{ backgroundColor: '#1E293B', fontFamily: 'Norwester' }}
            >
              <div className="text-6xl font-bold mb-1">100%</div>
              <div className="text-2xl font-bold tracking-wider">FREE</div>
            </div>
          </div>

          {/* Right Side - Content Cards */}
          <div className="flex flex-col md:flex-row gap-8 lg:w-3/4">
            {/* Included in Program */}
            <div className="flex-1">
              <div 
                className="rounded-2xl p-8 h-full border-2"
                style={{ 
                  backgroundColor: '#EBF4FF', 
                  borderColor: '#93C5FD'
                }}
              >
                <h3 className="text-blue-600 font-bold text-lg mb-8 text-center" style={{ fontFamily: 'Norwester' }}>
                  INCLUDED IN THE PROGRAM
                </h3>
                <div className="space-y-4">
                  {programItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Everything You Need */}
            <div className="flex-1">
              <div 
                className="rounded-2xl p-8 h-full border-2"
                style={{ 
                  backgroundColor: '#EBF4FF', 
                  borderColor: '#93C5FD'
                }}
              >
                <h3 className="text-blue-600 font-bold text-lg mb-8 text-center" style={{ fontFamily: 'Norwester' }}>
                  EVERYTHING YOU NEED TO SUCCEED
                </h3>
                <div className="space-y-4">
                  {successItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Sections */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Before & After Tests */}
          <div 
            className="flex-1 border-2 rounded-2xl p-6 text-center"
            style={{ 
              backgroundColor: 'white', 
              borderColor: '#93C5FD'
            }}
          >
            <h4 className="text-blue-600 font-bold text-lg" style={{ fontFamily: 'Norwester' }}>
              BEFORE & AFTER TESTS FOR RESULTS YOU CAN SEE!
            </h4>
          </div>

          {/* All Sessions on Zoom */}
          <div 
            className="flex-1 text-white rounded-2xl p-6 text-center flex items-center justify-center space-x-3"
            style={{ backgroundColor: '#1E293B' }}
          >
            <Video className="w-6 h-6" />
            <h4 className="font-bold text-lg" style={{ fontFamily: 'Norwester' }}>
              ALL SESSIONS HELD ON ZOOM
            </h4>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MidPoint