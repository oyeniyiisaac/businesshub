"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Add,
  Close,
  CreditCard,
  Delete,
  Edit,
  Loyalty,
  MoreVert,
  People,
  Person,
  PersonAdd,
  Phone,
  Search,
  Star,
  TrendingUp,
  VerifiedUser,
} from "google-material-icons/outlined";

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "Inactive";
  totalPurchases: number;
  creditBalance: number;
  loyaltyPoints: number;
  loyaltyProgram?: boolean;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-purple-100 text-purple-800",
  "bg-teal-100 text-teal-800",
];

const getInitials = (name: string) => {
  if (!name) return "CU";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function CustomersPageContent() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [balanceFilter, setBalanceFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    status: "Active" | "Inactive";
    totalPurchases: number;
    creditBalance: number;
    loyaltyPoints: number;
  }>({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Active",
    totalPurchases: 0,
    creditBalance: 0,
    loyaltyPoints: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Customers from GraphQL backend
  const fetchCustomers = useCallback(async () => {
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
            query GetCustomers {
              customers {
                id
                name
                email
                phone
                address
                status
                totalPurchases
                loyaltyPoints
                creditBalance
                loyaltyProgram
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.customers) {
        setCustomers(
          result.data.customers.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email || "",
            phone: c.phone || "",
            address: c.address || "",
            status: c.status === "Inactive" ? "Inactive" : "Active",
            totalPurchases: typeof c.totalPurchases === "number" ? c.totalPurchases : 0,
            creditBalance: typeof c.creditBalance === "number" ? c.creditBalance : 0,
            loyaltyPoints: typeof c.loyaltyPoints === "number" ? c.loyaltyPoints : 0,
            loyaltyProgram: c.loyaltyProgram,
          }))
        );
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to load customers", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Derived Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.phone.includes(q) ||
        cust.email.toLowerCase().includes(q) ||
        cust.address.toLowerCase().includes(q);

      // Status
      const matchesStatus =
        statusFilter === "ALL" || cust.status.toUpperCase() === statusFilter;

      // Balance
      let matchesBalance = true;
      if (balanceFilter === "CREDIT") {
        matchesBalance = cust.creditBalance > 0;
      } else if (balanceFilter === "ZERO") {
        matchesBalance = cust.creditBalance === 0;
      }

      return matchesSearch && matchesStatus && matchesBalance;
    });
  }, [customers, searchQuery, statusFilter, balanceFilter]);

  // Metrics computation purely from database customers
  const metrics = useMemo(() => {
    const totalCount = customers.length;
    const activeCount = customers.filter((c) => c.status === "Active").length;
    const totalCredit = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
    const withCreditCount = customers.filter((c) => (c.creditBalance || 0) > 0).length;
    const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

    return {
      totalCustomers: totalCount,
      activeThisMonth: activeCount,
      totalCreditOwed: totalCredit,
      creditCustomerCount: withCreditCount,
      loyaltyPointsIssued: totalPoints,
      pointsValue: Math.round(totalPoints * 10),
    };
  }, [customers]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "Active",
      totalPurchases: 0,
      creditBalance: 0,
      loyaltyPoints: 50,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: CustomerItem) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      address: cust.address,
      status: cust.status,
      totalPurchases: cust.totalPurchases || 0,
      creditBalance: cust.creditBalance || 0,
      loyaltyPoints: cust.loyaltyPoints || 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const cleanEmail = formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@customer.local`;

      if (editingCustomer?.id && !editingCustomer.id.startsWith("cust-")) {
        // Update via GraphQL
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation UpdateCustomer(
                $id: ID!
                $name: String
                $phone: String
                $address: String
                $status: String
                $totalPurchases: Float
                $loyaltyPoints: Int
                $creditBalance: Float
              ) {
                updateCustomer(
                  id: $id
                  name: $name
                  phone: $phone
                  address: $address
                  status: $status
                  totalPurchases: $totalPurchases
                  loyaltyPoints: $loyaltyPoints
                  creditBalance: $creditBalance
                ) {
                  id
                  name
                  email
                  phone
                  address
                  status
                  totalPurchases
                  loyaltyPoints
                  creditBalance
                }
              }
            `,
            variables: {
              id: editingCustomer.id,
              name: formData.name.trim(),
              phone: formData.phone.trim(),
              address: formData.address.trim() || "Address not provided",
              status: formData.status,
              totalPurchases: Number(formData.totalPurchases) || 0,
              loyaltyPoints: Number(formData.loyaltyPoints) || 0,
              creditBalance: Number(formData.creditBalance) || 0,
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to update customer");
        }
      } else if (!editingCustomer) {
        // Create via GraphQL
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation AddCustomer(
                $name: String!
                $email: String!
                $phone: String!
                $address: String!
                $status: String
                $totalPurchases: Float
                $loyaltyPoints: Int
                $creditBalance: Float
              ) {
                addCustomer(
                  name: $name
                  email: $email
                  phone: $phone
                  address: $address
                  status: $status
                  totalPurchases: $totalPurchases
                  loyaltyPoints: $loyaltyPoints
                  creditBalance: $creditBalance
                ) {
                  id
                  name
                  email
                  phone
                  address
                  status
                  totalPurchases
                  loyaltyPoints
                  creditBalance
                }
              }
            `,
            variables: {
              name: formData.name.trim(),
              email: cleanEmail,
              phone: formData.phone.trim(),
              address: formData.address.trim() || "Address not provided",
              status: formData.status,
              totalPurchases: Number(formData.totalPurchases) || 0,
              loyaltyPoints: Number(formData.loyaltyPoints) || 0,
              creditBalance: Number(formData.creditBalance) || 0,
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to create customer");
        }
      }

      // Optimistic state update
      if (editingCustomer) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === editingCustomer.id
              ? {
                  ...c,
                  ...formData,
                  id: editingCustomer.id,
                }
              : c
          )
        );
        setFeedback({ type: "success", message: `Customer "${formData.name}" updated successfully!` });
      } else {
        const newCust: CustomerItem = {
          ...formData,
          email: cleanEmail,
          id: `cust-${Date.now()}`,
        };
        setCustomers((prev) => [newCust, ...prev]);
        setFeedback({ type: "success", message: `Customer "${formData.name}" registered successfully!` });
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save customer." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer record for "${name}"?`)) return;

    try {
      if (!id.startsWith("cust-")) {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation DeleteCustomer($id: ID!) {
                deleteCustomer(id: $id)
              }
            `,
            variables: { id },
          }),
        });
      }

      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setFeedback({ type: "success", message: `Customer "${name}" deleted.` });
      fetchCustomers();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete customer." });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Customers
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Manage client relationships and track balances.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-4 py-2.5 rounded-DEFAULT text-body-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PersonAdd className="w-4 h-4" />
          <span>New Customer</span>
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

      {/* 2. STAT METRIC CARDS (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Customers */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <People className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {metrics.totalCustomers.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <span>{metrics.totalCustomers > 0 ? `${metrics.activeThisMonth} active clients` : "No customers registered"}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Active This Month */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Active Clients
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <VerifiedUser className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {metrics.activeThisMonth.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">
              {metrics.totalCustomers > 0
                ? `${Math.round((metrics.activeThisMonth / metrics.totalCustomers) * 100)}% active rate`
                : "0% active rate"}
            </p>
          </div>
        </div>

        {/* Card 3: Total Credit Owed */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Total Credit Owed
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              ₦{metrics.totalCreditOwed.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-rose-600 mt-1">
              {metrics.creditCustomerCount > 0
                ? `Across ${metrics.creditCustomerCount} customer${metrics.creditCustomerCount === 1 ? "" : "s"}`
                : "No outstanding debt"}
            </p>
          </div>
        </div>

        {/* Card 4: Loyalty Points Issued */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Loyalty Points Issued
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {metrics.loyaltyPointsIssued.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">
              Valued at ₦{metrics.pointsValue.toLocaleString()}
            </p>
          </div>
        </div>

      </div>

      {/* 3. TABLE CARD WITH FILTER CONTROLS */}
      <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl shadow-2xs overflow-hidden">
        
        {/* Top Control Bar (Status, Balance, Search) */}
        <div className="p-4 sm:p-5 border-b border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-body-xs font-semibold text-on-surface">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3 py-1.5 text-body-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Balance Selector */}
            <div className="flex items-center gap-2">
              <span className="text-body-xs font-semibold text-on-surface">Balance</span>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
                className="bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3 py-1.5 text-body-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="ALL">All Types</option>
                <option value="CREDIT">Has Credit (Debt)</option>
                <option value="ZERO">Zero Balance</option>
              </select>
            </div>
          </div>

          {/* Right Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-9 pr-3.5 py-1.5 text-body-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* 4. CUSTOMERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-xs">
            <thead>
              <tr className="border-b border-outline-variant/80 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/50">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4 text-right">Total Purchases</th>
                <th className="py-3.5 px-4 text-right">Credit Balance</th>
                <th className="py-3.5 px-4 text-right">Loyalty Points</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredCustomers.map((cust, idx) => {
                const isActive = cust.status === "Active";
                const hasCredit = cust.creditBalance > 0;
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                return (
                  <tr key={cust.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Customer Name + Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
                        >
                          {getInitials(cust.name)}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-body-sm leading-snug">
                            {cust.name}
                          </div>
                          <div className="text-[11px] text-on-surface-variant">
                            {cust.status}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-4 px-4 text-on-surface font-medium">
                      {cust.phone}
                    </td>

                    {/* Total Purchases */}
                    <td className="py-4 px-4 text-right font-bold text-on-surface">
                      ₦{cust.totalPurchases.toLocaleString()}
                    </td>

                    {/* Credit Balance */}
                    <td className="py-4 px-4 text-right">
                      {hasCredit ? (
                        <span className="inline-block font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded text-body-xs">
                          ₦{cust.creditBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant font-medium">
                          ₦0
                        </span>
                      )}
                    </td>

                    {/* Loyalty Points */}
                    <td className="py-4 px-4 text-right font-semibold text-amber-700">
                      {cust.loyaltyPoints.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-on-surface-variant">
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                          className="p-1.5 hover:bg-rose-50 rounded text-on-surface-variant hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Customer"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-on-surface-variant text-body-sm">
                    No customers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION FOOTER */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-xs text-on-surface-variant">
          <div>
            Showing 1 to {filteredCustomers.length} of 1,248 entries
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer font-medium"
            >
              Prev
            </button>
            <button
              className="px-3 py-1.5 rounded bg-[#005f37] text-white font-bold transition-colors cursor-pointer"
            >
              1
            </button>
            <button
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container transition-colors cursor-pointer font-medium"
            >
              2
            </button>
            <button
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container transition-colors cursor-pointer font-medium"
            >
              3
            </button>
            <span className="px-1 text-on-surface-variant">...</span>
            <button
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer font-medium"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-lowest rounded-xl border border-outline-variant w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">
                {editingCustomer ? "Edit Customer Record" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-body-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Bello"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0803 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. amina@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Address / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Victoria Island, Lagos"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Total Purchases (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1250000"
                    value={formData.totalPurchases}
                    onChange={(e) => setFormData({ ...formData, totalPurchases: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Credit Balance (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.creditBalance}
                    onChange={(e) => setFormData({ ...formData, creditBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Loyalty Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="450"
                    value={formData.loyaltyPoints}
                    onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {submitting ? "Saving..." : editingCustomer ? "Update Customer" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
