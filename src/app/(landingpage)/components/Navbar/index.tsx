import { Store } from 'google-material-icons/filled'
import Link from 'next/link'
import React from 'react'

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md sticky top-0 z-50 w-full h-16 flex items-center border-b border-gray-100">
            <div className="max-w-screen-xl mx-auto px-4 md:px-8 w-full">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-[#00804b] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Store className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            Business<span className="text-[#00804b]">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-700 hover:text-[#00804b] transition-colors text-sm font-medium">
                            Home
                        </Link>
                        <Link href="#features" className="text-gray-700 hover:text-[#00804b] transition-colors text-sm font-medium">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-gray-700 hover:text-[#00804b] transition-colors text-sm font-medium">
                            Pricing
                        </Link>
                        <Link href="#contact" className="text-gray-700 hover:text-[#00804b] transition-colors text-sm font-medium">
                            Contact
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-[#00804b] hover:bg-green-50/50 transition-colors font-medium text-sm px-4 py-2 rounded-md"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="bg-[#00804b] hover:opacity-90 transition-opacity font-medium text-white text-sm px-4 py-2 rounded-md shadow-sm"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-gray-700 hover:text-[#00804b] transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar