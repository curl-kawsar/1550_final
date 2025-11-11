'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Shield, Star, Clock } from 'lucide-react';

const SpecialOfferContent = () => {
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 15,
        hours: 20,
        minutes: 30,
        seconds: 50
    });
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for payment status from URL params
    useEffect(() => {
        const payment = searchParams.get('payment');
        if (payment === 'cancelled') {
            toast.error('Payment was cancelled. Feel free to try again!');
        }
    }, [searchParams]);

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;
                
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else if (days > 0) {
                    days--;
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }
                
                return { days, hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handlePurchase = async (planType = 'recordings_only') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('studentToken');
            if (!token) {
                toast.error('Please log in to your student account first');
                router.push('/student-login');
                return;
            }

            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planType
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (error) {
            console.error('Error creating checkout session:', error);
            toast.error(error.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            {/* Hero Section */}
            <div className="min-h-[500px] bg-black flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 1px 1px, white 2px, transparent 0)',
                        backgroundSize: '20px 20px',
                    }}
                />
                
                <div className="text-center relative z-10">
                    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-blue-500 leading-tight tracking-wider">
                        WARNING YOU JUST
                        <br />
                        ENTERED 1550+!
                    </h1>
                </div>
            </div>

            {/* Offer Content Section */}
            <div className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-2xl sm:text-3xl md:text-4xl text-black font-medium leading-relaxed mb-8">
                        This class is fast-paced and your child will be learning dozens of high-impact strategies and tons of content in every session. Get the support you need at up to{' '}
                        <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl sm:text-2xl md:text-3xl">
                            84% OFF
                        </span>
                    </p>
                    
                    <button 
                        onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xl px-12 py-4 rounded-lg transition-colors duration-300 shadow-lg"
                    >
                        View Offer
                    </button>
                </div>
            </div>

            {/* Countdown Timer Section */}
            <div className="py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#0F1635' }}>
                        <div className="text-white text-2xl sm:text-3xl font-bold mb-2 font-mono">
                            {String(timeLeft.days).padStart(2, '0')} DAYS : {String(timeLeft.hours).padStart(2, '0')} HR : {String(timeLeft.minutes).padStart(2, '0')}MIN : {String(timeLeft.seconds).padStart(2, '0')}SEC
                        </div>
                        <div className="text-lg font-medium" style={{ color: '#FFD16E' }}>
                            Remaining of The offer !
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-white">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Limited Time Special Pricing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Plans Section */}
            <div id="pricing" className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
                            CHOOSE YOUR SUPPORT PLAN
                        </h2>
                        <p className="text-blue-500 text-lg sm:text-xl font-bold">
                            ONLY $16 A WEEK + A FREE 1550+ SAT ROADMAP
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm font-medium">Secure Payment Processing by Stripe</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Recordings Only Plan */}
                        <div className="bg-white border-2 border-blue-500 rounded-xl p-8 text-center flex flex-col h-full">
                            <div className="mb-6 flex justify-center">
                                <img src="/camera.png" alt="Camera" className="w-16 h-16" />
                            </div>
                            <div className="text-4xl font-bold text-blue-500 mb-4">
                                $99 <span className="text-gray-400 text-2xl line-through ml-2">$297</span>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">(processing fee will apply)</div>
                            <h3 className="text-xl font-bold text-black mb-6">
                                RECORDINGS ONLY
                            </h3>
                            <div className="flex-grow"></div>
                            <button 
                                onClick={() => handlePurchase('recordings_only')}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 w-full mt-auto flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Purchase'
                                )}
                            </button>
                        </div>

                        {/* Office Hours Only Plan */}
                        <div className="bg-white border-2 border-blue-500 rounded-xl p-8 text-center flex flex-col h-full">
                            <div className="mb-6 flex justify-center">
                                <img src="/time.png" alt="Time" className="w-16 h-16" />
                            </div>
                            <div className="text-4xl font-bold text-blue-500 mb-4">
                                $99 <span className="text-gray-400 text-2xl line-through ml-2">$297</span>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">(processing fee will apply)</div>
                            <h3 className="text-xl font-bold text-black mb-2">
                                OFFICE HOURS ONLY
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Mon, Tues, Wed, Thurs<br />
                                5:30-6:30pm PST
                            </p>
                            <div className="flex-grow"></div>
                            <button 
                                onClick={() => handlePurchase('office_hours_only')}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 w-full mt-auto flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Purchase'
                                )}
                            </button>
                        </div>

                        {/* Recordings and Office Hours Plan */}
                        <div className="bg-white border-2 border-blue-500 rounded-xl p-8 text-center flex flex-col h-full">
                            <div className="mb-6 flex justify-center items-center gap-2">
                                <img src="/camera.png" alt="Camera" className="w-12 h-12" />
                                <span className="text-blue-500 text-2xl font-bold">+</span>
                                <img src="/time.png" alt="Time" className="w-12 h-12" />
                            </div>
                            <div className="text-4xl font-bold text-blue-500 mb-4">
                                $99 <span className="text-gray-400 text-2xl line-through ml-2">$297</span>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">(processing fee will apply)</div>
                            <h3 className="text-xl font-bold text-black mb-2">
                                RECORDINGS AND<br />OFFICE HOURS
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Mon, Tues, Wed, Thurs<br />
                                5:30-6:30pm PST
                            </p>
                            <div className="flex-grow"></div>
                            <button 
                                onClick={() => handlePurchase('complete')}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 w-full mt-auto flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Purchase'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* SAT Roadmap Banner */}
                    <div className="bg-white border-2 border-blue-500 rounded-xl p-6 text-center">
                        <p className="text-blue-500 text-lg sm:text-xl font-bold">
                            1550+ SAT ROADMAP - LEARN THE EXACT PATH OUR PRIVATE CLIENTS TAKE TO REACH 1550+
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpecialOffer = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Loading special offer...</p>
                </div>
            </div>
        }>
            <SpecialOfferContent />
        </Suspense>
    );
};

export default SpecialOffer;