"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Add,
  Business,
  Close,
  Delete,
  Edit,
  LocationOn,
  Person,
  Phone,
  Save,
  Store,
  Storefront,
  Warehouse,
} from "google-material-icons/outlined";

export interface BranchData {
  id?: string;
  branchName: string;
  branchCode: string;
  assignedManager?: string;
  fullAddress?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  branchEmail?: string;
  totalStaff?: number;
  todaySales?: number;
  isActive: boolean;
}

export default function BranchManagementContent({
  isEmbedded = false,
}: {
  isEmbedded?: boolean;
}) {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State for Add / Edit Branch
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchData | null>(null);
  const [modalForm, setModalForm] = useState<BranchData>({
    branchName: "",
    branchCode: "",
    assignedManager: "",
    fullAddress: "",
    city: "",
    state: "",
    phoneNumber: "",
    branchEmail: "",
    totalStaff: 0,
    todaySales: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch branches from GraphQL backend
  const fetchBranches = useCallback(async () => {
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
            query GetBranches {
              branches {
                id
                branchName
                branchCode
                assignedManager
                fullAddress
                city
                state
                phoneNumber
                branchEmail
                totalStaff
                todaySales
                isActive
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.branches) {
        setBranches(result.data.branches);
      } else {
        setBranches([]);
      }
    } catch (err) {
      console.error("Failed to load branches", err);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setModalForm({
      branchName: "",
      branchCode: `BR-${Math.floor(100 + Math.random() * 900)}`,
      assignedManager: "",
      fullAddress: "",
      city: "",
      state: "",
      phoneNumber: "",
      branchEmail: "",
      totalStaff: 0,
      todaySales: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: BranchData) => {
    setEditingBranch(branch);
    setModalForm({
      id: branch.id,
      branchName: branch.branchName || "",
      branchCode: branch.branchCode || "",
      assignedManager: branch.assignedManager || "",
      fullAddress: branch.fullAddress || "",
      city: branch.city || "",
      state: branch.state || "",
      phoneNumber: branch.phoneNumber || "",
      branchEmail: branch.branchEmail || "",
      totalStaff: typeof branch.totalStaff === "number" ? branch.totalStaff : 0,
      todaySales: typeof branch.todaySales === "number" ? branch.todaySales : 0,
      isActive: branch.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveBranchModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.branchName.trim() || !modalForm.branchCode.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (editingBranch?.id && !editingBranch.id.startsWith("branch-")) {
        // Update in DB
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation UpdateBranch($id: ID!, $input: UpdateBranchInput!) {
                updateBranch(id: $id, input: $input) {
                  id
                  branchName
                  branchCode
                  assignedManager
                  fullAddress
                  city
                  state
                  phoneNumber
                  branchEmail
                  totalStaff
                  todaySales
                  isActive
                }
              }
            `,
            variables: {
              id: editingBranch.id,
              input: {
                branchName: modalForm.branchName.trim(),
                assignedManager: modalForm.assignedManager?.trim() || undefined,
                fullAddress: modalForm.fullAddress?.trim() || undefined,
                city: modalForm.city?.trim() || undefined,
                state: modalForm.state?.trim() || undefined,
                phoneNumber: modalForm.phoneNumber?.trim() || undefined,
                branchEmail: modalForm.branchEmail?.trim() || undefined,
                totalStaff: Number(modalForm.totalStaff) || 0,
                todaySales: Number(modalForm.todaySales) || 0,
                isActive: Boolean(modalForm.isActive),
              },
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to update branch");
        }
      } else if (!editingBranch) {
        // Create in DB
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation CreateBranch($input: CreateBranchInput!) {
                createBranch(input: $input) {
                  id
                  branchName
                  branchCode
                  assignedManager
                  fullAddress
                  city
                  state
                  phoneNumber
                  branchEmail
                  totalStaff
                  todaySales
                  isActive
                }
              }
            `,
            variables: {
              input: {
                branchName: modalForm.branchName.trim(),
                branchCode: modalForm.branchCode.trim().toUpperCase(),
                assignedManager: modalForm.assignedManager?.trim() || "Manager",
                fullAddress: modalForm.fullAddress?.trim() || undefined,
                city: modalForm.city?.trim() || undefined,
                state: modalForm.state?.trim() || undefined,
                phoneNumber: modalForm.phoneNumber?.trim() || undefined,
                branchEmail: modalForm.branchEmail?.trim() || undefined,
                totalStaff: Number(modalForm.totalStaff) || 0,
                todaySales: Number(modalForm.todaySales) || 0,
                isActive: Boolean(modalForm.isActive),
              },
            },
          }),
        });

        const result = await res.json();
        if (result.errors?.length) {
          throw new Error(result.errors[0].message || "Failed to create branch");
        }
      }

      // Optimistic / Local update
      if (editingBranch) {
        setBranches((prev) =>
          prev.map((b) =>
            b.id === editingBranch.id
              ? { ...modalForm, id: editingBranch.id }
              : b
          )
        );
        setFeedback({ type: "success", message: `Branch "${modalForm.branchName}" updated successfully!` });
      } else {
        const newEntry: BranchData = {
          ...modalForm,
          id: `branch-${Date.now()}`,
        };
        setBranches((prev) => [...prev, newEntry]);
        setFeedback({ type: "success", message: `Branch "${modalForm.branchName}" added successfully!` });
      }

      setIsModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Operation failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (id?: string, name?: string) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to delete the branch "${name || 'this branch'}"?`)) return;

    try {
      if (!id.startsWith("branch-")) {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: `
              mutation DeleteBranch($id: ID!) {
                deleteBranch(id: $id)
              }
            `,
            variables: { id },
          }),
        });
      }

      setBranches((prev) => prev.filter((b) => b.id !== id));
      setIsModalOpen(false);
      setFeedback({ type: "success", message: `Branch "${name}" deleted.` });
      fetchBranches();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete branch" });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. HEADER SECTION */}
      {!isEmbedded ? (
        <div>
          <div className="text-body-xs text-on-surface-variant mb-1 font-medium flex items-center gap-1.5">
            <Link href="/settings" className="hover:text-primary transition-colors">
              Settings
            </Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">Branch Management</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                Branch Management
              </h1>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Manage your store locations and branch-level settings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-4 py-2.5 rounded-DEFAULT text-body-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Add className="w-4 h-4" />
              <span>Add New Branch</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end pb-1">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-4 py-2.5 rounded-DEFAULT text-body-sm shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Add className="w-4 h-4" />
            <span>Add New Branch</span>
          </button>
        </div>
      )}

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

      {/* 2. BRANCH CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {branches.map((branch) => {
          const isActive = branch.isActive !== false;
          return (
            <div
              key={branch.id || branch.branchCode}
              className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-6 hover:shadow-xs transition-all"
            >
              {/* Card Top: Details */}
              <div className="space-y-4">
                {/* Header Row: Branch Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface tracking-tight leading-tight">
                      {branch.branchName}
                    </h2>
                    {branch.assignedManager && (
                      <p className="text-body-xs text-on-surface-variant mt-1 flex items-center gap-1">
                        <Person className="w-3.5 h-3.5 text-on-surface-variant/80" />
                        <span>{branch.assignedManager} (Manager)</span>
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 border ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Contact & Location Info */}
                <div className="space-y-1.5 text-body-xs text-on-surface-variant">
                  {branch.fullAddress && (
                    <div className="flex items-start gap-1.5">
                      <LocationOn className="w-4 h-4 text-on-surface-variant/80 shrink-0 mt-0.5" />
                      <span className="leading-snug">{branch.fullAddress}</span>
                    </div>
                  )}

                  {branch.phoneNumber && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-on-surface-variant/80 shrink-0" />
                      <span className="font-medium text-on-surface">{branch.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Middle: Stats Grid */}
              <div className="border-t border-outline-variant/60 pt-4 grid grid-cols-2 gap-3 items-end">
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant">
                    Total Staff
                  </p>
                  <p className="text-2xl font-bold text-on-surface mt-0.5">
                    {branch.totalStaff || 0}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant">
                    Today&apos;s Sales
                  </p>
                  <p className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
                    {branch.todaySales && branch.todaySales > 0
                      ? `₦${branch.todaySales.toLocaleString()}`
                      : "₦0"}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Edit Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(branch)}
                  className="w-full border border-outline-variant hover:bg-surface-container text-on-surface font-semibold py-2 rounded-DEFAULT text-body-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Branch</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-lowest rounded-xl border border-outline-variant w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">
                {editingBranch ? "Edit Branch Location" : "Add New Store Branch"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranchModal} className="space-y-4 text-body-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Branch Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikeja Flagship"
                    value={modalForm.branchName}
                    onChange={(e) => setModalForm({ ...modalForm, branchName: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Branch Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingBranch)}
                    placeholder="e.g. IKJ-01"
                    value={modalForm.branchCode}
                    onChange={(e) => setModalForm({ ...modalForm, branchCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Assigned Manager
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Ojo"
                    value={modalForm.assignedManager}
                    onChange={(e) => setModalForm({ ...modalForm, assignedManager: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 801 234 5678"
                    value={modalForm.phoneNumber}
                    onChange={(e) => setModalForm({ ...modalForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 42 Allen Avenue, Ikeja, Lagos"
                  value={modalForm.fullAddress}
                  onChange={(e) => setModalForm({ ...modalForm, fullAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Total Staff
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="24"
                    value={modalForm.totalStaff}
                    onChange={(e) => setModalForm({ ...modalForm, totalStaff: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Today&apos;s Sales (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1245000"
                    value={modalForm.todaySales}
                    onChange={(e) => setModalForm({ ...modalForm, todaySales: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Operating Status
                </label>
                <select
                  value={modalForm.isActive ? "active" : "inactive"}
                  onChange={(e) => setModalForm({ ...modalForm, isActive: e.target.value === "active" })}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active (Operational & Sales Allowed)</option>
                  <option value="inactive">Inactive (Temporarily Closed / Disabled)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                {editingBranch && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBranch(editingBranch.id, editingBranch.branchName)}
                    className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Delete className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}

                <div className="flex items-center gap-3 ml-auto">
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
                    {submitting ? "Saving..." : editingBranch ? "Update Branch" : "Add Branch"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
