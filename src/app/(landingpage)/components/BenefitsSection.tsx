'use client';

import React from 'react';
import {
    Shield,
    CheckCircle,
    Star
} from 'google-material-icons/filled';
import {
    AccountBalance,
    Devices,
    Inventory2,
    Speed,
    Store,
    CloudDone,
    Payments,
    SupportAgent
} from 'google-material-icons/outlined';

export default function BenefitsSection() {
    const benefits = [
        {
            icon: AccountBalance,
            title: 'Tailored for Modern Commerce',
            description:
                'Built-in support for Naira (₦), rapid bank transfer confirmation, split payments, and local tax compliance.',
        },
        {
            icon: Inventory2,
            title: 'Stop Stock Shrinkage & Theft',
            description:
                'Audit logs track every price edit, refund, and discount. End-of-day cashier drawer reconciliations eliminate unaccounted cash loss.',
        },
        {
            icon: Devices,
            title: 'Zero Expensive Hardware Lock-in',
            description:
                'Use standard barcode scanners, thermal receipt printers, laptops, tablets, or smartphones without buying proprietary machines.',
        },
        {
            icon: Store,
            title: 'Real-Time Multi-Branch Visibility',
            description:
                'Check sales and stock levels for multiple branch locations from anywhere on your mobile phone or laptop.',
        },
        {
            icon: CloudDone,
            title: 'Automatic Backups & 24/7 Security',
            description:
                'Your transactions and customer ledgers are continuously backed up in real time with enterprise-grade encryption.',
        },
        {
            icon: SupportAgent,
            title: 'Dedicated Local Onboarding & Support',
            description:
                'Fast human customer support via WhatsApp, phone, and email to help you import stock and train your team smoothly.',
        },
    ];

    return (
        <section id="benefits" className="py-20 md:py-28 bg-surface-container-lowest scroll-mt-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Section Header */}
                <div
                    data-aos="fade-up"
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                        Why Choose Us
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mt-4 mb-4">
                        Engineered for High-Performance Stores
                    </h2>
                    <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
                        Whether you operate a single grocery shop, a high-volume pharmacy, or a chain of wholesale stores, BusinessHub protects your profits and accelerates growth.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {benefits.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                data-aos="fade-up"
                                data-aos-delay={(idx % 3) * 100}
                                className="p-6 sm:p-7 rounded-2xl bg-surface border border-outline-variant hover:border-primary/50 transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-on-primary transition-all">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-on-surface mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
