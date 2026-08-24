'use client';

import React from 'react';
import Link from 'next/link';
import {
    Store,
    ArrowForward
} from 'google-material-icons/filled';
import {
    ShoppingBag,
    Inventory2,
    ReceiptLong,
    PointOfSale,
    People,
    Check
} from 'google-material-icons/outlined';

export default function UseCasesSection() {
    const industries = [
        {
            title: 'Supermarkets & Groceries',
            tag: 'RETAIL & GROCERY',
            icon: ShoppingBag,
            desc: 'Speed up checkout queues with rapid barcode scanning, multiple payment methods, and automated low-stock reorder alerts.',
            points: [
                'Fast sub-second barcode ring up',
                'Split payments: Cash, Card & Transfer',
                'Hold/park carts for waiting shoppers',
                'Fast thermal receipt printing',
            ],
            color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        },
        {
            title: 'Pharmacies & Chemists',
            tag: 'HEALTHCARE & PHARMA',
            icon: Inventory2,
            desc: 'Track medication batches, monitor expiry dates, manage drug categories, and keep accurate records of customer purchases.',
            points: [
                'Batch number & expiry date monitoring',
                'Low-stock alerts for essential medicines',
                'Itemized dosage receipts',
                'Supplier purchase order history',
            ],
            color: 'bg-primary/10 text-primary border-primary/20',
        },
        {
            title: 'Boutiques & Fashion Stores',
            tag: 'APPAREL & BEAUTY',
            icon: Store,
            desc: 'Manage inventory variations by size and color, maintain VIP customer records, and handle digital WhatsApp receipts.',
            points: [
                'Product sizes, colors & variations',
                'Customer purchase history & notes',
                'Digital e-receipts sent via WhatsApp',
                'Custom discount & promotional codes',
            ],
            color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
        },
        {
            title: 'Wholesale & Provisions',
            tag: 'BULK & DISTRIBUTION',
            icon: ReceiptLong,
            desc: 'Sell in bulk cartons, bags, or single units while keeping a clean ledger of customer credits, deposits, and outstanding debts.',
            points: [
                'Bulk carton & single-unit price switching',
                'Customer credit & debt ledger with due dates',
                'Daily operating expense tracking',
                'End-of-day drawer cash reconciliation',
            ],
            color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        },
    ];

    return (
        <section id="use-cases" className="py-20 md:py-28 bg-surface scroll-mt-16 border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Header */}
                <div
                    data-aos="fade-up"
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                        Tailored Solutions
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mt-4 mb-4">
                        Built Specifically for Your Business Type
                    </h2>
                    <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
                        Whether you operate a single grocery shop, a high-volume pharmacy, or a wholesale provision store, BusinessHub adapts effortlessly to your daily routine.
                    </p>
                </div>

                {/* Industry Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {industries.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                data-aos="fade-up"
                                data-aos-delay={(idx % 2) * 120}
                                className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl border ${item.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-surface-container text-on-surface-variant border border-outline-variant">
                                            {item.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-on-surface mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-outline-variant/60 space-y-2.5">
                                    {item.points.map((p, pIdx) => (
                                        <div key={pIdx} className="flex items-center gap-2 text-xs font-medium text-on-surface">
                                            <div className="p-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <span>{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
