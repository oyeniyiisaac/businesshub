'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Close, Store } from 'google-material-icons/filled';
import { Menu } from 'google-material-icons/outlined';

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

    return (
        <nav
            className={`sticky top-0 z-50 w-full h-16 flex items-center transition-all duration-300 ${
                scrolled
                    ? 'bg-surface/80 dark:bg-surface/85 backdrop-blur-md border-b border-outline-variant/80 shadow-sm'
                    : 'bg-surface/60 backdrop-blur-sm border-b border-outline-variant/30'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                <div className="flex items-center justify-between">

                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
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

                    {/* Auth Actions */}
                    <div className="hidden md:flex items-center gap-3">
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

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-DEFAULT transition-colors"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <Close className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-surface/95 backdrop-blur-lg border border-outline-variant py-4 px-3 space-y-3 mt-2 rounded-xl shadow-xl animate-fadeIn">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded-DEFAULT"
                        >
                            Home
                        </Link>
                        <Link
                            href="#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded-DEFAULT"
                        >
                            Features
                        </Link>
                        <Link
                            href="#how-it-works"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded-DEFAULT"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#use-cases"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded-DEFAULT"
                        >
                            Use Cases
                        </Link>
                        <Link
                            href="#benefits"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded-DEFAULT"
                        >
                            Why Us
                        </Link>
                        <Link
                            href="#faq"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded-DEFAULT"
                        >
                            FAQ
                        </Link>

                        <div className="pt-4 border-t border-outline-variant flex flex-col gap-2">
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-center text-body-sm font-semibold text-primary bg-surface-container hover:bg-surface-container-high px-4 py-2 rounded-DEFAULT transition-colors"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-center text-body-sm font-semibold bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-DEFAULT transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;