'use client';

import React from 'react';
import Link from 'next/link';
import { Store } from 'google-material-icons/filled';

export default function Footer() {
    return (
        <footer className="bg-surface-container-lowest border-t border-outline-variant pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-outline-variant/60">
                    {/* Brand Column (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-sm">
                                <Store className="text-on-primary w-4 h-4" />
                            </div>
                            <span className="text-xl font-bold text-on-surface tracking-tight">
                                Business<span className="text-primary">Hub</span>
                            </span>
                        </Link>

                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-sm">
                            The all-in-one smart POS, real-time inventory, expense tracking, and multi-branch management platform built for modern retail & wholesale commerce.
                        </p>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-[11px] font-medium text-on-surface-variant border border-outline-variant">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span>System Status: All Systems Operational</span>
                        </div>
                    </div>

                    {/* Links: Product */}
                    <div className="space-y-3 text-xs sm:text-sm">
                        <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                            Product
                        </h4>
                        <ul className="space-y-2 text-on-surface-variant">
                            <li>
                                <Link href="#features" className="hover:text-primary transition-colors">
                                    Point of Sale (POS)
                                </Link>
                            </li>
                            <li>
                                <Link href="#features" className="hover:text-primary transition-colors">
                                    Real-time Inventory
                                </Link>
                            </li>
                            <li>
                                <Link href="#features" className="hover:text-primary transition-colors">
                                    Expense & Profit Tracking
                                </Link>
                            </li>
                            <li>
                                <Link href="#features" className="hover:text-primary transition-colors">
                                    Customer & Debt Ledger
                                </Link>
                            </li>
                            <li>
                                <Link href="#features" className="hover:text-primary transition-colors">
                                    Multi-Branch Control
                                </Link>
                            </li>
                            <li>
                                <Link href="#features" className="hover:text-primary transition-colors">
                                    Business Analytics
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links: Solutions */}
                    <div className="space-y-3 text-xs sm:text-sm">
                        <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                            Industries
                        </h4>
                        <ul className="space-y-2 text-on-surface-variant">
                            <li>
                                <span className="text-on-surface font-medium">Supermarkets & Marts</span>
                            </li>
                            <li>
                                <span className="text-on-surface font-medium">Pharmacies & Chemists</span>
                            </li>
                            <li>
                                <span className="text-on-surface font-medium">Boutiques & Apparel</span>
                            </li>
                            <li>
                                <span className="text-on-surface font-medium">Wholesale Provisions</span>
                            </li>
                            <li>
                                <span className="text-on-surface font-medium">Electronics & Hardware</span>
                            </li>
                        </ul>
                    </div>

                    {/* Links: Company & Support */}
                    <div className="space-y-3 text-xs sm:text-sm">
                        <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                            Support & Access
                        </h4>
                        <ul className="space-y-2 text-on-surface-variant">
                            <li>
                                <Link href="/login" className="hover:text-primary transition-colors">
                                    Log In to Store
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-primary transition-colors">
                                    Create New Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="hover:text-primary transition-colors">
                                    Help & Support
                                </Link>
                            </li>
                            <li>
                                <Link href="#faq" className="hover:text-primary transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="#get-started" className="hover:text-primary transition-colors">
                                    Early Access (Free)
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
                    <p>© {new Date().getFullYear()} BusinessHub NG. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-primary cursor-pointer">Terms of Service</span>
                        <span className="hover:text-primary cursor-pointer">Security</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
