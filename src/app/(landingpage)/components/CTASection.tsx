'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowForward } from 'google-material-icons/filled';
import { Check } from 'google-material-icons/outlined';

export default function CTASection() {
    return (
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-primary-container to-primary text-on-primary relative overflow-hidden">
            {/* Ambient Background Circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/15 blur-2xl rounded-full pointer-events-none" />

            <div
                data-aos="zoom-in"
                data-aos-duration="700"
                className="max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10"
            >
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/15 text-white text-xs md:text-sm font-semibold mb-6 border border-white/20 backdrop-blur-sm">
                    🚀 Ready to scale your retail operations?
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
                    Take Full Control of Your Sales, Stock & Profits Today
                </h2>

                <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto">
                    Eliminate manual logbook errors, stop inventory shrinkage, and speed up customer checkouts with a modern platform built for retail efficiency.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/register"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary hover:bg-white/95 font-bold text-base shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
                    >
                        <span>Create Your Free Account</span>
                        <ArrowForward className="w-5 h-5 text-primary" />
                    </Link>
                    <Link
                        href="/login"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/30 backdrop-blur-sm transition-all active:scale-[0.98]"
                    >
                        <span>Sign In to Your Store</span>
                    </Link>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs sm:text-sm text-white/80 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-white" />
                        <span>100% Free early access</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-white" />
                        <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-white" />
                        <span>Setup in 2 minutes</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
