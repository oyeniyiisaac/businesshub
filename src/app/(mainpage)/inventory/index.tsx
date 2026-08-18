'use client';

import React, { useState } from 'react';
import { 
  Add, 
  Search, 
  FileDownload, 
  Edit, 
  Delete, 
  Laptop, 
  Print, 
  Chair 
} from 'google-material-icons/outlined';
import { useRouter } from 'next/navigation';

// Sample mock data matching the screenshot
const initialProducts = [
  {
    id: '1',
    name: 'MacBook Pro 16" M2',
    sku: 'APP-MBP-16-M2',
    category: 'Electronics',
    price: 1450000,
    stock: 43,
    status: 'In Stock',
    icon: Laptop,
  },
  {
    id: '2',
    name: 'HP LaserJet Pro',
    sku: 'HP-LJP-M404dn',
    category: 'Office Supplies',
    price: 285000,
    stock: 2,
    status: 'Low Stock',
    icon: Print,
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    sku: 'FUR-ERG-001',
    category: 'Furniture',
    price: 120000,
    stock: 12,
    status: 'In Stock',
    icon: Chair,
  },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers');
  const [filters, setFilters] = useState({
    inStock: true,
    lowStock: true,
    outOfStock: false,
  });
  const router = useRouter();
  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Inventory
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage stock, track SKUs, and handle intake.
          </p>
        </div>

        {/* Action Button */}
        <button onClick={() => {router.push('/inventory/addproduct')}} className="bg-primary hover:bg-primary-container text-on-primary font-medium px-4 py-2.5 rounded-DEFAULT flex items-center justify-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer">
          <Add className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* 2. MAIN CONTENT GRID (FILTERS + TABLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN: FILTERS CARD */}
        <div className="bg-surface-lowest border border-outline-variant rounded-lg p-5 space-y-6">
          <h3 className="text-body-sm font-bold text-on-surface uppercase tracking-wider">
            FILTERS
          </h3>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-body-xs font-semibold text-on-surface-variant">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="All Categories">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>

          {/* Supplier Select */}
          <div className="space-y-1.5">
            <label className="text-body-xs font-semibold text-on-surface-variant">
              Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="All Suppliers">All Suppliers</option>
              <option value="Apple Inc.">Apple Inc.</option>
              <option value="HP Official">HP Official</option>
              <option value="FlexiSpot">FlexiSpot</option>
            </select>
          </div>

          {/* Stock Status Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="text-body-xs font-semibold text-on-surface-variant block">
              Stock Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={() => handleFilterChange('inStock')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span className="font-medium text-emerald-700">In Stock</span>
              </label>

              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.lowStock}
                  onChange={() => handleFilterChange('lowStock')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span className="font-medium text-rose-600">LOW STOCK</span>
              </label>

              <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.outOfStock}
                  onChange={() => handleFilterChange('outOfStock')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span className="font-medium text-on-surface-variant">Out of Stock</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INVENTORY TABLE CARD */}
        <div className="lg:col-span-3 bg-surface-lowest border border-outline-variant rounded-lg p-5 space-y-4">
          
          {/* Search & Export Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT pl-9 pr-4 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <button 
              className="p-2 border border-outline-variant rounded-DEFAULT hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors self-end sm:self-auto"
              title="Export Data"
            >
              <FileDownload className="w-5 h-5" />
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border-t border-outline-variant/60 pt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/60 text-body-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">SKU/Barcode</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price (₦)</th>
                  <th className="py-3 px-3">Stock Level</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-body-sm">
                {initialProducts.map((product) => {
                  const ProductIcon = product.icon;
                  const isLowStock = product.status === 'Low Stock';

                  return (
                    <tr key={product.id} className="hover:bg-surface-container-lowest transition-colors">
                      {/* Product Name & Icon */}
                      <td className="py-3.5 px-3 font-medium text-on-surface">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
                            <ProductIcon className="w-4 h-4 text-on-surface-variant" />
                          </div>
                          <span>{product.name}</span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-3 font-mono text-body-xs text-on-surface-variant">
                        {product.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-on-surface-variant">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 font-semibold text-on-surface">
                        {product.price.toLocaleString()}
                      </td>

                      {/* Stock Level Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isLowStock
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {product.stock} {product.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-DEFAULT text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-DEFAULT text-on-surface-variant hover:bg-rose-50 hover:text-rose-600 transition-colors">
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

          {/* Table Footer / Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/60 text-body-xs text-on-surface-variant">
            <span>Showing 1 to 3 of 124 entries</span>

            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 rounded-DEFAULT border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 transition-colors">
                Prev
              </button>
              <button className="px-3 py-1.5 rounded-DEFAULT bg-primary text-on-primary font-bold shadow-xs">
                1
              </button>
              <button className="px-3 py-1.5 rounded-DEFAULT border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 rounded-DEFAULT border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
                3
              </button>
              <button className="px-3 py-1.5 rounded-DEFAULT border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                Next
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}