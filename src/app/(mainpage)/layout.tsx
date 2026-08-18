'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart,
    ChevronLeft,
    ChevronRight,
    Dashboard,
    Help,
    HelpCenter,
    LocalShipping,
    Logout,
    Notifications,
    Person,
    PlusOne,
    Receipt,
    Search,
    Settings,
    ShoppingCart,
    Store,
    Storefront
} from 'google-material-icons/outlined';

const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Dashboard },
    { name: 'Inventory', href: '/inventory', icon: Storefront },
    { name: 'POS', href: '/pos', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Person },
    { name: 'Suppliers', href: '/suppliers', icon: LocalShipping },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Reports', href: '/reports', icon: BarChart },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-surface flex font-sans antialiased">
            {/* 1. FULL HEIGHT SIDEBAR (LEFT SIDE) */}
            <aside
                onClick={() => collapsed && setCollapsed(false)}
                className={`bg-secondary text-on-secondary transition-all duration-300 ease-in-out flex flex-col justify-between h-screen sticky top-0 z-50 shrink-0 select-none ${collapsed ? 'w-20 cursor-pointer hover:bg-secondary/90' : 'w-64'
                    }`}
            >
                {/* Top Section */}
                <div className="p-4">
                    {/* Header / Brand Logo */}
                    <div className={`flex items-center justify-between h-12 mb-4 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-md bg-primary-container flex items-center justify-center shrink-0 shadow-xs">
                                <Store className="w-5 h-5 text-on-primary" />
                            </div>
                            {!collapsed && (
                                <div className="whitespace-nowrap overflow-hidden">
                                    <h2 className="text-body-md font-bold leading-tight text-on-secondary">
                                        Business<span className="text-primary-fixed">Hub</span>
                                    </h2>
                                    <p className="text-[10px] tracking-wider text-secondary-fixed-dim uppercase">
                                        ENTERPRISE ADMIN
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Collapse Toggle Button - Only shown or repositioned appropriately */}
                        {!collapsed && (
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="p-1 rounded-md bg-secondary-fixed-variant/40 hover:bg-secondary-fixed-variant text-on-primary transition-colors shrink-0"
                                title="Collapse Sidebar"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        )}
                    </div>


                    {/* Navigation Links */}
                    <nav className="space-y-1 mt-4">
                        {sidebarLinks.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-body-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                                        : 'text-secondary-fixed hover:bg-secondary-fixed-variant/30 hover:text-on-secondary'
                                        } ${collapsed ? 'justify-center' : ''}`}
                                    title={collapsed ? item.name : undefined}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    {!collapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-secondary-fixed-variant/20 space-y-1">
                    <button
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-body-sm font-medium text-secondary-fixed hover:bg-secondary-fixed-variant/30 hover:text-on-secondary transition-colors ${collapsed ? 'justify-center' : ''
                            }`}
                        title={collapsed ? 'Support' : undefined}
                    >
                        <HelpCenter className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>SUPPORT</span>}
                    </button>
                    <button
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-body-sm font-medium text-secondary-fixed hover:bg-tertiary-container hover:text-on-tertiary transition-colors ${collapsed ? 'justify-center' : ''
                            }`}
                        title={collapsed ? 'Logout' : undefined}
                    >
                        <Logout className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>LOGOUT</span>}
                    </button>
                </div>
            </aside>

            {/* 2. RIGHT CONTAINER (HEADER + MAIN CONTENT) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="bg-surface-lowest/80 backdrop-blur-md border-b border-outline-variant h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-all">
                    {/* Global Search */}
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full max-w-md">
                            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search transactions, items..."
                                className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-9 pr-4 py-1.5 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Header Right Actions */}
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:inline-flex text-body-sm font-semibold text-on-surface-variant hover:text-primary transition-colors px-2 py-1">
                            BRANCHES
                        </button>
                        <button className="hidden sm:inline-flex text-body-sm font-semibold text-on-surface-variant hover:text-primary transition-colors px-2 py-1">
                            REPORTS
                        </button>

                        <button className="bg-primary hover:bg-primary-container text-on-primary text-body-sm font-medium px-4 py-2 rounded-DEFAULT flex items-center gap-1.5 shadow-xs transition-colors">
                            <PlusOne className="w-4 h-4" />
                            <span>NEW TRANSACTION</span>
                        </button>

                        <div className="h-6 w-px bg-outline-variant mx-1 hidden sm:block" />

                        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
                            <Notifications className="w-5 h-5" />
                            <span className="w-2 h-2 bg-tertiary rounded-full absolute top-1.5 right-1.5" />
                        </button>

                        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                            <Help className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 pl-2">
                            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
                                <Person className="w-4 h-4 text-on-surface-variant" />
                            </div>
                            <span className="text-body-sm font-medium text-on-surface hidden md:inline">
                                User
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-4 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}