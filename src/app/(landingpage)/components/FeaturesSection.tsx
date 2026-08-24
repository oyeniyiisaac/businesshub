'use client';

import React from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    Store,
    CreditCard,
    ArrowForward
} from 'google-material-icons/filled';
import {
    ShoppingBag,
    Inventory2,
    ReceiptLong,
    Payments,
    Shield,
    Speed,
    BarChart,
    People,
    PointOfSale,
    QrCodeScanner,
    AccountBalance
} from 'google-material-icons/outlined';

export default function FeaturesSection() {
    const features = [
        {
            icon: PointOfSale,
            badge: 'POS TERMINAL',
            title: 'Lightning-Fast Point of Sale',
            description:
                'Ring up sales in seconds with barcode scanner support, camera capture, split payments (Cash, Card, Transfer), and instant thermal receipt printing.',
            highlights: ['Barcode & Camera Scanning', 'Split & Bank Transfer Payments', 'Hold/Park Sales Carts', 'Digital & Thermal Receipts'],
            color: 'bg-primary/10 text-primary border-primary/20',
        },
        {
            icon: Inventory2,
            badge: 'STOCK CONTROL',
            title: 'Automated Real-Time Inventory',
            description:
                'Every sale automatically updates your stock levels. Set low-stock thresholds, monitor batch expiry dates, and receive restock alerts before running out.',
            highlights: ['Instant Stock Decrement', 'Low Stock & Expiry Alerts', 'SKU & Barcode Generation', 'Supplier Restock Tracking'],
            color: 'bg-secondary/10 text-secondary border-secondary/20',
        },
        {
            icon: ReceiptLong,
            badge: 'EXPENSES & PROFIT',
            title: 'Cash Flow & Net Profit Tracking',
            description:
                'Track daily operating costs (fuel, staff, utilities) alongside sales to see your exact gross and net profit margins in real time without messy spreadsheets.',
            highlights: ['Categorized Expense Logging', 'Real-Time Net Profit Margins', 'Cash Drawer Reconciliation', 'Cash Leakage Prevention'],
            color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        },
        {
            icon: People,
            badge: 'CUSTOMER CRM',
            title: 'Customer Ledger & Debt Management',
            description:
                'Keep customer purchase history, manage customer credit/debt with due dates, and track loyalty points to reward your most valuable repeat buyers.',
            highlights: ['Customer Debt & Credit Records', 'Purchase History Profiles', 'Loyalty Rewards System', 'Overdue Debt Tracking'],
            color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
        },
        {
            icon: Store,
            badge: 'MULTI-LOCATION',
            title: 'Multi-Branch & Granular Roles',
            description:
                'Manage multiple retail outlets, stores, and warehouses from a single dashboard. Assign role-based permissions to cashiers, managers, and accountants.',
            highlights: ['Centralized Multi-Store Control', 'Strict Cashier/Manager Roles', 'Stock Transfer Between Outlets', 'Complete Audit Trail Logs'],
            color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        },
        {
            icon: BarChart,
            badge: 'ANALYTICS & BI',
            title: 'Actionable Reports & Analytics',
            description:
                'Gain deep visibility into your sales velocity, top-selling inventory items, cashier performance, and export clean financial reports for auditing and tax.',
            highlights: ['Visual Sales Trend Charts', 'Top & Dead-Stock Analysis', 'Cashier Shift Performance', 'One-Click Excel / CSV Export'],
            color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
        },
    ];

    return (
        <section id="features" className="py-20 md:py-28 bg-surface-container-lowest scroll-mt-16">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Section Header */}
                <div
                    data-aos="fade-up"
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
                        Everything You Need
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mt-4 mb-4">
                        Built to Power Every Aspect of Your Store
                    </h2>
                    <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
                        Eliminate manual book-keeping errors, prevent inventory shrinkage, and scale your operations with tools engineered specifically for retail success.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                data-aos="fade-up"
                                data-aos-delay={(idx % 3) * 100}
                                className="p-6 sm:p-8 rounded-2xl bg-surface border border-outline-variant hover:border-primary/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Icon & Badge */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`p-3 rounded-xl border ${item.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-surface-container text-on-surface-variant border border-outline-variant">
                                            {item.badge}
                                        </span>
                                    </div>

                                    {/* Title & Desc */}
                                    <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2.5 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Highlights List */}
                                <div className="pt-4 border-t border-outline-variant/60 space-y-2">
                                    {item.highlights.map((point, pIdx) => (
                                        <div key={pIdx} className="flex items-center gap-2 text-xs font-medium text-on-surface">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA Banner inside Features */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="mt-16 p-8 rounded-2xl bg-surface-container border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-on-surface mb-2">
                            Need a custom setup for multiple supermarket branches?
                        </h4>
                        <p className="text-sm text-on-surface-variant max-w-2xl">
                            We support centralized databases, offline local servers, and customized staff permissions for chain stores.
                        </p>
                    </div>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-colors shrink-0"
                    >
                        <span>Get Started Free</span>
                        <ArrowForward className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
