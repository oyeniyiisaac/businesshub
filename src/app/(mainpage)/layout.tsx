'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    BarChart,
    ChevronLeft,
    Dashboard,
    Help,
    HelpCenter,
    LocalShipping,
    Logout,
    Notifications,
    Menu,
    Close,
    People,
    Person,
    PlusOne,
    Receipt,
    Search,
    Settings,
    Shield,
    ShoppingCart,
    Store,
    Storefront,
} from 'google-material-icons/outlined';
import { PermissionsProvider, usePermissions } from '@/src/context/PermissionsContext';
import NotificationDropdown from '@/src/components/NotificationDropdown';

interface SidebarLinkItem {
    name: string;
    href: string;
    icon: any;
    moduleKey: string;
}

const allSidebarLinks: SidebarLinkItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Dashboard, moduleKey: 'dashboard' },
    { name: 'Inventory', href: '/inventory', icon: Storefront, moduleKey: 'inventory' },
    { name: 'POS', href: '/pos', icon: ShoppingCart, moduleKey: 'pos' },
    { name: 'Customers', href: '/customers', icon: Person, moduleKey: 'customers' },
    { name: 'Suppliers', href: '/suppliers', icon: LocalShipping, moduleKey: 'suppliers' },
    { name: 'Expenses', href: '/expenses', icon: Receipt, moduleKey: 'expenses' },
    { name: 'Reports', href: '/reports', icon: BarChart, moduleKey: 'reports' },
    { name: 'Staff', href: '/staff', icon: People, moduleKey: 'settings' },
    { name: 'Settings', href: '/settings', icon: Settings, moduleKey: 'settings' },
];

const checkRouteAccess = (
    pathname: string,
    canView: (mod: string) => boolean,
    canCreate: (mod: string) => boolean,
    isOwner: boolean
): { allowed: boolean; moduleName: string; requiredAction: string } => {
    if (isOwner) return { allowed: true, moduleName: '', requiredAction: '' };

    const cleanPath = pathname.split('?')[0].toLowerCase();

    // 1. Inventory Add Product requires 'create' on inventory
    if (cleanPath.startsWith('/inventory/addproduct')) {
        const allowed = canCreate('inventory');
        return { allowed, moduleName: 'Add Product', requiredAction: 'create inventory products' };
    }

    // 2. Inventory module
    if (cleanPath.startsWith('/inventory')) {
        const allowed = canView('inventory');
        return { allowed, moduleName: 'Inventory', requiredAction: 'access the Inventory module' };
    }

    // 3. POS module
    if (cleanPath.startsWith('/pos')) {
        const allowed = canView('pos');
        return { allowed, moduleName: 'POS', requiredAction: 'access Point of Sale' };
    }

    // 4. Customers module
    if (cleanPath.startsWith('/customers')) {
        const allowed = canView('customers');
        return { allowed, moduleName: 'Customers', requiredAction: 'access Customers' };
    }

    // 5. Suppliers module
    if (cleanPath.startsWith('/suppliers')) {
        const allowed = canView('suppliers');
        return { allowed, moduleName: 'Suppliers', requiredAction: 'access Suppliers' };
    }

    // 6. Expenses module
    if (cleanPath.startsWith('/expenses')) {
        const allowed = canView('expenses');
        return { allowed, moduleName: 'Expenses', requiredAction: 'access Expenses' };
    }

    // 7. Reports module
    if (cleanPath.startsWith('/reports')) {
        const allowed = canView('reports');
        return { allowed, moduleName: 'Reports', requiredAction: 'access Reports' };
    }

    // 8. Staff / Team module (governed under settings module)
    if (cleanPath.startsWith('/staff')) {
        const allowed = canView('settings');
        return { allowed, moduleName: 'Staff & Team', requiredAction: 'manage staff and team settings' };
    }

    // 9. Settings module
    if (cleanPath.startsWith('/settings')) {
        const allowed = canView('settings');
        return { allowed, moduleName: 'Settings', requiredAction: 'access Settings' };
    }

    // 10. Dashboard module
    if (cleanPath.startsWith('/dashboard')) {
        const allowed = canView('dashboard');
        return { allowed, moduleName: 'Dashboard', requiredAction: 'access the Dashboard' };
    }

    return { allowed: true, moduleName: '', requiredAction: '' };
};

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { userRole, isOwner, canView, canCreate } = usePermissions();
    const [userName, setUserName] = useState<string>('User');
    const [userEmail, setUserEmail] = useState<string>('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.fullName) setUserName(parsed.fullName);
                    else if (parsed.name) setUserName(parsed.name);
                    if (parsed.email) setUserEmail(parsed.email);
                } catch {
                    // Ignore parse error
                }
            }
        }
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
            localStorage.removeItem('userPermissions');
            sessionStorage.clear();
        }
        router.push('/login');
    };

    // Filter sidebar links based on allowed modules for this role
    const visibleSidebarLinks = allSidebarLinks.filter((item) => canView(item.moduleKey));

    // Check if the current route is allowed for the logged in role
    const routeCheck = checkRouteAccess(pathname, canView, canCreate, isOwner);

    // Determine first permitted route for easy fallback navigation
    const getFirstAllowedRoute = () => {
        if (canView('dashboard')) return { href: '/dashboard', name: 'Dashboard' };
        if (canView('pos')) return { href: '/pos', name: 'POS' };
        if (canView('inventory')) return { href: '/inventory', name: 'Inventory' };
        if (canView('customers')) return { href: '/customers', name: 'Customers' };
        if (canView('suppliers')) return { href: '/suppliers', name: 'Suppliers' };
        if (canView('expenses')) return { href: '/expenses', name: 'Expenses' };
        if (canView('reports')) return { href: '/reports', name: 'Reports' };
        if (canView('settings')) return { href: '/settings', name: 'Settings' };
        return { href: '/dashboard', name: 'Dashboard' };
    };

    const firstAllowedRoute = getFirstAllowedRoute();

    return (
        <div className="min-h-screen bg-surface flex font-sans antialiased relative">
            {/* Mobile Backdrop Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
                />
            )}

            {/* 1. FULL HEIGHT SIDEBAR */}
            <aside
                onClick={() => collapsed && setCollapsed(false)}
                className={`bg-secondary text-on-secondary transition-all duration-300 ease-in-out flex flex-col justify-between h-screen fixed inset-y-0 left-0 z-50 md:sticky md:top-0 shrink-0 select-none ${
                    isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
                } ${collapsed ? 'md:w-20 cursor-pointer hover:bg-secondary/90' : 'md:w-64'}`}
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
                                        {userRole.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Close Button / Desktop Collapse Toggle Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    setIsMobileOpen(false);
                                } else {
                                    setCollapsed(!collapsed);
                                }
                            }}
                            className="p-1.5 rounded-md bg-secondary-fixed-variant/40 hover:bg-secondary-fixed-variant text-on-primary transition-colors shrink-0 cursor-pointer"
                            title={collapsed ? "Expand Sidebar" : "Close Sidebar"}
                        >
                            <span className="md:hidden"><Close className="w-4 h-4" /></span>
                            <span className="hidden md:inline">{!collapsed && <ChevronLeft className="w-4 h-4" />}</span>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1 mt-4">
                        {visibleSidebarLinks.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
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
                    <Link
                        href="/support"
                        onClick={() => setIsMobileOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-body-sm font-medium transition-colors ${
                            pathname === "/support"
                                ? "bg-primary text-on-primary font-semibold shadow-xs"
                                : "text-secondary-fixed hover:bg-secondary-fixed-variant/30 hover:text-on-secondary"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? "Support" : undefined}
                    >
                        <HelpCenter className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>SUPPORT</span>}
                    </Link>
                    <button
                        onClick={() => {
                            setIsMobileOpen(false);
                            handleLogout();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-body-sm font-medium text-secondary-fixed hover:bg-tertiary-container hover:text-on-tertiary transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''
                            }`}
                        title={collapsed ? 'Logout' : undefined}
                    >
                        <Logout className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>LOGOUT</span>}
                    </button>
                </div>
            </aside>

            {/* 2. RIGHT CONTAINER (HEADER + MAIN CONTENT) */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
                {/* Top Navbar */}
                <header className="bg-surface-lowest/80 backdrop-blur-md border-b border-outline-variant h-16 px-3 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-all gap-2 sm:gap-4">
                    {/* Left: Mobile Menu Toggle & Global Search */}
                    <div className="flex items-center gap-2.5 flex-1 max-w-xl min-w-0">
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container md:hidden transition-colors cursor-pointer shrink-0"
                            aria-label="Toggle Navigation Menu"
                        >
                            <Menu className="w-6 h-6 text-on-surface" />
                        </button>

                        <div className="relative w-full max-w-md min-w-0">
                            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search transactions, items..."
                                className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-9 pr-3 py-1.5 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all truncate"
                            />
                        </div>
                    </div>

                    {/* Header Right Actions */}
                    <div className="flex items-center gap-4">
                        {canView('reports') && (
                            <Link href="/reports" className="hidden sm:inline-flex text-body-sm font-semibold text-on-surface-variant hover:text-primary transition-colors px-2 py-1">
                                REPORTS
                            </Link>
                        )}

                        {canCreate('pos') ? (
                            <Link href="/pos" className="bg-primary hover:bg-primary-container text-on-primary text-body-sm font-medium px-2.5 sm:px-4 py-2 rounded-DEFAULT flex items-center gap-1.5 shadow-xs transition-colors shrink-0">
                                <PlusOne className="w-4 h-4" />
                                <span className="hidden sm:inline">NEW TRANSACTION</span>
                                <span className="sm:hidden text-xs font-bold">POS</span>
                            </Link>
                        ) : canCreate('inventory') ? (
                            <Link href="/inventory/addproduct" className="bg-primary hover:bg-primary-container text-on-primary text-body-sm font-medium px-2.5 sm:px-4 py-2 rounded-DEFAULT flex items-center gap-1.5 shadow-xs transition-colors shrink-0">
                                <PlusOne className="w-4 h-4" />
                                <span className="hidden sm:inline">ADD PRODUCT</span>
                                <span className="sm:hidden text-xs font-bold">ADD</span>
                            </Link>
                        ) : null}

                        <div className="h-6 w-px bg-outline-variant mx-1 hidden sm:block" />

                        <NotificationDropdown />

                        <Link
                            href="/support"
                            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors inline-flex items-center justify-center"
                            title="Help & Support"
                        >
                            <Help className="w-5 h-5" />
                        </Link>

                        {/* User Profile Menu */}
                        <div className="relative pl-2">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-left"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#005f37]/15 border border-[#005f37]/30 flex items-center justify-center text-[#005f37] font-bold text-xs">
                                    {userName ? userName.slice(0, 2).toUpperCase() : 'CU'}
                                </div>
                                <div className="hidden md:flex flex-col text-left">
                                    <span className="text-body-sm font-semibold text-on-surface leading-tight">
                                        {userName}
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant leading-tight capitalize font-medium">
                                        {userRole.toLowerCase().replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown Card */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                                        <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                        {userEmail && <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>}
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-[#005f37] text-[10px] font-extrabold rounded uppercase tracking-wider">
                                            {userRole.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {canView('settings') && (
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            <Settings className="w-4 h-4 text-slate-500" />
                                            <span>Business Settings</span>
                                        </Link>
                                    )}

                                    <Link
                                        href="/support"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <HelpCenter className="w-4 h-4 text-slate-500" />
                                        <span>Help & Support</span>
                                    </Link>

                                    <div className="border-t border-slate-100 my-1" />

                                    <button
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                    >
                                        <Logout className="w-4 h-4 text-rose-600" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-4 overflow-y-auto">
                    {routeCheck.allowed ? (
                        children
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-5">
                            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h2 className="text-2xl font-bold text-on-surface tracking-tight">
                                    Access Restricted
                                </h2>
                                <p className="text-body-sm text-on-surface-variant">
                                    Your role (<span className="font-semibold text-on-surface capitalize">{userRole.toLowerCase().replace(/_/g, ' ')}</span>) does not have permission to {routeCheck.requiredAction}.
                                </p>
                                <p className="text-body-xs text-on-surface-variant/80">
                                    If you require access to this section, please ask your business administrator to update your role permissions in Settings.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <Link
                                    href={firstAllowedRoute.href}
                                    className="bg-primary hover:bg-primary-container text-on-primary font-medium px-5 py-2.5 rounded-DEFAULT text-body-sm shadow-xs transition-colors"
                                >
                                    Go to {firstAllowedRoute.name}
                                </Link>
                                <button
                                    onClick={() => router.back()}
                                    className="border border-outline-variant hover:bg-surface-container text-on-surface font-medium px-5 py-2.5 rounded-DEFAULT text-body-sm transition-colors cursor-pointer"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionsProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </PermissionsProvider>
    );
}