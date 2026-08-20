"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  AccountBalance,
  CalendarMonth,
  CheckCircle,
  Close,
  CreditCard,
  Download,
  FilterList,
  HourglassEmpty,
  LocalAtm,
  Print,
  Receipt,
  ReceiptLong,
  Search,
  TrendingUp,
  Warning,
} from "google-material-icons/outlined";

export interface TransactionReportItem {
  id: string;
  transactionId: string;
  date: string;
  customerName: string;
  amount: number;
  paymentMethod: "POS" | "Transfer" | "Cash" | "Invoice";
  status: "Paid" | "Pending" | "Debt";
  transactionRef?: string;
  items?: any[];
}

const METHOD_ICONS: Record<string, string> = {
  POS: "💳 POS",
  CARD: "💳 POS",
  Transfer: "🏦 Transfer",
  TRANSFER: "🏦 Transfer",
  Cash: "💵 Cash",
  CASH: "💵 Cash",
  Invoice: "📄 Invoice",
  INVOICE: "📄 Invoice",
};

export default function ReportsPageContent() {
  const [transactions, setTransactions] = useState<TransactionReportItem[]>([]);
  const [dbMetrics, setDbMetrics] = useState<{
    totalRevenue: number;
    avgOrderValue: number;
    totalTransactions: number;
    pendingPayments: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState("THIS_MONTH");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Fetch Transactions and Metrics from GraphQL Backend
  const fetchReportData = useCallback(async () => {
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
            query GetReportsData {
              transactions {
                id
                receiptNumber
                customer {
                  name
                  phone
                }
                items {
                  name
                  quantity
                  price
                  subtotal
                }
                subtotal
                discountAmount
                vatAmount
                grandTotal
                paymentMethod
                paymentStatus
                transactionRef
                createdAt
              }
              transactionMetrics {
                totalRevenue
                avgOrderValue
                totalTransactions
                pendingPayments
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.transactions) {
        const loaded: TransactionReportItem[] = result.data.transactions.map((t: any) => {
          let mappedStatus: "Paid" | "Pending" | "Debt" = "Paid";
          if (t.paymentStatus === "PENDING") mappedStatus = "Pending";
          else if (t.paymentStatus === "CANCELLED" || t.paymentMethod === "INVOICE") mappedStatus = "Debt";

          let mappedMethod: "POS" | "Transfer" | "Cash" | "Invoice" = "POS";
          if (t.paymentMethod === "TRANSFER") mappedMethod = "Transfer";
          else if (t.paymentMethod === "CASH") mappedMethod = "Cash";
          else if (t.paymentMethod === "INVOICE") mappedMethod = "Invoice";

          return {
            id: t.id,
            transactionId: t.receiptNumber.startsWith("#") ? t.receiptNumber : `#${t.receiptNumber}`,
            date: new Date(t.createdAt).toLocaleString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            customerName: t.customer?.name || "Walk-in Customer",
            amount: t.grandTotal,
            paymentMethod: mappedMethod,
            status: mappedStatus,
            transactionRef: t.transactionRef,
            items: t.items,
          };
        });

        setTransactions(loaded);
      } else {
        setTransactions([]);
      }

      if (result.data?.transactionMetrics) {
        setDbMetrics(result.data.transactionMetrics);
      }
    } catch {
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Update Pending Transaction to Paid / Successful
  const handleUpdateStatus = async (id: string, newStatus: "SUCCESSFUL" | "PENDING") => {
    // 1. Optimistic UI update
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus === "SUCCESSFUL" ? "Paid" : "Pending" } : t))
    );

    // 2. Call GraphQL backend mutation
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            mutation UpdateTxStatus($id: ID!, $status: String!) {
              updateTransactionStatus(id: $id, status: $status) {
                id
                paymentStatus
              }
            }
          `,
          variables: { id, status: newStatus },
        }),
      });
      fetchReportData();
    } catch {
      // ignore
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return transactions.filter((t) => {
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchQuery =
        !q ||
        t.transactionId.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        (t.transactionRef && t.transactionRef.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Computed Dynamic Metrics
  const metrics = useMemo(() => {
    if (dbMetrics) {
      return {
        totalRevenue: dbMetrics.totalRevenue || 0,
        avgOrderValue: Math.round(dbMetrics.avgOrderValue || 0),
        transactionCount: dbMetrics.totalTransactions || transactions.length,
        pendingPayments: dbMetrics.pendingPayments || 0,
      };
    }

    const totalRev = transactions
      .filter((t) => t.status === "Paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const pending = transactions
      .filter((t) => t.status === "Pending")
      .reduce((sum, t) => sum + t.amount, 0);
    const count = transactions.length;
    const avgOrder = count > 0 ? Math.round(totalRev / count) : 0;

    return {
      totalRevenue: totalRev,
      avgOrderValue: avgOrder,
      transactionCount: count,
      pendingPayments: pending,
    };
  }, [transactions, dbMetrics]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Transaction ID,Date,Customer,Amount (NGN),Payment Method,Status,Reference"]
        .concat(
          filteredTransactions.map(
            (t) =>
              `"${t.transactionId}","${t.date}","${t.customerName}","${t.amount}","${t.paymentMethod}","${t.status}","${t.transactionRef || ""}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Sales Reports & Transaction History
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Real-time sales tracking, payment reconciliations, and financial analytics.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-lowest border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid (Successful)</option>
            <option value="Pending">Pending Settlements</option>
            <option value="Debt">Debt / Invoices</option>
          </select>

          {/* Period Selector */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-surface-lowest border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-2xs"
          >
            <option value="THIS_MONTH">This Month</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_QUARTER">This Quarter</option>
            <option value="THIS_YEAR">This Year</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="border border-outline-variant hover:bg-surface-container bg-surface-lowest rounded-DEFAULT px-3.5 py-2 text-body-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. STAT METRIC CARDS (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Revenue */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <p className="text-body-xs font-semibold text-on-surface-variant">
            Total Revenue
          </p>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              ₦ {metrics.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <span>From completed sales</span>
            </p>
          </div>
        </div>

        {/* Card 2: Avg Order Value */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <p className="text-body-xs font-semibold text-on-surface-variant">
            Avg Order Value
          </p>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              ₦ {metrics.avgOrderValue.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">
              Per recorded checkout
            </p>
          </div>
        </div>

        {/* Card 3: Transactions */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <p className="text-body-xs font-semibold text-on-surface-variant">
            Transactions
          </p>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {metrics.transactionCount}
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <span>{transactions.filter((t) => t.status === "Paid").length} settled</span>
            </p>
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <p className="text-body-xs font-semibold text-on-surface-variant">
            Pending Settlements
          </p>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
              ₦ {metrics.pendingPayments.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-amber-600 mt-1 flex items-center gap-1">
              <Warning className="w-3.5 h-3.5" />
              <span>{transactions.filter((t) => t.status === "Pending").length} pending orders</span>
            </p>
          </div>
        </div>

      </div>

      {/* 3. TRANSACTION HISTORY SECTION */}
      <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl shadow-2xs overflow-hidden">
        
        {/* Top Section Header & Search */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-on-surface">
              Transaction Ledger ({filteredTransactions.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, customer, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-9 pr-3.5 py-2 text-body-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-xs">
            <thead>
              <tr className="border-b border-outline-variant/80 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/50">
                <th className="py-3.5 px-4 sm:px-6">Transaction ID</th>
                <th className="py-3.5 px-4 sm:px-6">Date & Time</th>
                <th className="py-3.5 px-4 sm:px-6">Customer</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Amount</th>
                <th className="py-3.5 px-4 sm:px-6">Method</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredTransactions.map((trx) => {
                const isPaid = trx.status === "Paid";
                const isPending = trx.status === "Pending";
                const isDebt = trx.status === "Debt";

                return (
                  <tr key={trx.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Transaction ID */}
                    <td className="py-4 px-4 sm:px-6 font-semibold text-primary font-mono text-xs">
                      {trx.transactionId}
                      {trx.transactionRef && (
                        <span className="block text-[10px] text-on-surface-variant font-mono">
                          Ref: {trx.transactionRef}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 sm:px-6 text-on-surface-variant">
                      {trx.date}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 sm:px-6 font-bold text-on-surface">
                      {trx.customerName}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 sm:px-6 text-right font-bold text-on-surface">
                      <span className={isDebt ? "text-rose-700" : isPaid ? "text-emerald-800" : "text-amber-800"}>
                        ₦ {trx.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-4 px-4 sm:px-6 text-on-surface font-medium">
                      {METHOD_ICONS[trx.paymentMethod] || trx.paymentMethod}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : isPending
                            ? "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {isPaid && <CheckCircle className="w-3.5 h-3.5" />}
                        {isPending && <HourglassEmpty className="w-3.5 h-3.5" />}
                        <span>{trx.status}</span>
                      </span>
                    </td>

                    {/* Actions: Mark as Paid & View Receipt */}
                    <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(trx.id, "SUCCESSFUL")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs transition cursor-pointer"
                          title="Confirm settlement from bank or POS"
                        >
                          Mark Paid
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(trx)}
                        className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant rounded text-[11px] font-semibold transition cursor-pointer"
                        title="View & reprint transaction receipt"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant text-body-sm space-y-1">
                    <p className="font-semibold text-on-surface">No transactions found</p>
                    <p className="text-xs">Adjust your search or filter settings to view records.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/60 flex items-center justify-between text-body-xs text-on-surface-variant">
          <div>
            Showing 1 to {filteredTransactions.length} of {metrics.transactionCount} entries
          </div>

          <div className="flex items-center gap-1 font-medium">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* REPRINT RECEIPT SLIP MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm shadow-2xl overflow-hidden font-sans my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Slip Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-300" />
                <h3 className="text-sm font-bold">Transaction Slip</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-6 space-y-4 text-xs font-mono text-slate-800">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-black tracking-wider text-slate-900 uppercase">
                  BusinessHub Store
                </h2>
                <p className="text-[10px] text-slate-500 font-sans">
                  Plot 14, Admiralty Way, Lekki Phase 1, Lagos
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  POS Terminal #01 · Tel: +234 1 800 2843
                </p>
              </div>

              <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-bold">{selectedReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold">{selectedReceipt.customerName}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1 text-[11px] font-sans">
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
                  <span>AMOUNT PAID:</span>
                  <span className="text-[#005f37]">₦ {selectedReceipt.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px] font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-bold">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Settlement Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    selectedReceipt.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedReceipt.status}
                  </span>
                </div>
                {selectedReceipt.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono text-[10px]">{selectedReceipt.transactionRef}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-2 space-y-1">
                <div className="inline-block tracking-widest font-mono text-[10px] bg-slate-100 px-3 py-1 rounded border border-slate-300">
                  ||||| |||| |||||| |||| |||||
                </div>
                <p className="text-[10px] text-slate-500 font-sans">Verified System Record</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#005f37] hover:bg-[#004e2d] text-white rounded-DEFAULT text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Print className="w-4 h-4" />
                <span>Print Slip</span>
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-DEFAULT text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
