"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CreditCard, TrendingUp } from "google-material-icons/filled";
import { AttachMoney, ShoppingBag, Warning, CheckCircle, ArrowForward, ReceiptLong, Inventory2 } from "google-material-icons/outlined";

interface SalesTrendItem {
  day: string;
  value: number;
  heightPercent: string;
  active: boolean;
}

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  count: number;
}

interface RecentTransactionItem {
  id: string;
  transactionId: string;
  date: string;
  customerName: string;
  status: string;
  amount: number;
  paymentMethod: string;
}

interface DashboardData {
  totalRevenue: number;
  totalRevenueFormatted: string;
  revenueGrowth: string;
  totalSales: number;
  salesGrowth: string;
  netProfit: number;
  netProfitFormatted: string;
  profitGrowth: string;
  totalExpenses: number;
  totalExpensesFormatted: string;
  expenseGrowth: string;
  weeklySalesTrend: SalesTrendItem[];
  lowStockItems: LowStockItem[];
  recentTransactions: RecentTransactionItem[];
}

const INITIAL_DASHBOARD: DashboardData = {
  totalRevenue: 0,
  totalRevenueFormatted: "₦0",
  revenueGrowth: "0%",
  totalSales: 0,
  salesGrowth: "0%",
  netProfit: 0,
  netProfitFormatted: "₦0",
  profitGrowth: "0%",
  totalExpenses: 0,
  totalExpensesFormatted: "₦0",
  expenseGrowth: "0%",
  weeklySalesTrend: [
    { day: "MON", value: 0, heightPercent: "5%", active: false },
    { day: "TUE", value: 0, heightPercent: "5%", active: false },
    { day: "WED", value: 0, heightPercent: "5%", active: false },
    { day: "THU", value: 0, heightPercent: "5%", active: false },
    { day: "FRI", value: 0, heightPercent: "5%", active: false },
    { day: "SAT", value: 0, heightPercent: "5%", active: false },
    { day: "SUN", value: 0, heightPercent: "5%", active: false },
  ],
  lowStockItems: [],
  recentTransactions: [],
};

export default function OverviewPage() {
  const [period, setPeriod] = useState<"TODAY" | "7D" | "30D">("TODAY");
  const [data, setData] = useState<DashboardData>(INITIAL_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Enterprise Admin");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalTxns = data.recentTransactions.length;
  const totalPages = Math.ceil(totalTxns / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = data.recentTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const startItem = totalTxns > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + ITEMS_PER_PAGE, totalTxns);

  const handlePeriodChange = (newPeriod: "TODAY" | "7D" | "30D") => {
    setPeriod(newPeriod);
    setCurrentPage(1);
  };

  const fetchDashboardMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            query GetDashboardMetrics($period: String) {
              dashboardMetrics(period: $period) {
                totalRevenue
                totalRevenueFormatted
                revenueGrowth
                totalSales
                salesGrowth
                netProfit
                netProfitFormatted
                profitGrowth
                totalExpenses
                totalExpensesFormatted
                expenseGrowth
                weeklySalesTrend {
                  day
                  value
                  heightPercent
                  active
                }
                lowStockItems {
                  id
                  name
                  sku
                  count
                }
                recentTransactions {
                  id
                  transactionId
                  date
                  customerName
                  status
                  amount
                  paymentMethod
                }
              }
            }
          `,
          variables: { period },
        }),
      });

      const result = await res.json();
      if (result.data?.dashboardMetrics) {
        setData(result.data.dashboardMetrics);
      }
    } catch {
      // Keep state
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardMetrics();

    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.fullName) setUserName(parsed.fullName);
          else if (parsed.name) setUserName(parsed.name);
          else if (parsed.email) setUserName(parsed.email.split("@")[0]);
        } catch {
          // ignore
        }
      }
    }
  }, [fetchDashboardMetrics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-on-surface font-bold">Overview</h1>
          <p className="text-body-sm text-on-surface-variant">
            Live database snapshot for {userName}
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="inline-flex items-center bg-surface-container border border-outline-variant rounded-DEFAULT p-1 text-body-sm font-medium">
          <button
            onClick={() => handlePeriodChange("TODAY")}
            className={`px-3 py-1 rounded-sm text-xs font-semibold transition cursor-pointer ${
              period === "TODAY"
                ? "bg-surface-lowest text-on-surface shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handlePeriodChange("7D")}
            className={`px-3 py-1 rounded-sm text-xs font-semibold transition cursor-pointer ${
              period === "7D"
                ? "bg-surface-lowest text-on-surface shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => handlePeriodChange("30D")}
            className={`px-3 py-1 rounded-sm text-xs font-semibold transition cursor-pointer ${
              period === "30D"
                ? "bg-surface-lowest text-on-surface shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            30D
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              TOTAL REVENUE
            </span>
            <div className="p-2 bg-primary-container/10 rounded-md">
              <AttachMoney className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface text-data-tabular">
              {data.totalRevenueFormatted || `₦${data.totalRevenue.toLocaleString()}`}
            </p>
            <p className="text-body-sm text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> {data.revenueGrowth}
            </p>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              TOTAL SALES
            </span>
            <div className="p-2 bg-secondary-container/20 rounded-md">
              <ShoppingBag className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface text-data-tabular">
              {data.totalSales.toLocaleString()}
            </p>
            <p className="text-body-sm text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> {data.salesGrowth}
            </p>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              NET PROFIT
            </span>
            <div className="p-2 bg-primary-container/10 rounded-md">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface text-data-tabular">
              {data.netProfitFormatted || `₦${data.netProfit.toLocaleString()}`}
            </p>
            <p className="text-body-sm text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> {data.profitGrowth}
            </p>
          </div>
        </div>

        {/* Card 4: Expenses */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              EXPENSES
            </span>
            <div className="p-2 bg-tertiary-container/20 rounded-md">
              <CreditCard className="w-4 h-4 text-tertiary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface text-data-tabular">
              {data.totalExpensesFormatted || `₦${data.totalExpenses.toLocaleString()}`}
            </p>
            <p className="text-body-sm text-tertiary font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> {data.expenseGrowth}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Sales Trend & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart Visual */}
        <div className="lg:col-span-2 bg-surface-lowest border border-outline-variant p-6 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Sales Trend</h2>
              <p className="text-body-sm text-on-surface-variant">
                Live database weekly revenue breakdown
              </p>
            </div>
            <Link
              href="/reports"
              className="text-body-xs font-bold text-primary hover:text-primary-container flex items-center gap-1"
            >
              <span>Full Reports</span>
              <ArrowForward className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bar Chart Graphics */}
          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-4">
            {data.weeklySalesTrend.map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    bar.active
                      ? "bg-[#005f37]"
                      : "bg-[#005f37]/25 hover:bg-[#005f37]/50"
                  }`}
                  style={{ height: bar.heightPercent }}
                />
                <span className="text-label-caps text-on-surface-variant font-bold">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Widget */}
        <div className={`bg-surface-lowest border p-6 rounded-xl shadow-2xs flex flex-col justify-between transition-all ${
          data.lowStockItems.length > 0 ? "border-amber-300 ring-1 ring-amber-200" : "border-outline-variant"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Warning className={`w-5 h-5 ${data.lowStockItems.length > 0 ? "text-amber-600 animate-pulse" : "text-amber-600"}`} />
                <h2 className="text-lg font-bold text-on-surface">Low Stock</h2>
                {data.lowStockItems.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                    {data.lowStockItems.length}
                  </span>
                )}
              </div>
              <Link
                href="/inventory"
                className="text-body-xs font-bold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {/* Low Stock Items List */}
            {data.lowStockItems.length > 0 ? (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {data.lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-low/60 border border-outline-variant p-3 rounded-lg flex items-center justify-between hover:border-amber-300 transition-colors"
                  >
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface truncate max-w-[160px]">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant font-mono">
                        {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.count === 0 ? (
                        <span className="text-[11px] text-rose-700 font-bold px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md inline-block">
                          Out of Stock (0)
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-800 font-bold px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md inline-block">
                          {item.count} Left
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-on-surface-variant space-y-2">
                <Inventory2 className="w-8 h-8 mx-auto text-on-surface-variant/40" />
                <p className="text-xs font-semibold">No low stock items</p>
                <p className="text-[11px]">All product inventory levels are healthy.</p>
              </div>
            )}
          </div>

          <Link
            href="/inventory"
            className="w-full mt-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-body-xs font-bold text-on-surface rounded-DEFAULT transition-colors flex items-center justify-center gap-1.5 shadow-2xs uppercase tracking-wider"
          >
            <span>MANAGE INVENTORY</span>
            <ArrowForward className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-surface-lowest border border-outline-variant rounded-xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              Recent Transactions
            </h2>
            <p className="text-body-xs text-on-surface-variant">Latest recorded customer checkouts from database</p>
          </div>
          <Link
            href="/reports"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Ledger</span>
            <ArrowForward className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-xs">
            <thead>
              <tr className="border-b border-outline-variant text-label-caps text-on-surface-variant bg-surface-container-low/50">
                <th className="py-3 px-4">TXN ID</th>
                <th className="py-3 px-4">DATE & TIME</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">METHOD</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AMOUNT (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                    {tx.transactionId}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-on-surface">
                    {tx.customerName}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" /> {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-on-surface">
                    ₦ {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              {data.recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-on-surface-variant text-body-sm space-y-1">
                    <ReceiptLong className="w-8 h-8 mx-auto text-on-surface-variant/40 mb-1" />
                    <p className="font-semibold text-on-surface">No transactions recorded yet</p>
                    <p className="text-xs">Completed POS sales and payments will appear here in real time.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        {totalTxns > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-outline-variant/60 text-body-xs text-on-surface-variant">
            <span>
              Showing <span className="font-bold text-on-surface">{startItem}</span> to{" "}
              <span className="font-bold text-on-surface">{endItem}</span> of{" "}
              <span className="font-bold text-on-surface">{totalTxns}</span> transactions
            </span>

            <div className="flex items-center gap-2 font-medium">
              <span className="text-xs text-on-surface-variant mr-1">
                Page <span className="font-bold text-on-surface">{currentPage}</span> of{" "}
                <span className="font-bold text-on-surface">{totalPages}</span>
              </span>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}