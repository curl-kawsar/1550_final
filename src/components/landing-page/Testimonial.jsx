'use client';
import React, {useEffect} from 'react';

const Testimonial = () => {
  useEffect(() => {
    // Load Norwester font dynamically
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Norwester&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, #93C5FD 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Heading */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl sm:text-4xl font-bold text-gray-900"
            style={{fontFamily: 'Norwester'}}
          >
            Student Testimonial
          </h2>
  
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile & Info */}
          <div className="w-full lg:w-1/2">
            <div
              className="relative h-full min-h-[520px] p-8 text-white overflow-hidden rounded-3xl shadow-2xl border border-blue-500/25 bg-gradient-to-br from-black via-gray-900 to-blue-900"
            >
              {/* Dotted Background Pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, #93C5FD 2px, transparent 0)',
                  backgroundSize: '18px 18px',
                }}
              />

              {/* Profile Content */}
              <div className="relative z-10 flex flex-col items-center lg:items-start gap-6">
                <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl ring-2 ring-blue-400/50 bg-black/30">
                  <img
                    src="/adam.jpeg"
                    alt="Adam Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-center lg:text-left">
                  <h3
                    className="text-3xl sm:text-4xl font-bold text-blue-400"
                    style={{fontFamily: 'Norwester'}}
                  >
                    ADAM
                  </h3>
                  <div className="text-blue-300 text-base font-medium">
                    Full SAT Program
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-200 text-sm border border-blue-400/40">
                    <span className="h-2 w-2 rounded-full bg-blue-300" />
                    1550+ Success Story
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Video Player */}
          <div className="w-full lg:w-1/2">
            <div className="relative h-full min-h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-blue-200/50 bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)', backgroundSize:'18px 18px'}} />

              <div className="relative z-10 h-full flex flex-col">
                <div className="px-6 pt-6 pb-4">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-sm font-semibold uppercase tracking-wide"
                    style={{fontFamily: 'Norwester'}}
                  >
                    Student Testimonial
                  </div>
                </div>

                {/* Video Container with Aspect Ratio */}
                <div className="flex-1 px-6 pb-6">
                  <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/20 bg-black/40">
                    <div style={{position:'relative', width:'100%', height:'100%'}}>
                      <iframe 
                        allow="fullscreen" 
                        allowFullScreen 
                        height="100%" 
                        src="https://streamable.com/e/bz28tj?nocontrols=1" 
                        width="100%" 
                        style={{border:'none', width:'100%', height:'100%', position:'absolute', left:'0px', top:'0px', overflow:'hidden'}}
                        title="Adam Video Testimonial"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
