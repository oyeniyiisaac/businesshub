'use client';

import { CreditCard, Filter, TrendingUp } from 'google-material-icons/filled';
import { AttachMoney, Download, MoreVert, ShoppingBag, Warning } from 'google-material-icons/outlined';
import React from 'react';


export default function OverviewPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-on-surface font-bold">Overview</h1>
          <p className="text-body-sm text-on-surface-variant">
            Today's snapshot for Enterprise Admin
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="inline-flex items-center bg-surface-container border border-outline-variant rounded-DEFAULT p-1 text-body-sm font-medium">
          <button className="px-3 py-1 bg-surface-lowest text-on-surface shadow-xs rounded-sm font-semibold">
            Today
          </button>
          <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface">
            7D
          </button>
          <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface">
            30D
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              TOTAL REVENUE
            </span>
            <div className="p-2 bg-primary-container/10 rounded-md">
              <AttachMoney className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-headline-xl font-bold text-on-surface text-data-tabular">
              ₦4.2M
            </p>
            <p className="text-body-sm text-primary font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> +12.5% vs last week
            </p>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              TOTAL SALES
            </span>
            <div className="p-2 bg-secondary-container/20 rounded-md">
              <ShoppingBag className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-headline-xl font-bold text-on-surface text-data-tabular">
              842
            </p>
            <p className="text-body-sm text-primary font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> +5.2% vs last week
            </p>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              NET PROFIT
            </span>
            <div className="p-2 bg-primary-container/10 rounded-md">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-headline-xl font-bold text-on-surface text-data-tabular">
              ₦1.8M
            </p>
            <p className="text-body-sm text-primary font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> +8.1% vs last week
            </p>
          </div>
        </div>

        {/* Card 4: Expenses */}
        <div className="bg-surface-lowest border border-outline-variant p-5 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant font-bold">
              EXPENSES
            </span>
            <div className="p-2 bg-tertiary-container/20 rounded-md">
              <CreditCard className="w-4 h-4 text-tertiary" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-headline-xl font-bold text-on-surface text-data-tabular">
              ₦950K
            </p>
            <p className="text-body-sm text-tertiary font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" /> +2.4% vs last week
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Sales Trend & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart Visual */}
        <div className="lg:col-span-2 bg-surface-lowest border border-outline-variant p-6 rounded-lg shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-headline-lg text-on-surface">Sales Trend</h2>
              <p className="text-body-sm text-on-surface-variant">
                Weekly revenue breakdown
              </p>
            </div>
            <button className="text-body-sm font-semibold text-primary hover:text-primary-container flex items-center gap-1">
              Export <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart Graphics */}
          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-4">
            {[
              { day: 'MON', val: '40%', active: false },
              { day: 'TUE', val: '60%', active: false },
              { day: 'WED', val: '80%', active: false },
              { day: 'THU', val: '95%', active: true },
              { day: 'FRI', val: '70%', active: false },
              { day: 'SAT', val: '50%', active: false },
              { day: 'SUN', val: '25%', active: false },
            ].map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    bar.active
                      ? 'bg-primary'
                      : 'bg-primary-container/30 hover:bg-primary-container/50'
                  }`}
                  style={{ height: bar.val }}
                />
                <span className="text-label-caps text-on-surface-variant">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Widget */}
        <div className="bg-surface-lowest border border-outline-variant p-6 rounded-lg shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Warning className="w-5 h-5 text-tertiary" />
                <h2 className="text-headline-lg text-on-surface">Low Stock</h2>
              </div>
              <button className="text-body-sm font-semibold text-primary hover:underline">
                View All
              </button>
            </div>

            {/* Low Stock Items List */}
            <div className="space-y-3">
              {[
                { name: 'Premium Palm O...', sku: 'SKU: PO-005', count: 2 },
                { name: 'Parboiled Rice...', sku: 'SKU: RC-010', count: 5 },
                { name: 'Industrial Bleach...', sku: 'SKU: CL-102', count: 12 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-low border border-outline-variant p-3 rounded-md flex items-center justify-between"
                >
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-on-surface-variant font-mono">
                      {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-label-caps text-tertiary font-bold px-2 py-0.5 bg-tertiary-container/20 rounded-sm">
                      {item.count} Left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-2 border border-outline hover:bg-surface-container text-body-sm font-semibold text-on-surface rounded-DEFAULT transition-colors uppercase tracking-wider">
            REORDER SELECTED
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-lg text-on-surface">
            Recent Transactions
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-surface-container rounded-DEFAULT text-on-surface-variant">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-surface-container rounded-DEFAULT text-on-surface-variant">
              <MoreVert className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant text-label-caps text-on-surface-variant bg-surface-container-low">
                <th className="py-3 px-4">TXN ID</th>
                <th className="py-3 px-4">DATE & TIME</th>
                <th className="py-3 px-4">CUSTOMER / REF</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AMOUNT (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 text-body-sm">
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-medium text-on-surface">
                  #TRX-8902
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">
                  Today, 14:32
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-on-surface">
                    Adebayo & Sons Ltd
                  </p>
                  <p className="text-[12px] text-on-surface-variant">
                    Wholesale Order
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-caps bg-primary-container/15 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Paid
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right text-data-tabular text-headline-lg-mobile text-on-surface">
                  145,000.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}