"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Notifications,
  Close,
  Warning,
  Receipt,
  TrendingUp,
  DeleteOutline,
  DoneAll,
  ArrowForward,
  Info,
} from "google-material-icons/outlined";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "stock" | "sale" | "expense" | "system";
  read: boolean;
  link: string;
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "stock" | "sale" | "expense">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getReadIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("readNotifIds") || "[]");
    } catch {
      return [];
    }
  };

  const getDismissedIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("dismissedNotifIds") || "[]");
    } catch {
      return [];
    }
  };

  const saveReadIds = (ids: string[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("readNotifIds", JSON.stringify(ids));
    }
  };

  const saveDismissedIds = (ids: string[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dismissedNotifIds", JSON.stringify(ids));
    }
  };

  // Fetch real notifications directly from DB
  const fetchLiveAlerts = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const readIds = new Set(getReadIds());
      const dismissedIds = new Set(getDismissedIds());

      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            query GetLiveAlerts {
              products {
                id
                name
                stockLevel {
                  initialQuantity
                  lowStockThreshold
                }
              }
              transactions {
                id
                receiptNumber
                grandTotal
                paymentStatus
                createdAt
              }
              expenses {
                id
                description
                amount
                status
                createdAt
              }
            }
          `,
        }),
      });

      const result = await res.json();
      const loadedNotifs: NotificationItem[] = [];

      // 1. Low stock alerts from DB
      if (result.data?.products) {
        result.data.products.forEach((p: any) => {
          const id = `stock-${p.id}`;
          if (dismissedIds.has(id)) return;
          const qty = p.stockLevel?.initialQuantity ?? 0;
          const threshold = p.stockLevel?.lowStockThreshold ?? 5;
          if (qty <= threshold) {
            loadedNotifs.push({
              id,
              title: "Low Stock Alert",
              message: `"${p.name}" has only ${qty} units remaining in inventory.`,
              time: "Just now",
              type: "stock",
              read: readIds.has(id),
              link: "/inventory",
            });
          }
        });
      }

      // 2. Recent sales from DB
      if (result.data?.transactions) {
        result.data.transactions.slice(0, 5).forEach((t: any) => {
          const id = `sale-${t.id}`;
          if (dismissedIds.has(id)) return;
          loadedNotifs.push({
            id,
            title: "POS Sale Recorded",
            message: `Sale ${t.receiptNumber} for ₦ ${t.grandTotal?.toLocaleString()} (${t.paymentStatus}).`,
            time: new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "sale",
            read: readIds.has(id),
            link: "/reports",
          });
        });
      }

      // 3. Pending expenses from DB
      if (result.data?.expenses) {
        result.data.expenses.forEach((e: any) => {
          const id = `exp-${e.id}`;
          if (dismissedIds.has(id)) return;
          if (e.status === "Pending") {
            loadedNotifs.push({
              id,
              title: "Expense Pending Approval",
              message: `${e.description} (₦ ${e.amount?.toLocaleString()}) requires approval.`,
              time: "Pending",
              type: "expense",
              read: readIds.has(id),
              link: "/expenses",
            });
          }
        });
      }

      setNotifications(loadedNotifs);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchLiveAlerts();
  }, [fetchLiveAlerts]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      fetchLiveAlerts();
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const readIds = Array.from(new Set([...getReadIds(), ...updated.map((n) => n.id)]));
      saveReadIds(readIds);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => {
      const dismissedIds = Array.from(new Set([...getDismissedIds(), ...prev.map((n) => n.id)]));
      saveDismissedIds(dismissedIds);
      return [];
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      const readIds = Array.from(new Set([...getReadIds(), id]));
      saveReadIds(readIds);
      return updated;
    });
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      const dismissedIds = Array.from(new Set([...getDismissedIds(), id]));
      saveDismissedIds(dismissedIds);
      return updated;
    });
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    router.push(item.link);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <Warning className="w-4 h-4 text-amber-600" />;
      case "sale":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "expense":
        return <Receipt className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "stock":
        return "bg-amber-100/80 border border-amber-200";
      case "sale":
        return "bg-emerald-100/80 border border-emerald-200";
      case "expense":
        return "bg-purple-100/80 border border-purple-200";
      default:
        return "bg-blue-100/80 border border-blue-200";
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="View notifications"
        className={`p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative cursor-pointer ${
          isOpen ? "bg-surface-container text-primary" : ""
        }`}
        title="Notifications"
      >
        <Notifications className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-extrabold rounded-full absolute -top-0.5 -right-0.5 flex items-center justify-center px-1 shadow-xs border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Modal - Deep solid white background with elevated shadow */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2.5 sm:w-96 bg-[#ffffff] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-slate-200 z-50 overflow-hidden font-sans antialiased animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Solid White Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#ffffff]">
            <div className="flex items-center gap-2">
              <h3 className="text-body-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  All Read
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <DoneAll className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="Clear all"
                >
                  <DeleteOutline className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                title="Close"
              >
                <Close className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold bg-slate-50/80">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filterType === "ALL"
                  ? "bg-[#005f37] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType("stock")}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filterType === "stock"
                  ? "bg-[#005f37] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Stock
            </button>
            <button
              onClick={() => setFilterType("sale")}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filterType === "sale"
                  ? "bg-[#005f37] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setFilterType("expense")}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filterType === "expense"
                  ? "bg-[#005f37] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 bg-[#ffffff]">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer group relative ${
                  !item.read ? "bg-emerald-50/25" : ""
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-xs truncate ${
                        !item.read ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => deleteNotification(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 absolute right-2.5 top-3.5 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                  title="Dismiss notification"
                >
                  <Close className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="p-8 text-center bg-[#ffffff]">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Notifications className="w-5 h-5" />
                </div>
                <p className="text-body-xs font-semibold text-slate-700">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Database alerts and updates will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Solid White Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-body-xs">
            <span className="text-slate-500 font-medium text-[11px]">Auto-synced with MongoDB</span>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/reports");
              }}
              className="text-[#005f37] hover:text-[#004e2d] font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All Reports</span>
              <ArrowForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
