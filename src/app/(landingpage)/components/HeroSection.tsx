'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Store,
    TrendingUp,
    CheckCircle,
    Star,
    ArrowForward,
    CreditCard
} from 'google-material-icons/filled';
import {
    ShoppingBag,
    ReceiptLong,
    Inventory2,
    QrCodeScanner,
    Payments,
    Shield,
    Check,
    Speed
} from 'google-material-icons/outlined';

export default function HeroSection() {
    const [activeTab, setActiveTab] = useState<'pos' | 'analytics' | 'inventory'>('pos');

    return (
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-surface via-surface-container-lowest to-surface">
            {/* Background Decorative Gradients */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute top-10 right-10 w-72 h-72 bg-secondary/10 blur-[90px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Hero Header Text */}
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    {/* Badge */}
                    <div
                        data-aos="fade-down"
                        data-aos-duration="600"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold mb-6 shadow-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Next-Gen Point of Sale & Retail Management OS
                    </div>

                    {/* Headline */}
                    <h1
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.15] mb-6"
                    >
                        Run, Grow & Scale Your{' '}
                        <span className="text-primary bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                            Retail & Wholesale
                        </span>{' '}
                        Business
                    </h1>

                    {/* Subtitle */}
                    <p
                        data-aos="fade-up"
                        data-aos-delay="200"
                        className="text-base sm:text-lg md:text-xl text-on-surface-variant leading-relaxed mb-8 max-w-2xl mx-auto"
                    >
                        Lightning-fast POS checkout, automated inventory tracking, instant bank transfer verification, and multi-branch intelligence — all in one modern platform.
                    </p>

                    {/* CTAs */}
                    <div
                        data-aos="fade-up"
                        data-aos-delay="300"
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-base"
                        >
                            <span>Get Started Free</span>
                            <ArrowForward className="w-5 h-5" />
                        </Link>
                        <Link
                            href="#features"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold border border-outline-variant transition-all active:scale-[0.98] text-base"
                        >
                            <span>Explore Features</span>
                        </Link>
                    </div>

                    {/* Quick highlights */}
                    <div
                        data-aos="fade-up"
                        data-aos-delay="400"
                        className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-on-surface-variant font-medium"
                    >
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-primary" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-primary" />
                            <span>Ready in 2 minutes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-primary" />
                            <span>Works on Mobile, Tablet & PC</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Product Mockup Card */}
                <div
                    data-aos="zoom-in-up"
                    data-aos-delay="250"
                    data-aos-duration="800"
                    className="relative max-w-5xl mx-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl overflow-hidden"
                >
                    {/* Mockup Topbar / Tab Switcher */}
                    <div className="flex flex-wrap items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-error/70" />
                                <span className="w-3 h-3 rounded-full bg-amber-400" />
                                <span className="w-3 h-3 rounded-full bg-primary/70" />
                            </div>
                            <span className="text-xs font-mono text-on-surface-variant/80 ml-2 hidden sm:inline-block">
                                businesshub.app/app/dashboard
                            </span>
                        </div>

                        {/* Interactive Tab Switcher */}
                        <div className="flex items-center bg-surface-container rounded-lg p-1 border border-outline-variant text-xs font-medium">
                            <button
                                onClick={() => setActiveTab('pos')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                                    activeTab === 'pos'
                                        ? 'bg-primary text-on-primary shadow-sm font-semibold'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>POS Terminal</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                                    activeTab === 'analytics'
                                        ? 'bg-primary text-on-primary shadow-sm font-semibold'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Analytics</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                                    activeTab === 'inventory'
                                        ? 'bg-primary text-on-primary shadow-sm font-semibold'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                <Inventory2 className="w-4 h-4" />
                                <span>Live Stock</span>
                            </button>
                        </div>
                    </div>

                    {/* Tab 1: POS Terminal View */}
                    {activeTab === 'pos' && (
                        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface-container-lowest animate-fadeIn">
                            {/* Product Catalog Grid (8 cols) */}
                            <div className="lg:col-span-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <h3 className="font-semibold text-sm text-on-surface">Quick Sale Catalog</h3>
                                    </div>
                                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                                        Barcode Scanner Active
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { name: 'Golden Penny Flour 50kg', price: '₦48,500', stock: '24 bags', category: 'Grains' },
                                        { name: 'Dangote Refined Sugar 50kg', price: '₦62,000', stock: '18 bags', category: 'Sugar' },
                                        { name: 'Indomie Chicken Super 120g', price: '₦8,200', stock: '45 cartons', category: 'Noodles' },
                                        { name: 'Peak Evaporated Milk 160g', price: '₦750', stock: '120 tins', category: 'Dairy' },
                                        { name: 'Devon King Vegetable Oil 5L', price: '₦14,800', stock: '32 pcs', category: 'Oil' },
                                        { name: 'Milo Refill Pack 1kg', price: '₦6,500', stock: '15 packs', category: 'Beverage' },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-lg border border-outline-variant bg-surface hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group"
                                        >
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">
                                                    {item.category}
                                                </span>
                                                <p className="text-xs font-semibold text-on-surface mt-1 group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.name}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-outline-variant/50">
                                                <span className="text-xs font-bold text-primary font-mono">{item.price}</span>
                                                <span className="text-[10px] text-on-surface-variant">{item.stock}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* POS Order Cart & Checkout (4 cols) */}
                            <div className="lg:col-span-4 bg-surface rounded-xl p-4 border border-outline-variant flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-on-surface tracking-wider">Active Cart</h4>
                                            <span className="text-[11px] text-on-surface-variant">Ticket #TXN-8842</span>
                                        </div>
                                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            3 items
                                        </span>
                                    </div>

                                    {/* Cart Line Items */}
                                    <div className="py-3 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-on-surface font-medium truncate max-w-[140px]">
                                                Golden Penny Flour 50kg (x1)
                                            </span>
                                            <span className="font-mono font-semibold text-on-surface">₦48,500</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-on-surface font-medium truncate max-w-[140px]">
                                                Indomie Super Pack (x2)
                                            </span>
                                            <span className="font-mono font-semibold text-on-surface">₦16,400</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-on-surface font-medium truncate max-w-[140px]">
                                                Peak Milk 160g (x6)
                                            </span>
                                            <span className="font-mono font-semibold text-on-surface">₦4,500</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary & Payment Methods */}
                                <div className="pt-3 border-t border-outline-variant space-y-3">
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between text-on-surface-variant">
                                            <span>Subtotal</span>
                                            <span className="font-mono">₦69,400</span>
                                        </div>
                                        <div className="flex justify-between text-on-surface-variant">
                                            <span>Tax (0%)</span>
                                            <span className="font-mono">₦0.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-on-surface pt-1 border-t border-outline-variant/60">
                                            <span>Total Amount</span>
                                            <span className="font-mono text-primary font-bold">₦69,400.00</span>
                                        </div>
                                    </div>

                                    {/* Payment Selector */}
                                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold text-center">
                                        <div className="py-1.5 bg-surface-container border border-outline-variant rounded text-on-surface cursor-pointer hover:bg-surface-container-high">
                                            💵 Cash
                                        </div>
                                        <div className="py-1.5 bg-surface-container border border-outline-variant rounded text-on-surface cursor-pointer hover:bg-surface-container-high">
                                            💳 Card
                                        </div>
                                        <div className="py-1.5 bg-primary/10 border border-primary text-primary rounded font-bold cursor-pointer">
                                            ⚡ Transfer
                                        </div>
                                    </div>

                                    <button className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                                        <ReceiptLong className="w-4 h-4" />
                                        <span>Charge & Print Receipt</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Analytics Dashboard View */}
                    {activeTab === 'analytics' && (
                        <div className="p-4 sm:p-6 space-y-6 bg-surface-container-lowest animate-fadeIn">
                            {/* Top Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                <div className="p-3.5 rounded-xl bg-surface border border-outline-variant">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-bold uppercase text-on-surface-variant">Today&apos;s Revenue</span>
                                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">+18.4%</span>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold font-mono text-on-surface">₦482,900</p>
                                    <span className="text-[10px] text-on-surface-variant">vs. ₦408,000 yesterday</span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-surface border border-outline-variant">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-bold uppercase text-on-surface-variant">Transactions</span>
                                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">+12%</span>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold font-mono text-on-surface">142 Sales</p>
                                    <span className="text-[10px] text-on-surface-variant">Avg ticket ₦3,400</span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-surface border border-outline-variant">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-bold uppercase text-on-surface-variant">Gross Profit</span>
                                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-bold">28.4%</span>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold font-mono text-primary">₦137,140</p>
                                    <span className="text-[10px] text-on-surface-variant">Net after ₦24,500 expenses</span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-surface border border-outline-variant">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-bold uppercase text-on-surface-variant">Stock Health</span>
                                        <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">3 Low</span>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold font-mono text-on-surface">98.2%</p>
                                    <span className="text-[10px] text-on-surface-variant">418 items tracked</span>
                                </div>
                            </div>

                            {/* Chart Bar Mockup */}
                            <div className="p-4 rounded-xl bg-surface border border-outline-variant">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-on-surface">Weekly Sales Trend (₦)</h4>
                                        <span className="text-[11px] text-on-surface-variant">Real-time revenue synchronization</span>
                                    </div>
                                    <span className="text-xs font-mono text-primary font-bold">Total: ₦3,420,500</span>
                                </div>
                                <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2">
                                    {[
                                        { day: 'Mon', height: '45%', val: '₦410k' },
                                        { day: 'Tue', height: '60%', val: '₦520k' },
                                        { day: 'Wed', height: '52%', val: '₦480k' },
                                        { day: 'Thu', height: '75%', val: '₦680k' },
                                        { day: 'Fri', height: '90%', val: '₦810k', active: true },
                                        { day: 'Sat', height: '65%', val: '₦590k' },
                                        { day: 'Sun', height: '35%', val: '₦310k' },
                                    ].map((col, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                                            <span className="text-[9px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                                                {col.val}
                                            </span>
                                            <div
                                                style={{ height: col.height }}
                                                className={`w-full max-w-[36px] rounded-t transition-all ${
                                                    col.active ? 'bg-primary shadow-sm' : 'bg-primary/30 hover:bg-primary/50'
                                                }`}
                                            />
                                            <span className="text-[10px] font-medium text-on-surface-variant">{col.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Smart Inventory View */}
                    {activeTab === 'inventory' && (
                        <div className="p-4 sm:p-6 space-y-4 bg-surface-container-lowest animate-fadeIn">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Live Inventory Register</h4>
                                    <span className="text-[11px] text-on-surface-variant">Automated stock counts and reorder triggers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-on-surface-variant bg-surface px-2.5 py-1 rounded border border-outline-variant">
                                        Filter: All Categories
                                    </span>
                                </div>
                            </div>

                            <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-semibold">
                                        <tr>
                                            <th className="p-3">Product Name & SKU</th>
                                            <th className="p-3">Category</th>
                                            <th className="p-3">Unit Cost</th>
                                            <th className="p-3">Retail Price</th>
                                            <th className="p-3">Current Stock</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/60">
                                        {[
                                            { name: 'Golden Penny Flour 50kg', sku: 'SKU-GPF-50', cat: 'Grains', cost: '₦43,000', price: '₦48,500', stock: 24, min: 10, status: 'In Stock' },
                                            { name: 'Dangote Sugar 50kg', sku: 'SKU-DS-50', cat: 'Sugar', cost: '₦56,500', price: '₦62,000', stock: 4, min: 8, status: 'Low Stock' },
                                            { name: 'Indomie Chicken Super 120g', sku: 'SKU-IND-120', cat: 'Noodles', cost: '₦7,100', price: '₦8,200', stock: 45, min: 15, status: 'In Stock' },
                                            { name: 'Devon King Veg Oil 5L', sku: 'SKU-DK-5L', cat: 'Oil', cost: '₦12,800', price: '₦14,800', stock: 2, min: 10, status: 'Critically Low' },
                                        ].map((row, idx) => (
                                            <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                                <td className="p-3">
                                                    <p className="font-semibold text-on-surface">{row.name}</p>
                                                    <span className="text-[10px] font-mono text-on-surface-variant">{row.sku}</span>
                                                </td>
                                                <td className="p-3 text-on-surface-variant">{row.cat}</td>
                                                <td className="p-3 font-mono">{row.cost}</td>
                                                <td className="p-3 font-mono font-semibold text-primary">{row.price}</td>
                                                <td className="p-3 font-mono font-bold">{row.stock} units</td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            row.status === 'In Stock'
                                                                ? 'bg-primary/10 text-primary'
                                                                : row.status === 'Low Stock'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-error/10 text-error'
                                                        }`}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
