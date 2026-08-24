'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowForward } from 'google-material-icons/filled';
import { Check, Shield, SupportAgent } from 'google-material-icons/outlined';

export default function EarlyAccessSection() {
    const includedFeatures = [
        'Unlimited sales transactions & receipts',
        'Barcode scanner & camera lookup POS',
        'Real-time inventory tracking & low stock alerts',
        'Split payment support: Cash, Card & Bank Transfer',
        'Daily expense logging & real-time net profit margins',
        'Customer credit & debt ledger with due date tracking',
        'Automated end-of-day shift & drawer balancing',
        'Detailed sales trend analytics & CSV / Excel export',
    ];

    return (
        <section id="get-started" className="py-20 md:py-28 bg-surface scroll-mt-16 border-b border-outline-variant">
            <div className="max-w-5xl mx-auto px-4 md:px-8">
                {/* Header */}
                <div
                    data-aos="fade-up"
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                        Zero Risk • Free Access
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mt-4 mb-4">
                        Everything You Need to Run Your Store — Completely Free
                    </h2>
                    <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
                        Join our early access program. Get full access to all POS, inventory, expense tracking, and reporting tools with no upfront costs or subscriptions.
                    </p>
                </div>

                {/* Main Feature Highlight Box */}
                <div
                    data-aos="zoom-in"
                    data-aos-delay="150"
                    className="rounded-3xl border-2 border-primary/30 bg-surface-container-lowest p-8 sm:p-12 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        {/* Left: Value proposition (7 cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold shadow-sm">
                                <span>🎉 Early Access Tier</span>
                                <span>•</span>
                                <span>100% Free to Use</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                                Full Access to the Complete BusinessHub Suite
                            </h3>

                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                No locked features. No forced trial limits. Set up your store, add your stock, and start ringing up customer sales immediately.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                {includedFeatures.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-on-surface">
                                        <div className="p-0.5 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: CTA & Free Onboarding Card (5 cols) */}
                        <div className="lg:col-span-5 bg-surface border border-outline-variant rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-center space-y-6">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                                    Total Cost Today
                                </span>
                                <div className="mt-2 flex items-baseline justify-center gap-1">
                                    <span className="text-4xl sm:text-5xl font-extrabold font-mono text-primary">
                                        ₦0
                                    </span>
                                    <span className="text-xs text-on-surface-variant font-medium">/ free access</span>
                                </div>
                                <p className="text-xs text-on-surface-variant mt-2">
                                    No credit card required. Setup takes under 2 minutes.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href="/register"
                                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    <span>Create Your Free Account</span>
                                    <ArrowForward className="w-4 h-4" />
                                </Link>

                                <div className="p-3 rounded-lg bg-surface-container text-left flex items-start gap-2.5 text-xs text-on-surface-variant">
                                    <SupportAgent className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Free Onboarding Help:</strong> Need help uploading your product catalog? Our team is available on WhatsApp to assist.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
