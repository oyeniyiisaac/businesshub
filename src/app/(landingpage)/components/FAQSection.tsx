'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Close } from 'google-material-icons/filled';
import { HelpOutline } from 'google-material-icons/outlined';

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: 'Do I need expensive specialized hardware to use BusinessHub?',
            a: 'No! BusinessHub runs directly on any standard laptop, desktop computer, iPad, Android tablet, or smartphone. You can connect standard USB or Bluetooth barcode scanners, cash drawers, and 58mm/80mm thermal receipt printers seamlessly without buying proprietary terminals.',
        },
        {
            q: 'How does BusinessHub prevent cashier theft and inventory loss?',
            a: 'Every sale, voided ticket, price override, and discount is permanently recorded in an immutable audit trail. Cashiers have their own shift drawers which require end-of-day reconciliation before closing. Any mismatch between expected cash and actual drawer contents is immediately flagged.',
        },
        {
            q: 'Can I manage multiple store branches or warehouses with one login?',
            a: 'Yes. With our Growth and Enterprise plans, you can manage multiple physical store locations, compare individual store performance, transfer stock between warehouses, and view company-wide consolidated financials from a single dashboard.',
        },
        {
            q: 'How does BusinessHub handle Nigerian bank transfer payments?',
            a: 'BusinessHub includes a dedicated Bank Transfer payment channel with reference number tracking. Cashiers can verify the exact credited amount on their screen, attach the bank transaction reference to the receipt, and print an itemized invoice instantly.',
        },
        {
            q: 'Can I import my existing product catalog from Excel or another POS?',
            a: 'Yes. You can import your entire product catalog, categories, barcodes, buying costs, selling prices, and current stock quantities in bulk via our simple Excel/CSV template in under two minutes.',
        },
        {
            q: 'Is my business and financial data secure?',
            a: 'Your store data is protected with 256-bit enterprise encryption, automated continuous cloud backups, and 99.99% server availability. Even if your store laptop or phone is lost or damaged, your data remains safe and instantly accessible on any new device.',
        },
    ];

    const toggle = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section id="faq" className="py-20 md:py-28 bg-surface scroll-mt-16 border-b border-outline-variant">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                {/* Header */}
                <div
                    data-aos="fade-up"
                    className="text-center mb-16"
                >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                        Got Questions?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mt-4 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-base sm:text-lg text-on-surface-variant">
                        Everything you need to know about setting up and running your store with BusinessHub.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {faqs.map((item, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={idx}
                                data-aos="fade-up"
                                data-aos-delay={(idx % 4) * 60}
                                className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden transition-all duration-200"
                            >
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors"
                                >
                                    <span className="text-sm sm:text-base font-bold text-on-surface">
                                        {item.q}
                                    </span>
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant shrink-0 font-bold transition-transform duration-200 ${
                                            isOpen ? 'rotate-45 text-primary bg-primary/10' : ''
                                        }`}
                                    >
                                        +
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-6 pt-1 sm:px-6 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/40 bg-surface-container-lowest animate-fadeIn">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Support note */}
                <div className="mt-12 text-center p-6 rounded-2xl bg-surface-container border border-outline-variant">
                    <p className="text-sm font-semibold text-on-surface mb-1">
                        Have a question not listed here?
                    </p>
                    <p className="text-xs text-on-surface-variant mb-4">
                        Our friendly team of retail specialists is always ready to guide you through setup.
                    </p>
                    <Link
                        href="/support"
                        className="inline-flex items-center text-xs sm:text-sm font-bold text-primary hover:underline"
                    >
                        Chat with our Support Specialists →
                    </Link>
                </div>
            </div>
        </section>
    );
}
