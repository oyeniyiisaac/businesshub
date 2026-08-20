"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AccountBalance,
  Business,
  Campaign,
  CheckCircle,
  CloudUpload,
  CreditCard,
  Edit,
  Email,
  Image,
  LocationOn,
  Lock,
  Notifications,
  Payments,
  Phone,
  Save,
  Security,
  Settings,
  Store,
  Storefront,
  Warehouse,
} from "google-material-icons/outlined";
import RolesAndPermissionsContent from "./roles/index";
import TaxAndCurrencyContent from "./tax/index";
import BranchManagementContent from "./branches/index";

type SettingsTab = "profile" | "branches" | "roles" | "tax" | "notifications";

interface BusinessProfileData {
  id?: string;
  businessName: string;
  ownerName: string;
  workEmail: string;
  phoneNumber: string;
  logoUrl?: string | null;
  registeredAddress: string;
  currency: string;
  taxNumber: string;
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Form State
  const [formData, setFormData] = useState<BusinessProfileData>({
    businessName: "BusinessHub NG",
    ownerName: "Admin",
    workEmail: "admin@businesshub.ng",
    phoneNumber: "+234 800 123 4567",
    logoUrl: null,
    registeredAddress: "124 Business Avenue, Ikeja, Lagos State, Nigeria",
    currency: "NGN",
    taxNumber: "TIN-89421094-01",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Notification settings state
  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    dailySalesDigest: true,
    staffLoginAlerts: false,
    newOrdersEmail: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Business Profile
  useEffect(() => {
    const fetchProfile = async () => {
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
              query GetBusinessProfile {
                businessProfile {
                  id
                  businessName
                  ownerName
                  workEmail
                  phoneNumber
                  logoUrl
                  registeredAddress
                  currency
                  taxNumber
                }
              }
            `,
          }),
        });

        const result = await res.json();
        if (result.data?.businessProfile) {
          const prof = result.data.businessProfile;
          setFormData((prev) => ({
            ...prev,
            businessName: prof.businessName || prev.businessName,
            ownerName: prof.ownerName || prev.ownerName,
            workEmail: prof.workEmail || prev.workEmail,
            phoneNumber: prof.phoneNumber || prev.phoneNumber,
            logoUrl: prof.logoUrl || prev.logoUrl,
            registeredAddress: prof.registeredAddress || prev.registeredAddress,
            currency: prof.currency || prev.currency,
            taxNumber: prof.taxNumber || prev.taxNumber,
          }));
        }
      } catch (err) {
        console.error("Failed to load business profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: "error", message: "Image size exceeds 2MB limit" });
      return;
    }

    setUploadingLogo(true);
    setFeedback(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload logo");

      setFormData((prev) => ({ ...prev, logoUrl: data.url }));
      setFeedback({ type: "success", message: "Logo uploaded successfully! Remember to save changes." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Logo upload failed" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

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
            mutation UpdateBusinessProfile($input: UpdateBusinessProfileInput!) {
              updateBusinessProfile(input: $input) {
                id
                businessName
                ownerName
                workEmail
                phoneNumber
                logoUrl
                registeredAddress
                currency
                taxNumber
              }
            }
          `,
          variables: {
            input: {
              businessName: formData.businessName,
              ownerName: formData.ownerName,
              workEmail: formData.workEmail,
              phoneNumber: formData.phoneNumber,
              logoUrl: formData.logoUrl,
              registeredAddress: formData.registeredAddress,
              currency: formData.currency,
              taxNumber: formData.taxNumber,
            },
          },
        }),
      });

      const result = await res.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0].message || "Failed to update profile");
      }

      setFeedback({ type: "success", message: "Company profile updated successfully!" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save profile changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            System Settings
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Manage your business profile, branches, staff roles, and platform preferences.
          </p>
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

      {/* 2. MAIN SETTINGS GRID (TABS + CONTENT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: NAVIGATION TABS */}
        <div className="lg:col-span-4 bg-surface-lowest border border-outline-variant rounded-lg p-3 space-y-1 shadow-2xs">
          {/* Company Profile Tab */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-DEFAULT text-body-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === "profile"
                ? "bg-primary-container/25 text-primary font-bold border-l-4 border-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <Store className="w-5 h-5 shrink-0" />
            <span>Company Profile</span>
          </button>

          {/* Branch Management Tab */}
          <button
            onClick={() => setActiveTab("branches")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-DEFAULT text-body-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === "branches"
                ? "bg-primary-container/25 text-primary font-bold border-l-4 border-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <Storefront className="w-5 h-5 shrink-0" />
              <span>Branch Management</span>
            </div>
            <Link
              href="/settings/branches"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-primary hover:underline font-semibold"
              title="Open full page view"
            >
              Full Page ↗
            </Link>
          </button>

          {/* Roles & Permissions Tab */}
          <button
            onClick={() => setActiveTab("roles")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-DEFAULT text-body-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === "roles"
                ? "bg-primary-container/25 text-primary font-bold border-l-4 border-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <Security className="w-5 h-5 shrink-0" />
              <span>Roles & Permissions</span>
            </div>
            <Link
              href="/settings/roles"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-primary hover:underline font-semibold"
              title="Open full page view"
            >
              Full Page ↗
            </Link>
          </button>

          {/* Tax & Currency Tab */}
          <button
            onClick={() => setActiveTab("tax")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-DEFAULT text-body-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === "tax"
                ? "bg-primary-container/25 text-primary font-bold border-l-4 border-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <AccountBalance className="w-5 h-5 shrink-0" />
              <span>Tax & Currency</span>
            </div>
            <Link
              href="/settings/tax"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-primary hover:underline font-semibold"
              title="Open full page view"
            >
              Full Page ↗
            </Link>
          </button>

          {/* Notification Preferences Tab */}
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-DEFAULT text-body-sm font-medium transition-all text-left cursor-pointer ${
              activeTab === "notifications"
                ? "bg-primary-container/25 text-primary font-bold border-l-4 border-primary"
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <Notifications className="w-5 h-5 shrink-0" />
            <span>Notification Preferences</span>
          </button>
        </div>

        {/* RIGHT COLUMN: ACTIVE TAB CONTENT */}
        <div className="lg:col-span-8 bg-surface-lowest border border-outline-variant rounded-lg p-6 shadow-2xs">
          
          {/* TAB 1: COMPANY PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Company Profile</h2>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    Update your business details and branding.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={saving}
                  className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-5 py-2.5 rounded-DEFAULT text-body-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

              {/* Profile Form Content */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Business Logo Column */}
                  <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-36 h-36 rounded-lg border-2 border-dashed border-outline-variant hover:border-primary bg-surface-container-low flex flex-col items-center justify-center p-3 cursor-pointer transition-all relative overflow-hidden group shadow-2xs"
                    >
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Business Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1 text-on-surface-variant">
                          <Store className="w-10 h-10 text-primary" />
                          <span className="text-[12px] font-bold text-on-surface">VERIDIAN</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-medium transition-opacity">
                        <CloudUpload className="w-5 h-5 mb-1" />
                        <span>Change Logo</span>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <div>
                      <p className="text-body-xs font-semibold text-on-surface">Business Logo</p>
                      <p className="text-[11px] text-on-surface-variant">JPG, PNG or SVG. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Form Inputs Column */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Business Name */}
                    <div className="space-y-1.5">
                      <label className="text-body-xs font-semibold text-on-surface">
                        Business Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="BusinessHub NG"
                        className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-body-xs font-semibold text-on-surface">
                          Contact Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.workEmail}
                          onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                          placeholder="admin@businesshub.ng"
                          className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-body-xs font-semibold text-on-surface">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="+234 800 123 4567"
                          className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Registered Address */}
                    <div className="space-y-1.5">
                      <label className="text-body-xs font-semibold text-on-surface">
                        Registered Address
                      </label>
                      <textarea
                        rows={3}
                        value={formData.registeredAddress}
                        onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
                        placeholder="124 Business Avenue, Ikeja, Lagos State, Nigeria"
                        className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: BRANCH MANAGEMENT */}
          {activeTab === "branches" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Branch Management</h2>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    Manage your store locations and branch-level settings.
                  </p>
                </div>
                <Link
                  href="/settings/branches"
                  className="text-body-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Open Standalone Page</span>
                  <span>↗</span>
                </Link>
              </div>

              <BranchManagementContent isEmbedded={true} />
            </div>
          )}

          {/* TAB 3: ROLES & PERMISSIONS (EMBEDDED) */}
          {activeTab === "roles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Roles & Permissions</h2>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    Configure granular feature access for each operational role.
                  </p>
                </div>
                <Link
                  href="/settings/roles"
                  className="text-body-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Open Standalone Page</span>
                  <span>↗</span>
                </Link>
              </div>

              <RolesAndPermissionsContent />
            </div>
          )}

          {/* TAB 4: TAX & CURRENCY */}
          {activeTab === "tax" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Tax & Currency</h2>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    Manage your regional financials, base currency, and tax configurations.
                  </p>
                </div>
                <Link
                  href="/settings/tax"
                  className="text-body-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Open Standalone Page</span>
                  <span>↗</span>
                </Link>
              </div>

              <TaxAndCurrencyContent isEmbedded={true} />
            </div>
          )}

          {/* TAB 5: NOTIFICATION PREFERENCES */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Notification Preferences</h2>
                  <p className="text-body-xs text-on-surface-variant mt-0.5">
                    Choose what updates and system alerts you receive.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFeedback({ type: "success", message: "Notification preferences saved!" })}
                  className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-5 py-2.5 rounded-DEFAULT text-body-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-lg border border-outline-variant bg-surface-container-low cursor-pointer">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Low Stock Alerts</p>
                    <p className="text-body-xs text-on-surface-variant">Get notified when product inventory falls below minimum threshold</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.lowStockAlerts}
                    onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-lg border border-outline-variant bg-surface-container-low cursor-pointer">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Daily Sales Digest</p>
                    <p className="text-body-xs text-on-surface-variant">Receive an end-of-day summary of transactions, revenues, and top products</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.dailySalesDigest}
                    onChange={(e) => setNotifications({ ...notifications, dailySalesDigest: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-lg border border-outline-variant bg-surface-container-low cursor-pointer">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Staff Security & Sign-in Alerts</p>
                    <p className="text-body-xs text-on-surface-variant">Notify when staff members log in from new IP addresses or devices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.staffLoginAlerts}
                    onChange={(e) => setNotifications({ ...notifications, staffLoginAlerts: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary accent-primary"
                  />
                </label>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}