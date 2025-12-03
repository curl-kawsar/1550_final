'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Shield, Star, Clock } from 'lucide-react';

// Component for coupon input/display within each card
const CouponBox = ({ 
    couponCode, 
    setCouponCode, 
    couponApplied, 
    couponLoading, 
    handleApplyCoupon, 
    handleRemoveCoupon 
}) => {
    return (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            {!couponApplied ? (
                <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 text-center">
                        Have a coupon code?
                        <div className="text-xs text-gray-500 mt-1">
                            (Applies to selected plan)
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={couponLoading}
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium px-3 py-2 text-sm rounded transition-colors duration-300 flex items-center gap-1"
                        >
                            {couponLoading ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                'Apply'
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-semibold text-green-800">
                                    Coupon Applied!
                                </div>
                                <div className="text-xs text-green-700">
                                    <strong>{couponApplied.coupon.code}</strong> - {couponApplied.discount.discountPercentage}% off
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Will apply to your selected plan
                                </div>
                            </div>
                            <button
                                onClick={handleRemoveCoupon}
                                className="text-red-600 hover:text-red-800 font-medium text-xs"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                    
                    {couponApplied.discount.isFree && (
                        <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-center">
                            <span className="text-yellow-800 font-medium text-xs">
                                FREE ACCESS!
                            </span>
                        </div>
                    )}
                    
                    <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                            <span>Original:</span>
                            <span>${couponApplied.discount.originalAmount}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-${couponApplied.discount.discountAmount}</span>
                        </div>
                        <div className="flex justify-between font-bold text-blue-800 border-t pt-1">
                            <span>Final:</span>
                            <span>
                                {couponApplied.discount.isFree ? 'FREE!' : `$${couponApplied.discount.finalAmount}`}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SpecialOfferContent = () => {
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 15,
        hours: 20,
        minutes: 30,
        seconds: 50
    });
    // Separate coupon states for each card
    const [recordingsCoupon, setRecordingsCoupon] = useState({
        code: '',
        applied: null,
        loading: false
    });
    const [officeHoursCoupon, setOfficeHoursCoupon] = useState({
        code: '',
        applied: null,
        loading: false
    });
    const [completeCoupon, setCompleteCoupon] = useState({
        code: '',
        applied: null,
        loading: false
    });
    const [originalPrice] = useState(99);
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

    const handleApplyCoupon = async (planType) => {
        const couponState = getCouponState(planType);
        const setCouponState = getCouponSetter(planType);
        
        if (!couponState.code.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setCouponState(prev => ({ ...prev, loading: true }));
        try {
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: couponState.code.trim(),
                    planType: 'all', // Allow coupon for all plan types
                    amount: originalPrice
                })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setCouponState(prev => ({ ...prev, applied: data, loading: false }));
                toast.success(`Coupon applied! ${data.discount.discountPercentage}% discount`);
            } else {
                toast.error(data.error || 'Invalid coupon code');
                setCouponState(prev => ({ ...prev, applied: null, loading: false }));
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error('Failed to apply coupon');
            setCouponState(prev => ({ ...prev, applied: null, loading: false }));
        }
    };

    const handleRemoveCoupon = (planType) => {
        const setCouponState = getCouponSetter(planType);
        setCouponState({ code: '', applied: null, loading: false });
        toast.info('Coupon removed');
    };

    // Helper functions to get coupon state and setter based on plan type
    const getCouponState = (planType) => {
        switch (planType) {
            case 'recordings_only': return recordingsCoupon;
            case 'office_hours_only': return officeHoursCoupon;
            case 'complete': return completeCoupon;
            default: return recordingsCoupon;
        }
    };

    const getCouponSetter = (planType) => {
        switch (planType) {
            case 'recordings_only': return setRecordingsCoupon;
            case 'office_hours_only': return setOfficeHoursCoupon;
            case 'complete': return setCompleteCoupon;
            default: return setRecordingsCoupon;
        }
    };

    const handlePurchase = async (planType = 'recordings_only') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('studentToken');
            if (!token) {
                toast.error('Please log in to your student account first');
                router.push('/student-login');
                return;
            }

            // Get the appropriate coupon for the plan type
            const currentCoupon = getCouponState(planType);
            
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planType,
                    ...(currentCoupon.applied && { couponCode: currentCoupon.applied.coupon.code })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Handle free purchase (100% discount)
            if (data.isFree) {
                toast.success(data.message);
                setTimeout(() => {
                    window.location.href = data.redirectUrl;
                }, 2000);
                return;
            }

            // Redirect to Stripe Checkout for paid purchases
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
                        <div className="bg-white border-2 border-blue-500 rounded-xl p-6 text-center flex flex-col h-full">
                            <div className="mb-4 flex justify-center">
                                <img src="/camera.png" alt="Camera" className="w-16 h-16" />
                            </div>
                            <div className="text-4xl font-bold text-blue-500 mb-3">
                                {recordingsCoupon.applied ? (
                                    <>
                                        {recordingsCoupon.applied.discount.isFree ? (
                                            <span className="text-green-600">FREE!</span>
                                        ) : (
                                            <>
                                                ${recordingsCoupon.applied.discount.finalAmount}
                                                <span className="text-gray-400 text-2xl line-through ml-2">${originalPrice}</span>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        $99 <span className="text-gray-400 text-2xl line-through ml-2">$297</span>
                                    </>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">(processing fee will apply)</div>
                            <h3 className="text-xl font-bold text-black mb-4">
                                RECORDINGS ONLY
                            </h3>
                            
                            <div className="flex-grow"></div>
                            
                            {/* Coupon Box */}
                            <CouponBox 
                                couponCode={recordingsCoupon.code}
                                setCouponCode={(value) => setRecordingsCoupon(prev => ({ ...prev, code: value }))}
                                couponApplied={recordingsCoupon.applied}
                                couponLoading={recordingsCoupon.loading}
                                handleApplyCoupon={() => handleApplyCoupon('recordings_only')}
                                handleRemoveCoupon={() => handleRemoveCoupon('recordings_only')}
                            />
                            
                            <button 
                                onClick={() => handlePurchase('recordings_only')}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 w-full flex items-center justify-center gap-2"
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
                        <div className="bg-white border-2 border-blue-500 rounded-xl p-6 text-center flex flex-col h-full">
                            <div className="mb-4 flex justify-center">
                                <img src="/time.png" alt="Time" className="w-16 h-16" />
                            </div>
                            <div className="text-4xl font-bold text-blue-500 mb-3">
                                {officeHoursCoupon.applied ? (
                                    <>
                                        {officeHoursCoupon.applied.discount.isFree ? (
                                            <span className="text-green-600">FREE!</span>
                                        ) : (
                                            <>
                                                ${officeHoursCoupon.applied.discount.finalAmount}
                                                <span className="text-gray-400 text-2xl line-through ml-2">${originalPrice}</span>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        $99 <span className="text-gray-400 text-2xl line-through ml-2">$297</span>
                                    </>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">(processing fee will apply)</div>
                            <h3 className="text-xl font-bold text-black mb-2">
                                OFFICE HOURS ONLY
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Mon, Tues, Wed, Thurs<br />
                                5:30-6:30pm PST
                            </p>
                            
                            <div className="flex-grow"></div>
                            
                            {/* Coupon Box */}
                            <CouponBox 
                                couponCode={officeHoursCoupon.code}
                                setCouponCode={(value) => setOfficeHoursCoupon(prev => ({ ...prev, code: value }))}
                                couponApplied={officeHoursCoupon.applied}
                                couponLoading={officeHoursCoupon.loading}
                                handleApplyCoupon={() => handleApplyCoupon('office_hours_only')}
                                handleRemoveCoupon={() => handleRemoveCoupon('office_hours_only')}
                            />
                            
                            <button 
                                onClick={() => handlePurchase('office_hours_only')}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 w-full flex items-center justify-center gap-2"
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
                        <div className="bg-white border-2 border-blue-500 rounded-xl p-6 text-center flex flex-col h-full">
                            <div className="mb-4 flex justify-center items-center gap-2">
                                <img src="/camera.png" alt="Camera" className="w-12 h-12" />
                                <span className="text-blue-500 text-2xl font-bold">+</span>
                                <img src="/time.png" alt="Time" className="w-12 h-12" />
                            </div>
                            <div className="text-4xl font-bold text-blue-500 mb-3">
                                {completeCoupon.applied ? (
                                    <>
                                        {completeCoupon.applied.discount.isFree ? (
                                            <span className="text-green-600">FREE!</span>
                                        ) : (
                                            <>
                                                ${completeCoupon.applied.discount.finalAmount}
                                                <span className="text-gray-400 text-2xl line-through ml-2">${originalPrice}</span>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        $99 <span className="text-gray-400 text-2xl line-through ml-2">$297</span>
                                    </>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">(processing fee will apply)</div>
                            <h3 className="text-xl font-bold text-black mb-2">
                                RECORDINGS AND<br />OFFICE HOURS
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Mon, Tues, Wed, Thurs<br />
                                5:30-6:30pm PST
                            </p>
                            
                            <div className="flex-grow"></div>
                            
                            {/* Coupon Box */}
                            <CouponBox 
                                couponCode={completeCoupon.code}
                                setCouponCode={(value) => setCompleteCoupon(prev => ({ ...prev, code: value }))}
                                couponApplied={completeCoupon.applied}
                                couponLoading={completeCoupon.loading}
                                handleApplyCoupon={() => handleApplyCoupon('complete')}
                                handleRemoveCoupon={() => handleRemoveCoupon('complete')}
                            />
                            
                            <button 
                                onClick={() => handlePurchase('complete')}
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 w-full flex items-center justify-center gap-2"
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