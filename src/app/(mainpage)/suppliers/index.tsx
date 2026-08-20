"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Add,
  Assignment,
  Close,
  CreditCard,
  Delete,
  DirectionsCar,
  Edit,
  FactCheck,
  Inventory,
  LocalShipping,
  Person,
  Phone,
  ReceiptLong,
  Search,
  Storefront,
  TaskAlt,
  TrendingUp,
} from "google-material-icons/outlined";

export interface SupplierItem {
  id: string;
  businessName: string;
  category: string;
  tin?: string;
  primaryContactPerson?: string;
  phoneNumber?: string;
  emailAddress?: string;
  physicalAddress?: string;
  defaultPaymentTerms?: string;
  initialBalanceOwed?: number;
  outstandingBalance: number;
  activeOrders?: number;
  pendingDeliveries?: number;
  status: "Active" | "Inactive";
}

const CATEGORY_STYLES: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-700 border border-blue-200/80",
  "Office Supplies": "bg-pink-50 text-pink-700 border border-pink-200/80",
  Shipping: "bg-slate-100 text-slate-700 border border-slate-200",
  Groceries: "bg-amber-50 text-amber-700 border border-amber-200/80",
  General: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
};

export default function SuppliersPageContent() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [formData, setFormData] = useState<{
    businessName: string;
    primaryContactPerson: string;
    emailAddress: string;
    phoneNumber: string;
    category: string;
    physicalAddress: string;
    outstandingBalance: number;
    defaultPaymentTerms: string;
    status: "Active" | "Inactive";
  }>({
    businessName: "",
    primaryContactPerson: "",
    emailAddress: "",
    phoneNumber: "",
    category: "General",
    physicalAddress: "",
    outstandingBalance: 0,
    defaultPaymentTerms: "NET_30",
    status: "Active",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch from GraphQL server route
  const fetchSuppliers = useCallback(async () => {
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
            query GetSuppliers {
              vendors {
                id
                businessName
                category
                tin
                primaryContactPerson
                phoneNumber
                emailAddress
                physicalAddress
                defaultPaymentTerms
                initialBalanceOwed
                outstandingBalance
                activeOrders
                pendingDeliveries
                status
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.vendors) {
        setSuppliers(
          result.data.vendors.map((v: any) => ({
            id: v.id,
            businessName: v.businessName,
            category: v.category || "General",
            tin: v.tin || "",
            primaryContactPerson: v.primaryContactPerson || "",
            phoneNumber: v.phoneNumber || "",
            emailAddress: v.emailAddress || "",
            physicalAddress: v.physicalAddress || "",
            defaultPaymentTerms: v.defaultPaymentTerms || "NET_30",
            outstandingBalance:
              typeof v.outstandingBalance === "number"
                ? v.outstandingBalance
                : (v.initialBalanceOwed || 0),
            activeOrders: v.activeOrders || 0,
            pendingDeliveries: v.pendingDeliveries || 0,
            status: v.status === "Inactive" ? "Inactive" : "Active",
          }))
        );
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      console.error("Failed to load suppliers", err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Derived Filtered List
  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.businessName.toLowerCase().includes(q) ||
        (s.primaryContactPerson && s.primaryContactPerson.toLowerCase().includes(q)) ||
        (s.emailAddress && s.emailAddress.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.phoneNumber && s.phoneNumber.includes(q))
    );
  }, [suppliers, searchQuery]);

  // Metrics computation purely from database suppliers
  const metrics = useMemo(() => {
    const totalCount = suppliers.length;
    const totalBalance = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
    const activeOrders = suppliers.reduce((sum, s) => sum + (s.activeOrders || 0), 0);
    const pendingDeliveries = suppliers.reduce((sum, s) => sum + (s.pendingDeliveries || 0), 0);
    const withBalanceCount = suppliers.filter((s) => (s.outstandingBalance || 0) > 0).length;
    const activeCount = suppliers.filter((s) => s.status === "Active").length;

    return {
      totalSuppliers: totalCount,
      activeOrders,
      totalOutstanding: totalBalance,
      pendingDeliveries,
      withBalanceCount,
      activeCount,
    };
  }, [suppliers]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      businessName: "",
      primaryContactPerson: "",
      emailAddress: "",
      phoneNumber: "",
      category: "General",
      physicalAddress: "",
      outstandingBalance: 0,
      defaultPaymentTerms: "NET_30",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: SupplierItem) => {
    setEditingSupplier(supplier);
    setFormData({
      businessName: supplier.businessName,
      primaryContactPerson: supplier.primaryContactPerson || "",
      emailAddress: supplier.emailAddress || "",
      phoneNumber: supplier.phoneNumber || "",
      category: supplier.category || "General",
      physicalAddress: supplier.physicalAddress || "",
      outstandingBalance: supplier.outstandingBalance || 0,
      defaultPaymentTerms: supplier.defaultPaymentTerms || "NET_30",
      status: supplier.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (editingSupplier?.id && !editingSupplier.id.startsWith("sup-")) {
        // Update in DB
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation UpdateVendor($id: ID!, $input: UpdateVendorInput!) {
                updateVendor(id: $id, input: $input) {
                  id
                  businessName
                  category
                  primaryContactPerson
                  phoneNumber
                  emailAddress
                  physicalAddress
                  outstandingBalance
                  status
                }
              }
            `,
            variables: {
              id: editingSupplier.id,
              input: {
                businessName: formData.businessName.trim(),
                primaryContactPerson: formData.primaryContactPerson.trim() || undefined,
                emailAddress: formData.emailAddress.trim() || undefined,
                phoneNumber: formData.phoneNumber.trim() || undefined,
                category: formData.category,
                physicalAddress: formData.physicalAddress.trim() || undefined,
                outstandingBalance: Number(formData.outstandingBalance) || 0,
                status: formData.status,
              },
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to update supplier");
        }
      } else if (!editingSupplier) {
        // Create in DB
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation CreateVendor($input: CreateVendorInput!) {
                createVendor(input: $input) {
                  id
                  businessName
                  category
                  primaryContactPerson
                  phoneNumber
                  emailAddress
                  physicalAddress
                  outstandingBalance
                  status
                }
              }
            `,
            variables: {
              input: {
                businessName: formData.businessName.trim(),
                primaryContactPerson: formData.primaryContactPerson.trim() || undefined,
                emailAddress: formData.emailAddress.trim() || undefined,
                phoneNumber: formData.phoneNumber.trim() || undefined,
                category: formData.category,
                physicalAddress: formData.physicalAddress.trim() || undefined,
                outstandingBalance: Number(formData.outstandingBalance) || 0,
                status: formData.status,
              },
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to create supplier");
        }
      }

      // Optimistic / local state
      if (editingSupplier) {
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === editingSupplier.id
              ? {
                  ...s,
                  ...formData,
                  id: editingSupplier.id,
                }
              : s
          )
        );
        setFeedback({ type: "success", message: `Supplier "${formData.businessName}" updated successfully!` });
      } else {
        const newSup: SupplierItem = {
          ...formData,
          id: `sup-${Date.now()}`,
          activeOrders: 0,
          pendingDeliveries: 0,
        };
        setSuppliers((prev) => [newSup, ...prev]);
        setFeedback({ type: "success", message: `Supplier "${formData.businessName}" created successfully!` });
      }

      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete supplier record for "${name}"?`)) return;

    try {
      if (!id.startsWith("sup-")) {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation DeleteVendor($id: ID!) {
                deleteVendor(id: $id)
              }
            `,
            variables: { id },
          }),
        });
      }

      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: "success", message: `Supplier "${name}" deleted.` });
      fetchSuppliers();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete supplier." });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Suppliers
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Manage vendor relationships and outstanding balances.
          </p>
        </div>

        {/* Header Right Actions (Search & + New Supplier) */}
        <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-9 pr-3.5 py-1.5 text-body-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-4 py-2 rounded-DEFAULT text-body-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Add className="w-4 h-4" />
            <span>New Supplier</span>
          </button>
        </div>
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
        
        {/* Card 1: Total Suppliers */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Total Suppliers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <LocalShipping className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {metrics.totalSuppliers}
            </p>
            <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <span>{metrics.activeCount} active in system</span>
            </p>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Assignment className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {metrics.activeOrders}
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">
              {metrics.activeOrders > 0 ? "Requires fulfillment" : "No pending orders"}
            </p>
          </div>
        </div>

        {/* Card 3: Total Outstanding Balance */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Total Outstanding Balance (₦)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <ReceiptLong className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              ₦ {metrics.totalOutstanding.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">
              {metrics.withBalanceCount > 0
                ? `Across ${metrics.withBalanceCount} vendor${metrics.withBalanceCount === 1 ? "" : "s"}`
                : "No outstanding balances"}
            </p>
          </div>
        </div>

        {/* Card 4: Pending Deliveries */}
        <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Pending Deliveries
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FactCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {metrics.pendingDeliveries}
            </p>
            <p className="text-xs font-medium text-on-surface-variant mt-1">
              {metrics.pendingDeliveries > 0 ? "Awaiting delivery" : "All shipments fulfilled"}
            </p>
          </div>
        </div>

      </div>

      {/* 3. SUPPLIERS TABLE */}
      <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-xs">
            <thead>
              <tr className="border-b border-outline-variant/80 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/50">
                <th className="py-3.5 px-4 sm:px-6">Supplier Name</th>
                <th className="py-3.5 px-4 sm:px-6">Contact Person</th>
                <th className="py-3.5 px-4 sm:px-6">Category</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Outstanding Balance</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredSuppliers.map((supplier) => {
                const isActive = supplier.status === "Active";
                const categoryClass =
                  CATEGORY_STYLES[supplier.category] ||
                  "bg-slate-100 text-slate-700 border border-slate-200";

                return (
                  <tr key={supplier.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Supplier Name */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-bold text-on-surface text-body-sm">
                        {supplier.businessName}
                      </span>
                    </td>

                    {/* Contact Person */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-on-surface text-body-xs">
                        {supplier.primaryContactPerson || "—"}
                      </div>
                      {supplier.emailAddress && (
                        <div className="text-[11px] text-on-surface-variant">
                          {supplier.emailAddress}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${categoryClass}`}
                      >
                        {supplier.category || "General"}
                      </span>
                    </td>

                    {/* Outstanding Balance */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      {supplier.outstandingBalance > 0 ? (
                        <span className="font-bold text-rose-700 text-body-xs">
                          ₦ {supplier.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant font-medium">
                          ₦ 0.00
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-emerald-600" : "bg-slate-400"
                          }`}
                        />
                        <span
                          className={`text-body-xs font-semibold ${
                            isActive ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1 text-on-surface-variant">
                        <button
                          onClick={() => handleOpenEditModal(supplier)}
                          className="p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Edit Supplier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id, supplier.businessName)}
                          className="p-1.5 hover:bg-rose-50 rounded text-on-surface-variant hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Supplier"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-on-surface-variant text-body-sm">
                    No suppliers found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-xs text-on-surface-variant">
          <div>
            Showing 1 to {filteredSuppliers.length} of 124 entries
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
            <span className="px-1 text-on-surface-variant">...</span>
            <button
              className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              31
            </button>
            <button
              className="px-2.5 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-lowest rounded-xl border border-outline-variant w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">
                {editingSupplier ? "Edit Supplier Record" : "Add New Supplier"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-body-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Supplier / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TechCorp Ltd"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.primaryContactPerson}
                    onChange={(e) => setFormData({ ...formData, primaryContactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Groceries">Groceries</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. jane@techcorp.ng"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 803 111 2222"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Physical / Warehouse Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 12 Warehouse Avenue, Ikeja"
                  value={formData.physicalAddress}
                  onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Outstanding Balance (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1500000"
                    value={formData.outstandingBalance}
                    onChange={(e) => setFormData({ ...formData, outstandingBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Operating Status
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
                  {submitting ? "Saving..." : editingSupplier ? "Update Supplier" : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
