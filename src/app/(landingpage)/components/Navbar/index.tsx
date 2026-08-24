'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Close, Store } from 'google-material-icons/filled';
import { Menu } from 'google-material-icons/outlined';
import PWAInstallButton from '@/src/components/PWAInstallButton';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 15);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled || mobileMenuOpen
                    ? 'bg-surface/90 dark:bg-surface/90 backdrop-blur-md border-b border-outline-variant/80 shadow-sm'
                    : 'bg-surface/70 backdrop-blur-sm border-b border-outline-variant/30'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                {/* Navbar Bar (fixed height h-16) */}
                <div className="h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center group-hover:bg-primary-container transition-colors shadow-sm">
                            <Store className="text-on-primary w-5 h-5" />
                        </div>
                        <span className="text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">
                            Business<span className="text-primary">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-7">
                        <Link
                            href="/"
                            className="text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="#features"
                            className="text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#use-cases"
                            className="text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                        >
                            Use Cases
                        </Link>
                        <Link
                            href="#benefits"
                            className="text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                        >
                            Why Us
                        </Link>
                        <Link
                            href="#faq"
                            className="text-body-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                        >
                            FAQ
                        </Link>
                    </div>

                    {/* Desktop Auth & Install Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <PWAInstallButton />
                        <Link
                            href="/login"
                            className="text-body-sm font-semibold text-primary hover:bg-surface-container-low transition-colors px-4 py-2 rounded-DEFAULT"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="text-body-sm font-semibold bg-primary hover:bg-primary-container text-on-primary transition-colors px-4 py-2 rounded-sm shadow-sm active:scale-[0.98]"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Header Actions: Install Icon + Menu Toggle */}
                    <div className="md:hidden flex items-center gap-1.5">
                        <PWAInstallButton iconOnly className="p-2" />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-DEFAULT transition-colors"
                            aria-label="Toggle Navigation Menu"
                        >
                            {mobileMenuOpen ? <Close className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Dropdown Menu (Full View with all links visible) */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-outline-variant bg-surface/95 backdrop-blur-xl max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-5 shadow-2xl animate-fadeIn">
                    <div className="flex flex-col space-y-1">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2.5 text-sm font-semibold text-on-surface hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2.5 text-sm font-semibold text-on-surface hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2.5 text-sm font-semibold text-on-surface hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#use-cases"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2.5 text-sm font-semibold text-on-surface hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        >
                            Use Cases
                        </Link>
                        <Link
                            href="#benefits"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2.5 text-sm font-semibold text-on-surface hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        >
                            Why Us
                        </Link>
                        <Link
                            href="#faq"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2.5 text-sm font-semibold text-on-surface hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                        >
                            FAQ
                        </Link>
                    </div>

                    <div className="pt-5 mt-3 border-t border-outline-variant/60 flex flex-col gap-2.5">
                        <PWAInstallButton className="w-full justify-center py-2.5 text-sm" />
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-center text-sm font-semibold text-primary bg-surface-container hover:bg-surface-container-high px-4 py-2.5 rounded-lg transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-center text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container px-4 py-2.5 rounded-lg shadow-sm transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;