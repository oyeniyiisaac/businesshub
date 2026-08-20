"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AccountBalance,
  AutoAwesome,
  Chat,
  Close,
  Email,
  HelpOutline,
  Inventory,
  ManageAccounts,
  Payments,
  Phone,
  PointOfSale,
  QuestionAnswer,
  ReceiptLong,
  RocketLaunch,
  Search,
  Send,
  SupportAgent,
  Visibility,
} from "google-material-icons/outlined";

interface TopicItem {
  id: string;
  icon: any;
  title: string;
  description: string;
  articles: { title: string; excerpt: string }[];
}

const TOPICS: TopicItem[] = [
  {
    id: "getting-started",
    icon: RocketLaunch,
    title: "Getting Started",
    description:
      "Learn the basics of setting up your BusinessHub NG account, adding branches, and inviting team members.",
    articles: [
      {
        title: "Account Setup & Business Verification",
        excerpt: "Step-by-step guide to complete your business profile, TIN verification, and branding.",
      },
      {
        title: "Adding Your First Store Branch",
        excerpt: "Configure multi-store branches, regional timezones, and default currency rules.",
      },
      {
        title: "Inviting Cashiers and Store Managers",
        excerpt: "Create staff accounts and assign granular role-based permissions.",
      },
    ],
  },
  {
    id: "inventory-stock",
    icon: Inventory,
    title: "Inventory & Stock",
    description:
      "Manage your product catalog, track stock levels, handle variations, and configure low-stock alerts.",
    articles: [
      {
        title: "Bulk Uploading Products via CSV",
        excerpt: "How to export template and bulk import 10,000+ SKUs with variants and barcoding.",
      },
      {
        title: "Stock Transfer Between Branches",
        excerpt: "Initiate and accept stock transfers between warehouses and retail outlets.",
      },
      {
        title: "Setting Reorder Points & Low Stock Alerts",
        excerpt: "Automate purchase orders when stock counts fall below safety thresholds.",
      },
    ],
  },
  {
    id: "pos-sales",
    icon: PointOfSale,
    title: "POS & Sales",
    description:
      "Everything you need to know about processing transactions, applying discounts, and receipt printing.",
    articles: [
      {
        title: "Processing Split Tender & Offline Sales",
        excerpt: "Accept split payments with cash, POS card, transfer, and customer debt ledger.",
      },
      {
        title: "Thermal Receipt Printer Setup",
        excerpt: "Connect Bluetooth and USB thermal ESC/POS printers for 58mm and 80mm paper.",
      },
      {
        title: "Barcode Scanner Calibration",
        excerpt: "Pair 1D/2D wireless handheld barcode scanners with BusinessHub NG POS terminal.",
      },
    ],
  },
  {
    id: "payments-payouts",
    icon: Payments,
    title: "Payments & Payouts",
    description:
      "Understand payment gateways, settlement schedules, managing customer credit, and bank transfers.",
    articles: [
      {
        title: "Automated Bank Transfer Verification",
        excerpt: "Receive instant webhook confirmations for customer bank transfers at checkout.",
      },
      {
        title: "Managing Customer Debt & Credit Balances",
        excerpt: "Record credit sales, send WhatsApp payment reminders, and clear outstanding balances.",
      },
      {
        title: "Settlement Timelines & Wallet Payouts",
        excerpt: "Daily and weekly automatic settlement schedules into your registered Nigerian bank account.",
      },
    ],
  },
  {
    id: "account-settings",
    icon: ManageAccounts,
    title: "Account Settings",
    description:
      "Update your business profile, manage subscription plans, configure taxes, and security preferences.",
    articles: [
      {
        title: "Configuring Value Added Tax (VAT & WHT)",
        excerpt: "Set standard 7.5% VAT, zero-rated exemptions, and generate FIRS tax reports.",
      },
      {
        title: "Two-Factor Authentication (2FA)",
        excerpt: "Secure owner and admin accounts with OTP authenticator apps and SMS.",
      },
      {
        title: "Exporting Financial Audit Logs",
        excerpt: "Download immutable timestamped logs of user actions and permission changes.",
      },
    ],
  },
];

export default function SupportPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "Technical Issue",
    message: "",
  });
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePopularTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Find matching topic
    const found = TOPICS.find(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.articles.some((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (found) {
      setSelectedTopic(found);
    } else {
      setSelectedTopic(TOPICS[0]);
    }
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTicketSuccess(true);
      setTimeout(() => {
        setIsContactModalOpen(false);
        setTicketSuccess(false);
        setTicketForm({
          name: "",
          email: "",
          subject: "",
          category: "Technical Issue",
          message: "",
        });
      }, 2000);
    }, 800);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-4 px-2 sm:px-4 font-sans antialiased">
      {/* 1. HERO SEARCH SECTION */}
      <div className="text-center space-y-6 pt-4 sm:pt-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          How can we help you today?
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for articles, guides, or troubleshooting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-lowest border border-outline-variant rounded-DEFAULT pl-10 pr-4 py-3 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-6 py-3 rounded-DEFAULT text-body-sm shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-body-xs">
          <span className="font-semibold text-on-surface-variant">Popular:</span>
          <button
            onClick={() => handlePopularTagClick("Reset Password")}
            className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/70 text-on-surface px-3 py-1 rounded-full transition cursor-pointer"
          >
            Reset Password
          </button>
          <button
            onClick={() => handlePopularTagClick("Add Product")}
            className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/70 text-on-surface px-3 py-1 rounded-full transition cursor-pointer"
          >
            Add Product
          </button>
          <button
            onClick={() => handlePopularTagClick("Export Report")}
            className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/70 text-on-surface px-3 py-1 rounded-full transition cursor-pointer"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* 2. BROWSE BY TOPIC SECTION */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">
          Browse by Topic
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* 5 Topic Cards */}
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="bg-surface-lowest border border-outline-variant/80 hover:border-primary/60 rounded-xl p-6 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-body-xs text-on-surface-variant leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="pt-2 text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                  <span>View Guides & Articles</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}

          {/* 6. Special Card: Still need help? */}
          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-6 flex flex-col items-center text-center justify-between space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <SupportAgent className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">
                Still need help?
              </h3>
              <p className="text-body-xs text-on-surface-variant max-w-xs">
                Our dedicated support team is ready to assist you.
              </p>
            </div>

            <button
              onClick={() => setIsContactModalOpen(true)}
              className="border border-outline-variant bg-surface-lowest hover:bg-surface text-on-surface font-semibold py-2 px-5 rounded-DEFAULT text-body-xs shadow-2xs transition cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Direct Contact Channels Box */}
      <div className="bg-surface-lowest border border-outline-variant/80 rounded-xl p-6 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-body-xs font-bold text-on-surface">Phone & WhatsApp</p>
            <p className="text-body-xs text-on-surface-variant font-mono mt-0.5">+234 800 287 4637</p>
            <p className="text-[11px] text-on-surface-variant/80 mt-0.5">Mon - Fri: 8am - 6pm</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Email className="w-4 h-4" />
          </div>
          <div>
            <p className="text-body-xs font-bold text-on-surface">Email Support</p>
            <p className="text-body-xs text-on-surface-variant font-mono mt-0.5">support@businesshub.ng</p>
            <p className="text-[11px] text-on-surface-variant/80 mt-0.5">Responses within 2 hours</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Chat className="w-4 h-4" />
          </div>
          <div>
            <p className="text-body-xs font-bold text-on-surface">Live Ticket Assistance</p>
            <p className="text-body-xs text-on-surface-variant mt-0.5">Direct chat with enterprise agents</p>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-[11px] font-bold text-primary hover:underline mt-0.5 cursor-pointer block"
            >
              Open Ticket →
            </button>
          </div>
        </div>
      </div>

      {/* Article Viewer Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-lowest rounded-xl border border-outline-variant w-full max-w-2xl p-6 shadow-xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  {React.createElement(selectedTopic.icon, { className: "w-4 h-4" })}
                </div>
                <h3 className="text-lg font-bold text-on-surface">
                  {selectedTopic.title} Documentation
                </h3>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <p className="text-body-xs text-on-surface-variant">
              {selectedTopic.description}
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-body-xs font-bold text-on-surface uppercase tracking-wider">
                Featured Guides & Tutorials
              </h4>

              <div className="space-y-3">
                {selectedTopic.articles.map((art, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-outline-variant/80 rounded-lg hover:border-primary/60 hover:bg-surface-container-low/40 transition space-y-1 cursor-pointer"
                  >
                    <p className="text-body-sm font-bold text-on-surface text-primary">
                      {art.title}
                    </p>
                    <p className="text-body-xs text-on-surface-variant">
                      {art.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
              <span className="text-xs text-on-surface-variant">
                Need more help with {selectedTopic.title}?
              </span>
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setIsContactModalOpen(true);
                }}
                className="px-4 py-2 bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold rounded-DEFAULT text-body-xs transition shadow-xs cursor-pointer"
              >
                Ask Support Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support / Ticket Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-lowest rounded-xl border border-outline-variant w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <SupportAgent className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-on-surface">
                  Contact BusinessHub Support
                </h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            {ticketSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <AutoAwesome className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-800">
                  Support Ticket Received!
                </h4>
                <p className="text-body-xs text-emerald-700">
                  Your ticket reference is <strong>#TKT-{Math.floor(100000 + Math.random() * 900000)}</strong>. Our team will contact you via email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendTicket} className="space-y-4 text-body-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Admin"
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Category
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Billing & Payments">Billing & Payments</option>
                      <option value="POS & Hardware">POS & Hardware</option>
                      <option value="Inventory & Sync">Inventory & Sync</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your inquiry"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Message Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what you need assistance with..."
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-DEFAULT border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-4 py-2 border border-outline-variant text-on-surface font-semibold rounded-DEFAULT hover:bg-surface-container transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold rounded-DEFAULT transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? "Sending..." : "Submit Ticket"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
