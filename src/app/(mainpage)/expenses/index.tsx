"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Add,
  CalendarToday,
  Close,
  CreditCard,
  Delete,
  Download,
  Edit,
  FilterList,
  MenuBook,
  MoreVert,
  PieChart,
  Receipt,
  ReceiptLong,
  TrendingUp,
} from "google-material-icons/outlined";

export interface ExpenseItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  dateOfExpense: string;
  paymentMethod?: string;
  status: "Approved" | "Pending" | "Rejected";
}

const CATEGORY_BADGES: Record<string, string> = {
  Rent: "bg-blue-50 text-blue-700 border border-blue-200/70",
  Utilities: "bg-indigo-50 text-indigo-700 border border-indigo-200/70",
  Miscellaneous: "bg-slate-100 text-slate-700 border border-slate-200",
  Salaries: "bg-purple-50 text-purple-700 border border-purple-200/70",
  Marketing: "bg-pink-50 text-pink-700 border border-pink-200/70",
  Operations: "bg-amber-50 text-amber-700 border border-amber-200/70",
};

const formatDate = (isoDate: string) => {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

export default function ExpensesPageContent() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("30");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [formData, setFormData] = useState<{
    description: string;
    category: string;
    amount: number;
    dateOfExpense: string;
    paymentMethod: string;
    status: "Approved" | "Pending" | "Rejected";
  }>({
    description: "",
    category: "Miscellaneous",
    amount: 0,
    dateOfExpense: new Date().toISOString().split("T")[0],
    paymentMethod: "BANK_TRANSFER",
    status: "Approved",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch expenses from GraphQL backend
  const fetchExpenses = useCallback(async () => {
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
            query GetExpenses {
              expenses {
                id
                category
                amount
                dateOfExpense
                paymentMethod
                description
                status
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.expenses) {
        setExpenses(
          result.data.expenses.map((e: any) => ({
            id: e.id,
            description: e.description || "Expense",
            category: e.category || "Miscellaneous",
            amount: typeof e.amount === "number" ? e.amount : 0,
            dateOfExpense: e.dateOfExpense ? e.dateOfExpense.split("T")[0] : new Date().toISOString().split("T")[0],
            paymentMethod: e.paymentMethod || "CASH",
            status: e.status === "Pending" ? "Pending" : e.status === "Rejected" ? "Rejected" : "Approved",
          }))
        );
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error("Failed to load expenses", err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Derived Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Category
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [expenses, categoryFilter]);

  // Dynamic Metrics computation from DB
  const metrics = useMemo(() => {
    const totalMonth = expenses
      .filter((e) => e.status === "Approved")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const pendingList = expenses.filter((e) => e.status === "Pending");
    const pendingCount = pendingList.length;
    const pendingTotal = pendingList.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Calculate top category by spend
    const categoryTotals: Record<string, number> = {};
    for (const exp of expenses) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + (exp.amount || 0);
    }

    let topCategory = "N/A";
    let topCategoryAmount = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    }

    const totalAll = Object.values(categoryTotals).reduce((sum, a) => sum + a, 0);
    const topCategoryPercent = totalAll > 0 ? Math.round((topCategoryAmount / totalAll) * 100) : 0;

    return {
      totalMonth,
      pendingCount,
      pendingTotal,
      topCategory,
      topCategoryPercent,
    };
  }, [expenses]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      description: "",
      category: "Miscellaneous",
      amount: 0,
      dateOfExpense: new Date().toISOString().split("T")[0],
      paymentMethod: "BANK_TRANSFER",
      status: "Approved",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ExpenseItem) => {
    setEditingExpense(item);
    setFormData({
      description: item.description,
      category: item.category,
      amount: item.amount,
      dateOfExpense: item.dateOfExpense,
      paymentMethod: item.paymentMethod || "BANK_TRANSFER",
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (editingExpense?.id && !editingExpense.id.startsWith("exp-")) {
        // Update in DB
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
                updateExpense(id: $id, input: $input) {
                  id
                  category
                  amount
                  dateOfExpense
                  description
                  status
                }
              }
            `,
            variables: {
              id: editingExpense.id,
              input: {
                description: formData.description.trim(),
                category: formData.category,
                amount: Number(formData.amount),
                dateOfExpense: formData.dateOfExpense,
                status: formData.status,
              },
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to update expense");
        }
      } else if (!editingExpense) {
        // Create in DB
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation CreateExpense($input: CreateExpenseInput!) {
                createExpense(input: $input) {
                  id
                  category
                  amount
                  dateOfExpense
                  description
                  status
                }
              }
            `,
            variables: {
              input: {
                description: formData.description.trim(),
                category: formData.category,
                amount: Number(formData.amount),
                dateOfExpense: formData.dateOfExpense,
                status: formData.status,
              },
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to log expense");
        }
      }

      // Local optimistic update
      if (editingExpense) {
        setExpenses((prev) =>
          prev.map((item) =>
            item.id === editingExpense.id
              ? {
                  ...item,
                  ...formData,
                  id: editingExpense.id,
                }
              : item
          )
        );
        setFeedback({ type: "success", message: `Expense updated successfully!` });
      } else {
        const newExp: ExpenseItem = {
          ...formData,
          id: `exp-${Date.now()}`,
        };
        setExpenses((prev) => [newExp, ...prev]);
        setFeedback({ type: "success", message: `Expense recorded successfully!` });
      }

      setIsModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string, desc: string) => {
    if (!confirm(`Are you sure you want to delete "${desc}"?`)) return;

    try {
      if (!id.startsWith("exp-")) {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation DeleteExpense($id: ID!) {
                deleteExpense(id: $id)
              }
            `,
            variables: { id },
          }),
        });
      }

      setExpenses((prev) => prev.filter((item) => item.id !== id));
      setFeedback({ type: "success", message: `Expense deleted.` });
      fetchExpenses();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete expense." });
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Date,Description,Category,Amount,Status"]
        .concat(
          filteredExpenses.map(
            (e) => `"${e.dateOfExpense}","${e.description}","${e.category}","${e.amount}","${e.status}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_export_${new Date().toISOString().split("T")[0]}.csv`);
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
            Expenses
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Manage and track company outgoing transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-4 py-2.5 rounded-DEFAULT text-body-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ReceiptLong className="w-4 h-4" />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-body-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75 cursor-pointer font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* 2. STAT METRIC CARDS (3 Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Total Expenses */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded tracking-wider">
              THIS MONTH
            </span>
          </div>
          <div>
            <p className="text-body-xs font-medium text-on-surface-variant">
              Total Expenses
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              ₦ {metrics.totalMonth.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <span>{expenses.length} records logged</span>
            </p>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <MenuBook className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded tracking-wider">
              REQUIRES ACTION
            </span>
          </div>
          <div>
            <p className="text-body-xs font-medium text-on-surface-variant">
              Pending Approvals
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              {metrics.pendingCount} Requests
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">
              Totaling ₦ {metrics.pendingTotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 3: Top Expense Category */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <PieChart className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded tracking-wider">
              YTD
            </span>
          </div>
          <div>
            <p className="text-body-xs font-medium text-on-surface-variant">
              Top Expense Category
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              {metrics.topCategory}
            </p>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${metrics.topCategoryPercent}%` }} />
            </div>
            <p className="text-xs font-medium text-on-surface-variant mt-1.5">
              {metrics.topCategoryPercent}% of total spend
            </p>
          </div>
        </div>

      </div>

      {/* 3. RECENT EXPENSES SECTION */}
      <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl shadow-2xs overflow-hidden">
        
        {/* Section Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-on-surface">
            Recent Expenses
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Selector */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-3 pr-8 py-1.5 text-body-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
              >
                <option value="30">Last 30 Days 📅</option>
                <option value="7">Last 7 Days 📅</option>
                <option value="90">Last 90 Days 📅</option>
                <option value="ALL">All Time 📅</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-3 pr-8 py-1.5 text-body-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Miscellaneous">Miscellaneous</option>
                <option value="Salaries">Salaries</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="border border-outline-variant hover:bg-surface-container rounded-DEFAULT px-3 py-1.5 text-body-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 4. EXPENSES TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-xs">
            <thead>
              <tr className="border-b border-outline-variant/80 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/50">
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4 sm:px-6">Description</th>
                <th className="py-3.5 px-4 sm:px-6">Category</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Amount (₦)</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredExpenses.map((item) => {
                const isApproved = item.status === "Approved";
                const isPending = item.status === "Pending";
                const categoryStyle =
                  CATEGORY_BADGES[item.category] ||
                  "bg-slate-100 text-slate-700 border border-slate-200";

                return (
                  <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Date */}
                    <td className="py-4 px-4 sm:px-6 font-medium text-on-surface">
                      {formatDate(item.dateOfExpense)}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 sm:px-6 font-semibold text-on-surface">
                      {item.description}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${categoryStyle}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 sm:px-6 text-right font-bold text-on-surface">
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isApproved
                              ? "bg-emerald-600"
                              : isPending
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                        <span
                          className={`text-body-xs font-semibold ${
                            isApproved
                              ? "text-emerald-700"
                              : isPending
                              ? "text-amber-700"
                              : "text-rose-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1 text-on-surface-variant">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(item.id, item.description)}
                          className="p-1.5 hover:bg-rose-50 rounded text-on-surface-variant hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Expense"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-on-surface-variant text-body-sm">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION FOOTER */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-xs text-on-surface-variant">
          <div>
            Showing 1 to {filteredExpenses.length} of 24 entries
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto font-medium">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer"
            >
              &lt;
            </button>
            <button
              className="px-3 py-1.5 rounded bg-[#005f37] text-white font-bold transition-colors cursor-pointer"
            >
              1
            </button>
            <button
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              2
            </button>
            <button
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              3
            </button>
            <button
              className="px-2.5 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Log / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-lowest rounded-xl border border-outline-variant w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">
                {editingExpense ? "Edit Expense Entry" : "Log New Expense"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-body-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Expense Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Office Rent"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Amount (₦) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="450000"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Date of Expense
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfExpense}
                    onChange={(e) => setFormData({ ...formData, dateOfExpense: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Approval Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface font-semibold rounded-DEFAULT hover:bg-surface-container transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold rounded-DEFAULT transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingExpense ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
