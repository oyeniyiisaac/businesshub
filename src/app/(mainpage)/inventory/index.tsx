"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Add, 
  Search, 
  FileDownload, 
  Edit, 
  Delete, 
  Laptop, 
  Print, 
  Chair,
  Category,
  Inventory2
} from "google-material-icons/outlined";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/src/context/PermissionsContext";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSupplier, setSelectedSupplier] = useState("All Suppliers");
  const [filters, setFilters] = useState({
    inStock: true,
    lowStock: true,
    outOfStock: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
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
            query GetInventoryProducts {
              products {
                id
                name
                category
                supplier
                pricing {
                  sellingPrice
                }
                stockLevel {
                  initialQuantity
                  lowStockThreshold
                }
                inventoryTracking {
                  sku
                }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.products) {
        const mapped: InventoryItem[] = result.data.products.map((p: any) => {
          const stock = p.stockLevel?.initialQuantity ?? 0;
          const threshold = p.stockLevel?.lowStockThreshold ?? 5;
          let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
          if (stock === 0) status = "Out of Stock";
          else if (stock <= threshold) status = "Low Stock";

          return {
            id: p.id,
            name: p.name,
            sku: p.inventoryTracking?.sku || `SKU-${p.id.slice(-4)}`,
            category: p.category || "General",
            supplier: p.supplier || "Main Warehouse",
            price: p.pricing?.sellingPrice || 0,
            stock,
            lowStockThreshold: threshold,
            status,
          };
        });

        setProducts(mapped);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!canDelete("inventory")) {
      alert("You do not have permission to delete inventory items.");
      return;
    }

    if (!confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      return;
    }

    // Optimistic UI removal
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            mutation DeleteProduct($id: ID!) {
              deleteProduct(id: $id)
            }
          `,
          variables: { id },
        }),
      });
      fetchProducts();
    } catch {
      // ignore
    }
  };

  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dynamic Categories & Suppliers
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All Categories", ...list];
  }, [products]);

  const suppliers = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.supplier).filter(Boolean)));
    return ["All Suppliers", ...list];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = selectedCategory === "All Categories" || p.category === selectedCategory;
      const matchSup = selectedSupplier === "All Suppliers" || p.supplier === selectedSupplier;

      let matchStockStatus = false;
      if (p.status === "In Stock" && filters.inStock) matchStockStatus = true;
      if (p.status === "Low Stock" && filters.lowStock) matchStockStatus = true;
      if (p.status === "Out of Stock" && filters.outOfStock) matchStockStatus = true;

      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      return matchCat && matchSup && matchStockStatus && matchQuery;
    });
  }, [products, searchQuery, selectedCategory, selectedSupplier, filters]);

  const inStockCount = useMemo(() => products.filter((p) => p.status === "In Stock").length, [products]);
  const lowStockCount = useMemo(() => products.filter((p) => p.status === "Low Stock").length, [products]);
  const outOfStockCount = useMemo(() => products.filter((p) => p.status === "Out of Stock").length, [products]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Product Name,SKU,Category,Supplier,Price (NGN),Stock Quantity,Status"]
        .concat(
          filteredProducts.map(
            (p) => `"${p.name}","${p.sku}","${p.category}","${p.supplier}","${p.price}","${p.stock}","${p.status}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_catalog_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans antialiased">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Inventory & Catalog
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage product stock, track SKUs, suppliers, and live intake.
          </p>
        </div>

        {/* Action Button */}
        {canCreate("inventory") && (
          <button
            onClick={() => { router.push("/inventory/addproduct"); }}
            className="bg-[#005f37] hover:bg-[#004e2d] text-white font-semibold px-4 py-2.5 rounded-DEFAULT flex items-center justify-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Add className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* 2. MAIN CONTENT GRID (FILTERS + TABLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="lg:hidden col-span-1">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between bg-surface-lowest border border-outline-variant/80 rounded-xl p-4 shadow-2xs cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 font-bold text-body-xs uppercase tracking-wider text-on-surface">
              <Category className="w-4 h-4 text-primary" />
              <span>FILTERS & CATEGORIES ({filteredProducts.length} items)</span>
            </div>
            <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-emerald-50 rounded">
              {showMobileFilters ? "Hide Filters ▲" : "Show Filters ▼"}
            </span>
          </button>
        </div>

        {/* LEFT COLUMN: FILTERS CARD */}
        <div className={`${showMobileFilters ? "block" : "hidden lg:block"} bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 space-y-6 shadow-2xs`}>
          <h3 className="text-body-xs font-bold text-on-surface uppercase tracking-wider">
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
              className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer shadow-2xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
              className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer shadow-2xs"
            >
              {suppliers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="text-body-xs font-semibold text-on-surface-variant">
              Stock Status
            </label>
            <div className="space-y-2 text-body-xs">
              <label className="flex items-center gap-2 cursor-pointer text-on-surface">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={() => handleFilterChange("inStock")}
                  className="rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <span>In Stock ({inStockCount})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-on-surface">
                <input
                  type="checkbox"
                  checked={filters.lowStock}
                  onChange={() => handleFilterChange("lowStock")}
                  className="rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <span className="text-amber-700 font-semibold">Low Stock ({lowStockCount})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-on-surface">
                <input
                  type="checkbox"
                  checked={filters.outOfStock}
                  onChange={() => handleFilterChange("outOfStock")}
                  className="rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                />
                <span className="text-rose-700 font-semibold">Out of Stock ({outOfStockCount})</span>
              </label>
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={() => {
              setSelectedCategory("All Categories");
              setSelectedSupplier("All Suppliers");
              setFilters({ inStock: true, lowStock: true, outOfStock: true });
              setSearchQuery("");
            }}
            className="w-full text-body-xs font-semibold text-primary hover:text-primary-container text-center pt-2 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>

        {/* RIGHT COLUMN: SEARCH + INVENTORY TABLE CARD */}
        <div className="lg:col-span-3 bg-surface-lowest border border-outline-variant/80 rounded-xl p-5 space-y-4 shadow-2xs">
          
          {/* Top Controls: Search Bar + Export */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name, SKU, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low/60 border border-outline-variant rounded-DEFAULT pl-9 pr-4 py-2 text-body-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-4 py-2 rounded-DEFAULT border border-outline-variant text-body-xs font-semibold text-on-surface hover:bg-surface-container flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <FileDownload className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-xs">
              <thead>
                <tr className="border-b border-outline-variant/80 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/50">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Price (₦)</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredProducts.map((product) => {
                  const isInStock = product.status === "In Stock";
                  const isLowStock = product.status === "Low Stock";

                  return (
                    <tr key={product.id} className="hover:bg-surface-container-low/40 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-DEFAULT bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
                            <Inventory2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface leading-tight">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-on-surface-variant font-mono">
                              {product.sku} · <span className="text-slate-500 font-sans">{product.supplier}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-on-surface">
                        ₦ {product.price.toLocaleString()}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                            isInStock
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isLowStock
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {product.stock} units ({product.status})
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit("inventory") && (
                            <button
                              onClick={() => router.push("/inventory/addproduct")}
                              className="p-1.5 rounded border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete("inventory") && (
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-1.5 rounded border border-rose-200/60 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Delete className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-on-surface-variant text-body-sm space-y-1">
                      <p className="font-semibold text-on-surface">No products match the selected criteria</p>
                      <p className="text-xs">Adjust your search or filter settings to view records.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/60 text-body-xs text-on-surface-variant">
            <span>Showing 1 to {filteredProducts.length} of {products.length} products</span>

            <div className="flex items-center gap-1 font-medium">
              <button className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer">
                Previous
              </button>
              <button className="px-3 py-1.5 rounded border border-outline-variant bg-surface-lowest text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
                Next
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}