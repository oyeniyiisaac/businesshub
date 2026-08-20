"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Add,
  CheckCircle,
  Close,
  Delete,
  Description,
  Edit,
  Info,
  Language,
  Payments,
  Public,
  Receipt,
  Save,
} from "google-material-icons/outlined";

export interface TaxRateItem {
  id: string;
  name: string;
  description: string;
  rate: number;
  type: "Exclusive" | "Inclusive";
  status: "Active" | "Inactive";
}

const CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira (₦)", symbol: "₦" },
  { code: "USD", name: "US Dollar ($)", symbol: "$" },
  { code: "GBP", name: "British Pound (£)", symbol: "£" },
  { code: "EUR", name: "Euro (€)", symbol: "€" },
  { code: "GHS", name: "Ghanaian Cedi (GH₵)", symbol: "GH₵" },
  { code: "KES", name: "Kenyan Shilling (KSh)", symbol: "KSh" },
  { code: "ZAR", name: "South African Rand (R)", symbol: "R" },
];

export default function TaxAndCurrencyContent({
  isEmbedded = false,
}: {
  isEmbedded?: boolean;
}) {
  // State for Currency Settings
  const [baseCurrency, setBaseCurrency] = useState<string>("NGN");
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);
  const [showCurrencySymbol, setShowCurrencySymbol] = useState<boolean>(true);

  // State for Regional Settings
  const [timezone, setTimezone] = useState<string>("(GMT+01:00) West Central Africa");
  const [dateFormat, setDateFormat] = useState<string>("DD/MM/YYYY");

  // State for Tax Configuration
  const [taxes, setTaxes] = useState<TaxRateItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State for Add / Edit Tax
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalRate, setModalRate] = useState<number>(7.5);
  const [modalType, setModalType] = useState<"Exclusive" | "Inclusive">("Exclusive");
  const [modalStatus, setModalStatus] = useState<"Active" | "Inactive">("Active");

  // Fetch initial profile
  useEffect(() => {
    const loadProfile = async () => {
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
              query GetBusinessTaxSettings {
                businessProfile {
                  id
                  currency
                  timezone
                  dateFormat
                  decimalPlaces
                  showCurrencySymbol
                  taxRates {
                    id
                    name
                    description
                    rate
                    type
                    status
                  }
                }
              }
            `,
          }),
        });

        const result = await res.json();
        if (result.data?.businessProfile) {
          const prof = result.data.businessProfile;
          if (prof.currency) setBaseCurrency(prof.currency);
          if (prof.timezone) setTimezone(prof.timezone);
          if (prof.dateFormat) setDateFormat(prof.dateFormat);
          if (typeof prof.decimalPlaces === "number") setDecimalPlaces(prof.decimalPlaces);
          if (typeof prof.showCurrencySymbol === "boolean") setShowCurrencySymbol(prof.showCurrencySymbol);

          if (Array.isArray(prof.taxRates) && prof.taxRates.length > 0) {
            setTaxes(
              prof.taxRates.map((t: any) => ({
                id: t.id || Math.random().toString(36).substring(2, 9),
                name: t.name,
                description: t.description || "",
                rate: typeof t.rate === "number" ? t.rate : Number(t.rate) || 0,
                type: t.type === "Inclusive" ? "Inclusive" : "Exclusive",
                status: t.status === "Inactive" ? "Inactive" : "Active",
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load tax settings", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const currentCurrencyMeta = CURRENCIES.find((c) => c.code === baseCurrency) || CURRENCIES[0];

  const handleOpenAddModal = () => {
    setEditingTaxId(null);
    setModalName("");
    setModalDescription("");
    setModalRate(7.5);
    setModalType("Exclusive");
    setModalStatus("Active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TaxRateItem) => {
    setEditingTaxId(item.id);
    setModalName(item.name);
    setModalDescription(item.description);
    setModalRate(item.rate);
    setModalType(item.type);
    setModalStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSaveTaxModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim()) return;

    if (editingTaxId) {
      setTaxes((prev) =>
        prev.map((t) =>
          t.id === editingTaxId
            ? {
                ...t,
                name: modalName.trim(),
                description: modalDescription.trim(),
                rate: Number(modalRate) || 0,
                type: modalType,
                status: modalStatus,
              }
            : t
        )
      );
    } else {
      const newTax: TaxRateItem = {
        id: `tax-${Date.now()}`,
        name: modalName.trim(),
        description: modalDescription.trim(),
        rate: Number(modalRate) || 0,
        type: modalType,
        status: modalStatus,
      };
      setTaxes((prev) => [...prev, newTax]);
    }

    setIsModalOpen(false);
    setFeedback({ type: "success", message: `Tax rate "${modalName}" updated. Click "Save Changes" to apply.` });
  };

  const handleToggleTaxStatus = (id: string) => {
    setTaxes((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "Active" ? "Inactive" : "Active",
            }
          : t
      )
    );
  };

  const handleDeleteTax = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the tax "${name}"?`)) return;
    setTaxes((prev) => prev.filter((t) => t.id !== id));
    setFeedback({ type: "success", message: `Tax "${name}" removed. Click "Save Changes" to apply.` });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setFeedback(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const cleanedTaxes = taxes.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        rate: Number(t.rate) || 0,
        type: t.type,
        status: t.status,
      }));

      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            mutation UpdateTaxAndCurrency($input: UpdateBusinessProfileInput!) {
              updateBusinessProfile(input: $input) {
                id
                currency
                timezone
                dateFormat
                decimalPlaces
                showCurrencySymbol
                taxRates {
                  id
                  name
                  description
                  rate
                  type
                  status
                }
              }
            }
          `,
          variables: {
            input: {
              currency: baseCurrency,
              timezone,
              dateFormat,
              decimalPlaces: Number(decimalPlaces),
              showCurrencySymbol: Boolean(showCurrencySymbol),
              taxRates: cleanedTaxes,
            },
          },
        }),
      });

      const result = await res.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0].message || "Failed to save settings");
      }

      setFeedback({ type: "success", message: "Tax & currency settings saved successfully!" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save settings." });
    } finally {
      setSaving(false);
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
            <span className="text-on-surface font-semibold">Tax & Currency</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                Tax & Currency
              </h1>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                Manage your regional financials, base currency, and tax configurations.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-5 py-2.5 rounded-DEFAULT text-body-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end pb-1">
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-5 py-2.5 rounded-DEFAULT text-body-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
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

      {/* 2. MAIN TWO-COLUMN CONFIGURATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CURRENCY & REGIONAL SETTINGS (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Currency Settings */}
          <div className="bg-surface-lowest border border-outline-variant rounded-lg p-5 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Payments className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-on-surface">Currency Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Base Currency */}
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface">
                  Base Currency
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-on-surface-variant">
                  Base currency is used for all reporting.
                </p>
              </div>

              {/* Decimal Places */}
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface">
                  Decimal Places
                </label>
                <select
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                  className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value={2}>2 (e.g. {currentCurrencyMeta.symbol}1,000.00)</option>
                  <option value={0}>0 (e.g. {currentCurrencyMeta.symbol}1,000)</option>
                  <option value={3}>3 (e.g. {currentCurrencyMeta.symbol}1,000.000)</option>
                </select>
              </div>

              {/* Show Currency Symbol Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/60">
                <div>
                  <label className="text-body-sm font-semibold text-on-surface block">
                    Show Currency Symbol
                  </label>
                  <p className="text-[11px] text-on-surface-variant">
                    Display {currentCurrencyMeta.symbol} in reports and invoices
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showCurrencySymbol}
                    onChange={(e) => setShowCurrencySymbol(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005f37]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Regional Settings */}
          <div className="bg-surface-lowest border border-outline-variant rounded-lg p-5 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Public className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-on-surface">Regional Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Timezone */}
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="(GMT+01:00) West Central Africa">
                    (GMT+01:00) West Central Africa
                  </option>
                  <option value="(GMT+00:00) UTC / London">
                    (GMT+00:00) UTC / London
                  </option>
                  <option value="(GMT-05:00) Eastern Time (US & Canada)">
                    (GMT-05:00) Eastern Time (US & Canada)
                  </option>
                  <option value="(GMT-08:00) Pacific Time (US & Canada)">
                    (GMT-08:00) Pacific Time (US & Canada)
                  </option>
                  <option value="(GMT+02:00) South Africa Standard Time">
                    (GMT+02:00) South Africa Standard Time
                  </option>
                  <option value="(GMT+03:00) East Africa Time">
                    (GMT+03:00) East Africa Time
                  </option>
                </select>
              </div>

              {/* Date Format */}
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
                  <option value="DD-MMM-YYYY">DD-MMM-YYYY (31-Dec-2023)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TAX CONFIGURATION (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-lowest border border-outline-variant rounded-lg p-5 shadow-2xs space-y-5">
          {/* Header with Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">Tax Configuration</h2>
                <p className="text-[11px] text-on-surface-variant">
                  Manage tax rates applied to sales and purchases.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="border border-outline-variant hover:bg-surface-container text-on-surface font-semibold text-body-xs px-3.5 py-2 rounded-DEFAULT flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Add className="w-4 h-4" />
              <span>Add New Tax</span>
            </button>
          </div>

          {/* Tax Rates Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-xs">
              <thead>
                <tr className="border-b border-outline-variant/80 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-3">TAX NAME</th>
                  <th className="py-3 px-3 text-center">RATE (%)</th>
                  <th className="py-3 px-3 text-center">TYPE</th>
                  <th className="py-3 px-3 text-center">STATUS</th>
                  <th className="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {taxes.map((tax) => {
                  const isActive = tax.status === "Active";
                  return (
                    <tr key={tax.id} className="hover:bg-surface-container-low/40 transition-colors">
                      {/* Tax Name & Subtitle */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-on-surface text-body-sm">
                          {tax.name}
                        </div>
                        {tax.description && (
                          <div className="text-[11px] text-on-surface-variant">
                            {tax.description}
                          </div>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="py-3.5 px-3 text-center font-bold text-on-surface">
                        {tax.rate.toFixed(2)}%
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/50">
                          {tax.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleTaxStatus(tax.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition"
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span className={isActive ? "text-emerald-700" : "text-slate-500"}>
                            {tax.status}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-on-surface-variant">
                          <button
                            onClick={() => handleOpenEditModal(tax)}
                            className="p-1.5 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Edit Tax"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTax(tax.id, tax.name)}
                            className="p-1.5 hover:bg-rose-50 rounded text-on-surface-variant hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Tax"
                          >
                            <Delete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Notice */}
          <div className="pt-3 border-t border-outline-variant/60 flex items-center gap-2 text-[11px] text-on-surface-variant">
            <Info className="w-4 h-4 text-on-surface-variant/80 shrink-0" />
            <span>Changes to tax rates will only affect new transactions created after saving.</span>
          </div>

        </div>

      </div>

      {/* Add / Edit Tax Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-lowest rounded-xl border border-outline-variant w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">
                {editingTaxId ? "Edit Tax Configuration" : "Add New Tax Rate"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaxModal} className="space-y-4 text-body-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Tax Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Value Added Tax (VAT)"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Description / Applicability
                </label>
                <input
                  type="text"
                  placeholder="e.g. Federal Tax ID required / Hospitality"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Tax Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={modalRate}
                    onChange={(e) => setModalRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Tax Type
                  </label>
                  <select
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Exclusive">Exclusive (Added to price)</option>
                    <option value="Inclusive">Inclusive (Included in price)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
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
                  className="px-4 py-2 bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold rounded-DEFAULT transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {editingTaxId ? "Update Tax" : "Add Tax"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
