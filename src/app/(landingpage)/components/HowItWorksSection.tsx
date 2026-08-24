'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    ArrowForward,
    CreditCard
} from 'google-material-icons/filled';
import {
    QrCodeScanner,
    PointOfSale,
    TrendingUp,
    ReceiptLong,
    Inventory2,
    Check
} from 'google-material-icons/outlined';

export default function HowItWorksSection() {
    const [activeStep, setActiveStep] = useState(1);

    const steps = [
        {
            number: '01',
            title: 'Add & Scan Your Products',
            badge: 'SETUP IN 2 MINUTES',
            description:
                'Easily import your existing product catalog via CSV or add items with your phone/scanner camera. Set cost prices, selling prices, and minimum stock alerts.',
            details: [
                'Bulk Excel / CSV catalog upload',
                'Automatic SKU & Barcode generator',
                'Category & supplier assignment',
                'Custom low-stock alert thresholds',
            ],
            mockup: {
                title: 'Product Ingestion',
                subtitle: 'Import 500+ items with one click',
                tag: 'Step 1 of 3',
                items: [
                    { label: 'Imported Products', val: '450 Items' },
                    { label: 'Categories Created', val: '18 Categories' },
                    { label: 'Alert Thresholds', val: 'Active (Min 10 units)' },
                ],
            },
        },
        {
            number: '02',
            title: 'Ring Up Customers in Seconds',
            badge: 'LIGHTNING-FAST CHECKOUT',
            description:
                'Use the POS terminal on any device (PC, tablet, or smartphone). Scan barcodes, apply discounts, and accept Cash, Card, or direct Bank Transfer.',
            details: [
                'Sub-second item scanning and cart addition',
                'Multi-currency & Naira ₦ breakdown',
                'Split payments across Cash, Card & Transfer',
                'Thermal printer & WhatsApp e-receipts',
            ],
            mockup: {
                title: 'POS Live Checkout',
                subtitle: 'Processed in 1.4 seconds',
                tag: 'Step 2 of 3',
                items: [
                    { label: 'Transaction Type', val: 'POS Quick Sale' },
                    { label: 'Payment Method', val: 'Split: ₦20k Cash + ₦49.4k Transfer' },
                    { label: 'Receipt Status', val: 'Printed & WhatsApp Sent' },
                ],
            },
        },
        {
            number: '03',
            title: 'Track Live Profits & Multi-Branch Growth',
            badge: 'AUTOMATED INTELLIGENCE',
            description:
                'Stock counts update across all branches in real-time. Review daily revenue, net profit margins, cashier shifts, and auto-generated accounting reports.',
            details: [
                'Live stock decrement with zero delay',
                'Automated daily gross & net profit calculation',
                'Cashier shift and drawer reconciliation',
                'Executive analytics accessible anywhere 24/7',
            ],
            mockup: {
                title: 'Real-Time Financial Sync',
                subtitle: 'Zero discrepancy ledger',
                tag: 'Step 3 of 3',
                items: [
                    { label: 'Today’s Net Profit', val: '₦137,140 (28.4% Margin)' },
                    { label: 'Stock Discrepancy', val: '0 Items (100% accurate)' },
                    { label: 'End-of-Day Report', val: 'Auto-Exported to Owner' },
                ],
            },
        },
    ];

    const current = steps[activeStep - 1];

    return (
        <section id="how-it-works" className="py-20 md:py-28 bg-surface border-b border-outline-variant scroll-mt-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Header */}
                <div
                    data-aos="fade-up"
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                        Effortless Workflow
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mt-4 mb-4">
                        How BusinessHub Works in 3 Simple Steps
                    </h2>
                    <p className="text-base sm:text-lg text-on-surface-variant">
                        From your first product upload to complete financial reporting — get up and running today with zero steep learning curves.
                    </p>
                </div>

                {/* Step Selector Pills */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="100"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
                >
                    {steps.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveStep(idx + 1)}
                            className={`p-5 rounded-xl text-left border transition-all ${
                                activeStep === idx + 1
                                    ? 'bg-surface-container-lowest border-primary shadow-md ring-2 ring-primary/20'
                                    : 'bg-surface-container-low border-outline-variant hover:bg-surface-container'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                        activeStep === idx + 1
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container text-on-surface-variant'
                                    }`}
                                >
                                    STEP {s.number}
                                </span>
                                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                                    {s.badge}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-on-surface">
                                {s.title}
                            </h3>
                        </button>
                    ))}
                </div>

                {/* Active Step Showcase Box */}
                <div
                    data-aos="zoom-in"
                    data-aos-delay="200"
                    className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                    {/* Left: Step Description (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            <span>Step {current.number}</span>
                            <span>•</span>
                            <span>{current.badge}</span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-bold text-on-surface">
                            {current.title}
                        </h3>

                        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                            {current.description}
                        </p>

                        {/* Bullet checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {current.details.map((detail, dIdx) => (
                                <div key={dIdx} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-on-surface">
                                    <div className="p-1 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span>{detail}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all"
                            >
                                <span>Try This Now For Free</span>
                                <ArrowForward className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Visual Mockup for Step (5 cols) */}
                    <div className="lg:col-span-5 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                            <div>
                                <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                                    {current.mockup.tag}
                                </span>
                                <h4 className="text-sm font-bold text-on-surface mt-0.5">
                                    {current.mockup.title}
                                </h4>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        </div>

                        <p className="text-xs text-on-surface-variant">
                            {current.mockup.subtitle}
                        </p>

                        <div className="space-y-3 pt-2">
                            {current.mockup.items.map((item, mIdx) => (
                                <div
                                    key={mIdx}
                                    className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center justify-between text-xs"
                                >
                                    <span className="text-on-surface-variant font-medium">{item.label}</span>
                                    <span className="font-semibold text-on-surface font-mono">{item.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 text-center">
                            <span className="text-[11px] text-primary font-medium">
                                ✨ Seamless cloud synchronization enabled
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
