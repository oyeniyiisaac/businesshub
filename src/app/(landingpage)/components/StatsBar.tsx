'use client';

import React from 'react';
import {
    TrendingUp,
    Store
} from 'google-material-icons/filled';
import {
    Speed,
    CloudDone,
    Devices,
    CheckCircle
} from 'google-material-icons/outlined';

export default function StatsBar() {
    const stats = [
        {
            value: '< 1s',
            label: 'Instant Ring-Up Speed',
            sub: 'Fast barcode scan & checkout',
            icon: Speed,
        },
        {
            value: '100%',
            label: 'Real-Time Stock Sync',
            sub: 'Instant inventory updates on sales',
            icon: CloudDone,
        },
        {
            value: 'Any Device',
            label: 'Universal Compatibility',
            sub: 'Phones, tablets, PCs & thermal printers',
            icon: Devices,
        },
        {
            value: '100% Free',
            label: 'Early Access Program',
            sub: 'No credit card or setup fees required',
            icon: CheckCircle,
        },
    ];

    return (
        <section className="border-y border-outline-variant bg-surface-container-low py-10">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                data-aos="fade-up"
                                data-aos-delay={idx * 100}
                                className="flex items-start gap-3.5"
                            >
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-bold font-mono text-on-surface tracking-tight">
                                        {item.value}
                                    </h4>
                                    <p className="text-xs sm:text-sm font-semibold text-on-surface mt-0.5">
                                        {item.label}
                                    </p>
                                    <p className="text-[11px] sm:text-xs text-on-surface-variant">
                                        {item.sub}
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
