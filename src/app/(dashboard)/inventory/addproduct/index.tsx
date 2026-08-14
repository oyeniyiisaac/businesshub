'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Info,
  Image,
  CloudUpload,
  Inventory2,
  Payments,
  Save,
  QrCodeScanner,
  Warehouse,
} from 'google-material-icons/outlined';

export default function AddProductPage() {
  const [enableLowStockAlerts, setEnableLowStockAlerts] = useState(true);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb Navigation */}
          <nav className="text-body-xs text-on-surface-variant flex items-center gap-1.5 mb-1">
            <Link
              href="/inventory"
              className="hover:text-primary transition-colors"
            >
              Inventory
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-on-surface">Add New Product</span>
          </nav>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Add New Product
          </h1>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/inventory"
            className="px-4 py-2 rounded-DEFAULT border border-outline-variant text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancel
          </Link>
          <button className="bg-primary hover:bg-primary-container text-on-primary font-medium px-4 py-2.5 rounded-DEFAULT flex items-center gap-2 shadow-xs transition-colors">
            <Save className="w-5 h-5" />
            <span>Save Product</span>
          </button>
        </div>
      </div>

      {/* 2. GRID LAYOUT: TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2 COLUMNS: BASIC INFORMATION */}
        <div className="lg:col-span-2 bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
          {/* Section Title */}
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="text-body-md font-bold text-on-surface">
              Basic Information
            </h2>
          </div>

          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-body-xs font-semibold text-on-surface-variant">
                Product Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Samsung Galaxy S23 Ultra"
                className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Category & Brand Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface-variant">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="phones">Mobile Phones</option>
                  <option value="furniture">Furniture</option>
                  <option value="office">Office Supplies</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface-variant">
                  Brand
                </label>
                <select className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                  <option value="">Select Brand</option>
                  <option value="samsung">Samsung</option>
                  <option value="apple">Apple</option>
                  <option value="hp">HP</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-body-xs font-semibold text-on-surface-variant">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter detailed product description..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: MEDIA UPLOAD */}
        <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5 h-full flex flex-col">
          {/* Section Title */}
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
            <Image className="w-5 h-5 text-primary" />
            <h2 className="text-body-md font-bold text-on-surface">Media</h2>
          </div>

          {/* Drag & Drop Zone */}
          <div className="flex-1 border-2 border-dashed border-outline-variant hover:border-primary/60 bg-surface-container-lowest hover:bg-surface-container-low rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
              <CloudUpload className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-body-sm font-semibold text-on-surface mb-1">
              Click to upload or drag & drop
            </p>
            <p className="text-body-xs text-on-surface-variant/80">
              SVG, PNG, JPG or GIF (max. 5MB)
            </p>
            <input type="file" accept="image/*" className="hidden" />
          </div>
        </div>
      </div>

      {/* 3. GRID LAYOUT: MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* INVENTORY & TRACKING CARD */}
        <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
            <Inventory2 className="w-5 h-5 text-primary" />
            <h2 className="text-body-md font-bold text-on-surface">
              Inventory & Tracking
            </h2>
          </div>

          <div className="space-y-4">
            {/* SKU & Unit of Measure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface-variant">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SAM-S23-BLK"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface-variant">
                  Unit of Measure
                </label>
                <select className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                  <option value="pcs">Pcs (Pieces)</option>
                  <option value="box">Box</option>
                  <option value="kg">Kg (Kilograms)</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
            </div>

            {/* Barcode Field with Scan Button */}
            <div className="space-y-1.5">
              <label className="text-body-xs font-semibold text-on-surface-variant">
                Barcode (UPC/EAN)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Scan or enter barcode"
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  className="p-2.5 bg-surface-container border border-outline-variant rounded-DEFAULT text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
                  title="Scan Barcode"
                >
                  <QrCodeScanner className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PRICING & TAX CARD */}
        <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
            <Payments className="w-5 h-5 text-primary" />
            <h2 className="text-body-md font-bold text-on-surface">
              Pricing & Tax
            </h2>
          </div>

          <div className="space-y-4">
            {/* Cost & Selling Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface-variant">
                  Cost Price (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-semibold text-on-surface-variant">
                    ₦
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT pl-8 pr-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-xs font-semibold text-on-surface-variant">
                  Selling Price (₦) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-semibold text-on-surface-variant">
                    ₦
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT pl-8 pr-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Tax Rule */}
            <div className="space-y-1.5">
              <label className="text-body-xs font-semibold text-on-surface-variant">
                Tax Rule
              </label>
              <select className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                <option value="vat_7_5">VAT 7.5%</option>
                <option value="exempt">Tax Exempt (0%)</option>
                <option value="custom">Custom Tax Rate</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INITIAL STOCK LEVEL CARD */}
      <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
          <Warehouse className="w-5 h-5 text-primary" />
          <h2 className="text-body-md font-bold text-on-surface">
            Initial Stock Level
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Initial Quantity */}
          <div className="space-y-1.5">
            <label className="text-body-xs font-semibold text-on-surface-variant">
              Initial Quantity
            </label>
            <input
              type="number"
              defaultValue={0}
              min={0}
              className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Low Stock Threshold */}
          <div className="space-y-1.5">
            <label className="text-body-xs font-semibold text-on-surface-variant">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              defaultValue={5}
              min={1}
              className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Enable Alerts Switch Toggle */}
          <div className="flex items-center gap-3 pb-2">
            <button
              type="button"
              onClick={() => setEnableLowStockAlerts(!enableLowStockAlerts)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableLowStockAlerts ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  enableLowStockAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-body-sm font-semibold text-on-surface select-none">
              Enable Low Stock Alerts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}