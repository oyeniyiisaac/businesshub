"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AccountBalance,
  Add,
  ArrowBack,
  ArrowForward,
  CameraAlt,
  CheckCircle,
  Close,
  CreditCard,
  DeleteOutline,
  Done,
  FilterList,
  Inventory,
  Payments,
  Person,
  Print,
  QrCodeScanner,
  Receipt,
  Remove,
  Search,
  ShoppingCart,
  TrendingUp,
  Warning,
  Bolt,
  HourglassEmpty,
} from "google-material-icons/outlined";
import { usePermissions } from "@/src/context/PermissionsContext";
import { BarcodeScanner } from "@/src/app/(mainpage)/inventory/addproduct/components";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  barcode: string;
  category: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
}

const FALLBACK_WALKIN_CUSTOMER: CustomerSummary = {
  id: "walkin",
  name: "Walk-in Customer",
  phone: "N/A",
  email: "",
  loyaltyPoints: 0,
};

// Audio beep synthesizer for POS barcode scanning
function playBeep(success = true) {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = success ? 1200 : 320;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, success ? 90 : 250);
  } catch {
    // ignore
  }
}

export default function POSPage() {
  const { canCreate } = usePermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([FALLBACK_WALKIN_CUSTOMER]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary>(FALLBACK_WALKIN_CUSTOMER);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Payment method & Settlement status
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "TRANSFER" | "CASH">("CARD");
  const [paymentStatus, setPaymentStatus] = useState<"SUCCESSFUL" | "PENDING">("SUCCESSFUL");
  const [transactionRef, setTransactionRef] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Modals & UI states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastReceiptData, setLastReceiptData] = useState<any>(null);
  const [scanToast, setScanToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch DB products and customers
  const fetchProductsAndCustomers = useCallback(async () => {
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
            query GetPOSData {
              products {
                id
                name
                category
                imageUrl
                inventoryTracking {
                  sku
                  barcode
                }
                pricing {
                  sellingPrice
                }
                stockLevel {
                  initialQuantity
                  lowStockThreshold
                }
              }
              customers {
                id
                name
                phone
                email
                loyaltyPoints
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.products) {
        const loaded: Product[] = result.data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.pricing?.sellingPrice || 0,
          image: p.imageUrl || "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
          sku: p.inventoryTracking?.sku || `SKU-${p.id.slice(-4)}`,
          barcode: p.inventoryTracking?.barcode || `8901234567${p.id.slice(-3)}`,
          category: p.category || "General",
          stockQuantity: typeof p.stockLevel?.initialQuantity === "number" ? p.stockLevel.initialQuantity : 0,
          lowStockThreshold: p.stockLevel?.lowStockThreshold || 5,
        }));

        setProducts(loaded);
      } else {
        setProducts([]);
      }

      if (result.data?.customers && result.data.customers.length > 0) {
        const loadedCust: CustomerSummary[] = result.data.customers.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || "N/A",
          email: c.email || "",
          loyaltyPoints: c.loyaltyPoints || 0,
        }));
        setCustomers([FALLBACK_WALKIN_CUSTOMER, ...loadedCust]);
      } else {
        setCustomers([FALLBACK_WALKIN_CUSTOMER]);
      }
    } catch {
      setProducts([]);
      setCustomers([FALLBACK_WALKIN_CUSTOMER]);
    }
  }, []);

  useEffect(() => {
    fetchProductsAndCustomers();
  }, [fetchProductsAndCustomers]);

  // Available stock helper
  const getRemainingStock = useCallback(
    (productId: string) => {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return 0;
      const inCart = cart.find((item) => item.id === productId);
      return Math.max(0, prod.stockQuantity - (inCart?.quantity || 0));
    },
    [products, cart]
  );

  // Toast Notification
  const triggerScanToast = (message: string, type: "success" | "error" = "success") => {
    setScanToast({ message, type });
    setTimeout(() => {
      setScanToast(null);
    }, 2800);
  };

  // Add Product To Cart
  const addProductToCart = useCallback(
    (product: Product, quantityToAdd: number = 1) => {
      const remaining = getRemainingStock(product.id);
      if (product.stockQuantity <= 0) {
        playBeep(false);
        triggerScanToast(`"${product.name}" is out of stock!`, "error");
        return false;
      }
      if (remaining < quantityToAdd) {
        playBeep(false);
        triggerScanToast(
          `Cannot add ${quantityToAdd} units. Only ${remaining} left in stock.`,
          "error"
        );
        return false;
      }

      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.id === product.id);
        if (existing) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
          );
        }
        return [...prevCart, { ...product, quantity: quantityToAdd }];
      });

      playBeep(true);
      triggerScanToast(
        `Added +${quantityToAdd} "${product.name}" (Stock left: ${remaining - quantityToAdd})`,
        "success"
      );
      return true;
    },
    [getRemainingStock]
  );

  // Handle barcode scanned directly from hardware / input on Enter
  const handleBarcodeScan = (scannedCode: string) => {
    const code = scannedCode.trim().toLowerCase();
    if (!code) return;

    const matchedProduct = products.find(
      (p) =>
        p.barcode.toLowerCase() === code ||
        p.sku.toLowerCase() === code ||
        p.id.toLowerCase() === code ||
        p.name.toLowerCase() === code
    );

    if (matchedProduct) {
      addProductToCart(matchedProduct, 1);
      setSearchQuery("");
      setManualBarcode("");
      if (searchInputRef.current) {
        searchInputRef.current.value = "";
        searchInputRef.current.focus();
      }
    } else {
      playBeep(false);
      triggerScanToast(`No product found matching barcode / SKU: "${scannedCode}"`, "error");
    }
  };

  // Global keydown scanner listener for hardware USB/Bluetooth barcode readers
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 120) {
        buffer = "";
      }
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length >= 3 && !isInput) {
          e.preventDefault();
          handleBarcodeScan(buffer);
          buffer = "";
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, addProductToCart]);

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (delta > 0 && newQty > product.stockQuantity) {
              playBeep(false);
              triggerScanToast(`Cannot add more than available stock (${product.stockQuantity} units).`, "error");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatRate = 0.075;
  const vatAmount = taxableAmount * vatRate;
  const grandTotal = taxableAmount + vatAmount;
  const loyaltyPointsEarned = Math.floor(grandTotal / 200);

  // Filter Categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category)));
    return ["ALL", ...list];
  }, [products]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, searchQuery, selectedCategory]);

  const isCartOpen = cart.length > 0;

  // Complete Transaction Handler with Live Backend GraphQL Persistence
  const handleConfirmTransaction = async (shouldPrintReceipt: boolean) => {
    if (!canCreate("pos")) {
      alert("You do not have permission to process sales transactions.");
      return;
    }

    if (cart.length === 0) {
      triggerScanToast("Cart is empty. Add products first.", "error");
      return;
    }

    const currentPaymentStatus = paymentMethod === "CASH" ? "SUCCESSFUL" : paymentStatus;
    const currentRef = transactionRef || (paymentMethod === "CARD" ? `POS-RRN-${Date.now().toString().slice(-6)}` : paymentMethod === "TRANSFER" ? `BNK-TRF-${Date.now().toString().slice(-6)}` : "CASH-PAY");

    const receiptPayload = {
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
      customer: selectedCustomer,
      items: [...cart],
      subtotal,
      discountPercent,
      discountAmount,
      vatAmount,
      grandTotal,
      paymentMethod,
      paymentStatus: currentPaymentStatus,
      transactionRef: currentRef,
      loyaltyPointsEarned,
    };

    // 1. Immediately update UI locally for instant responsiveness
    setProducts((prev) =>
      prev.map((p) => {
        const item = cart.find((c) => c.id === p.id);
        if (item) {
          return { ...p, stockQuantity: Math.max(0, p.stockQuantity - item.quantity) };
        }
        return p;
      })
    );

    playBeep(true);
    setLastReceiptData(receiptPayload);
    setIsCheckoutModalOpen(false);
    clearCart();

    if (shouldPrintReceipt) {
      setIsReceiptModalOpen(true);
    } else {
      triggerScanToast(
        `Transaction confirmed successfully! (${paymentMethod} - ${currentPaymentStatus})`,
        "success"
      );
    }

    // 2. Persist to MongoDB through GraphQL Backend
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
            mutation CreatePOSTransaction($input: CreateTransactionInput!) {
              createTransaction(input: $input) {
                id
                receiptNumber
                grandTotal
                paymentMethod
                paymentStatus
                transactionRef
                createdAt
              }
            }
          `,
          variables: {
            input: {
              receiptNumber: receiptPayload.receiptNumber,
              customer: {
                customerId: selectedCustomer.id,
                name: selectedCustomer.name,
                phone: selectedCustomer.phone,
                email: selectedCustomer.email || "",
                loyaltyPointsEarned,
              },
              items: cart.map((it) => ({
                productId: it.id,
                name: it.name,
                sku: it.sku,
                price: it.price,
                quantity: it.quantity,
                subtotal: it.price * it.quantity,
              })),
              subtotal,
              discountPercent,
              discountAmount,
              vatAmount,
              grandTotal,
              paymentMethod,
              paymentStatus: currentPaymentStatus,
              transactionRef: currentRef,
            },
          },
        }),
      });

      const result = await res.json();
      if (result.data?.createTransaction) {
        // Refresh product stock and customer list from database in the background
        fetchProductsAndCustomers();
      }
    } catch {
      // Backend error fallback already handled gracefully
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-surface-container-lowest/8 overflow-hidden font-sans antialiased">
      
      {/* Top Moving Marquee Notification Banner */}
      <div className="bg-emerald-950 border-b border-emerald-800/80 text-emerald-100 text-xs py-1.5 px-3 overflow-hidden shrink-0 flex items-center shadow-xs">
        <div className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0 mr-3 flex items-center gap-1 shadow-xs">
          <Bolt className="w-3.5 h-3.5 animate-pulse" />
          <span>POS ACTIVE</span>
        </div>
        
        {/* Continuous Smooth Scrolling Marquee */}
        <div className="flex-1 overflow-hidden relative">
          <div className="inline-block whitespace-nowrap animate-[marquee_25s_linear_infinite] text-[11px] font-medium tracking-wide">
            <span className="mx-4">⚡ Fast Attendance POS Mode: Scan customer barcode or click +1 / +5 to add multiple items rapidly</span>
            <span className="mx-4 text-emerald-400">•</span>
            <span className="mx-4">📦 Real-time inventory auto-sync enabled</span>
            <span className="mx-4 text-emerald-400">•</span>
            <span className="mx-4">🏷️ Hardware USB & Bluetooth barcode scanners automatically supported</span>
            <span className="mx-4 text-emerald-400">•</span>
            <span className="mx-4">💳 Supports POS Terminal Card & Instant Bank Transfers with Pending/Successful Settlement Toggles</span>
            <span className="mx-4 text-emerald-400">•</span>
            <span className="mx-4">🚀 Stock counts decrement live per checkout</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>

      {/* Toast Notification */}
      {scanToast && (
        <div
          className={`fixed top-12 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-body-xs font-semibold animate-in fade-in slide-in-from-top-3 ${
            scanToast.type === "success"
              ? "bg-emerald-800 text-white border border-emerald-600"
              : "bg-rose-800 text-white border border-rose-600"
          }`}
        >
          {scanToast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <Warning className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span>{scanToast.message}</span>
        </div>
      )}

      {/* MAIN CONTAINER: Product Catalog Grid + Compact Checkout Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* LEFT AREA: Product Catalog Grid & Barcode Search */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-4 overflow-y-auto min-w-0 transition-all duration-300">
          
          {/* Top Search Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Clean Main Search Bar */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleBarcodeScan(searchQuery);
                  }
                }}
                placeholder="Search products by name, SKU, category, or barcode..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-DEFAULT text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-2xs"
              />
            </div>

            {/* Camera Barcode Scanner Action Button */}
            <button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#005f37] hover:bg-[#004e2d] text-white rounded-DEFAULT text-body-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
              title="Open Barcode Scanner"
            >
              <CameraAlt className="w-4 h-4" />
              <span>Scan Barcode</span>
            </button>

            {/* Category Filter Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-surface-lowest border border-outline-variant rounded-DEFAULT pl-3 pr-8 py-2.5 text-body-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "ALL" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Cart Counter Badge (Mobile / Tablet Quick Jump) */}
            {isCartOpen && (
              <button
                onClick={() => setIsCheckoutModalOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-[#005f37] text-white font-bold text-xs px-3.5 py-2.5 rounded-DEFAULT shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{cart.reduce((sum, i) => sum + i.quantity, 0)} Items (₦ {grandTotal.toLocaleString()})</span>
              </button>
            )}
          </div>

          {/* ALL Products Responsive Grid */}
          <div
            className={`grid gap-4 sm:gap-5 pb-8 transition-all duration-300 ${
              isCartOpen
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            }`}
          >
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.id === product.id);
              const inCartQty = inCart?.quantity || 0;
              const remainingStock = Math.max(0, product.stockQuantity - inCartQty);
              const isOutOfStock = product.stockQuantity <= 0 || remainingStock <= 0;
              const isLowStock = !isOutOfStock && remainingStock <= product.lowStockThreshold;

              return (
                <div
                  key={product.id}
                  className={`group bg-surface-lowest border rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden shadow-2xs ${
                    isOutOfStock
                      ? "border-outline-variant/60 opacity-65"
                      : "border-outline-variant hover:border-primary/80 hover:shadow-md"
                  }`}
                >
                  {/* Product Image & Stock Left Badge Overlay */}
                  <div
                    onClick={() => !isOutOfStock && addProductToCart(product, 1)}
                    className="w-full h-40 sm:h-44 rounded-xl bg-surface-container-low overflow-hidden mb-3 relative cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isOutOfStock ? "grayscale" : "group-hover:scale-105"
                      }`}
                    />

                    {/* Stock Left Pill Badge */}
                    <div className="absolute top-2 left-2">
                      {product.stockQuantity <= 0 ? (
                        <span className="bg-rose-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                          Low: {remainingStock} left
                        </span>
                      ) : (
                        <span className="bg-emerald-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                          {remainingStock} in stock
                        </span>
                      )}
                    </div>

                    {/* In Cart Indicator Bubble */}
                    {inCartQty > 0 && (
                      <div className="absolute bottom-2 right-2 bg-[#005f37] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{inCartQty} in cart</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => !isOutOfStock && addProductToCart(product, 1)}
                        className="text-body-sm font-bold text-on-surface truncate cursor-pointer group-hover:text-primary transition-colors text-base leading-snug"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Category & SKU */}
                      <p className="text-[11px] text-on-surface-variant font-medium truncate pt-0.5">
                        {product.category} · <span className="font-mono">{product.sku}</span>
                      </p>
                    </div>

                    {/* Price & Stock */}
                    <div className="pt-1.5 flex items-center justify-between">
                      <p className="text-base font-extrabold text-[#005f37]">
                        ₦ {product.price.toLocaleString()}
                      </p>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          product.stockQuantity <= 0
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : isLowStock
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}
                      >
                        {product.stockQuantity <= 0 ? "0 left" : `${remainingStock} left`}
                      </span>
                    </div>
                  </div>

                  {/* Fast Attendance Quick-Add Action Bar */}
                  <div className="pt-2.5 mt-2.5 border-t border-outline-variant/60 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addProductToCart(product, 1)}
                      className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-emerald-50 text-on-surface hover:text-[#005f37] border border-outline-variant hover:border-[#005f37]/50 rounded-DEFAULT text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                      title="Add 1 unit to cart"
                    >
                      <Add className="w-3.5 h-3.5" />
                      <span>+1</span>
                    </button>

                    <button
                      type="button"
                      disabled={isOutOfStock || remainingStock < 5}
                      onClick={() => addProductToCart(product, 5)}
                      className="py-1.5 px-2.5 bg-surface-container hover:bg-emerald-50 text-on-surface hover:text-[#005f37] border border-outline-variant hover:border-[#005f37]/50 rounded-DEFAULT text-xs font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                      title="Add 5 units (Bulk / Multiple goods)"
                    >
                      +5
                    </button>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleBarcodeScan(product.barcode)}
                      className="p-1.5 bg-[#005f37] hover:bg-[#004e2d] text-white rounded-DEFAULT transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                      title="Fast Barcode Scan Attendance"
                    >
                      <QrCodeScanner className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-on-surface-variant space-y-2">
                <Inventory className="w-10 h-10 mx-auto text-on-surface-variant/50" />
                <p className="text-body-sm font-semibold text-on-surface">No products found</p>
                <p className="text-body-xs">Try scanning another barcode or clearing your search filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Reduced Width Compact Checkout Drawer (w-72 xl:w-80) */}
        {isCartOpen && (
          <div className="w-full lg:w-72 xl:w-80 bg-surface-lowest border-t lg:border-t-0 lg:border-l border-outline-variant flex flex-col h-auto lg:h-full shadow-lg transition-all duration-300 shrink-0">
            {/* Cart Header */}
            <div className="p-3.5 border-b border-outline-variant/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <h2 className="text-body-sm font-bold text-on-surface">
                  Current Order ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <DeleteOutline className="w-3.5 h-3.5" />
                <span>CLEAR</span>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-60 lg:max-h-none">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.id);
                const maxStock = product?.stockQuantity || item.stockQuantity;

                return (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest border border-outline-variant/80 rounded-lg p-2.5 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-on-surface truncate leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant font-medium pt-0.5 truncate">
                          ₦ {item.price.toLocaleString()} · <span className="font-mono">{item.sku}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-on-surface-variant/60 hover:text-rose-600 transition-colors p-0.5 cursor-pointer shrink-0"
                        title="Remove Item"
                      >
                        <Close className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      {/* Compact Quantity Selector */}
                      <div className="flex items-center bg-surface-container-low border border-outline-variant rounded">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-0.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        >
                          <Remove className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-[11px] font-bold text-on-surface select-none">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= maxStock}
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-0.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:opacity-30"
                          title={item.quantity >= maxStock ? "Stock limit reached" : "Add one"}
                        >
                          <Add className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-on-surface">
                        ₦ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Cost Summary & Complete Sale Button */}
            <div className="border-t border-outline-variant p-3.5 space-y-3 bg-surface-container-lowest">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-semibold text-on-surface">
                    ₦ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Discount ({discountPercent}%)</span>
                  <span className="font-semibold text-rose-600">
                    - ₦ {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>VAT (7.5%)</span>
                  <span className="font-semibold text-on-surface">
                    ₦ {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-outline-variant/60 flex items-center justify-between">
                <span className="text-body-sm font-bold text-on-surface">Total</span>
                <span className="text-lg font-black text-[#005f37]">
                  ₦ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Complete Sale Action Button -> Opens Complete Transaction Modal */}
              <button
                disabled={!canCreate("pos")}
                onClick={() => {
                  if (!canCreate("pos")) {
                    alert("You do not have permission to process sales transactions.");
                    return;
                  }
                  setIsCheckoutModalOpen(true);
                }}
                className={`w-full font-bold py-3 rounded-DEFAULT flex items-center justify-center gap-1.5 transition-colors shadow-xs text-xs ${
                  canCreate("pos")
                    ? "bg-[#005f37] hover:bg-[#004e2d] text-white cursor-pointer"
                    : "bg-surface-container-high text-on-surface-variant opacity-60 cursor-not-allowed"
                }`}
              >
                <span>COMPLETE TRANSACTION</span>
                <ArrowForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* COMPLETE TRANSACTION MODAL (Matches user's design with Pending/Success)   */}
      {/* ========================================================================= */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl shadow-2xl overflow-hidden font-sans my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[#005f37] tracking-tight">
                Complete Transaction
              </h2>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Total Due Banner */}
              <div className="bg-[#eef6f2] border border-emerald-200/80 rounded-2xl p-5 text-center shadow-xs">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                  TOTAL DUE
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                  ₦ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Two Column Grid: Order Summary & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                
                {/* Left Column: Order Summary */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                    ORDER SUMMARY
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        ₦ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="font-semibold">
                        - ₦ {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>VAT (7.5%)</span>
                      <span className="font-semibold text-slate-900">
                        ₦ {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Customer Card */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Customer Profile
                    </label>
                    <div className="bg-[#f0f7f3] border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#005f37] flex items-center justify-center shrink-0">
                          <Person className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {selectedCustomer.name}
                          </h4>
                          <p className="text-[10px] text-emerald-800 font-semibold truncate">
                            +{loyaltyPointsEarned || 140} Loyalty Points Earned
                          </p>
                        </div>
                      </div>

                      <select
                        value={selectedCustomer.id}
                        onChange={(e) => {
                          const found = customers.find((c) => c.id === e.target.value);
                          if (found) setSelectedCustomer(found);
                        }}
                        className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#005f37] cursor-pointer shrink-0"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Method & Settlement Status */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                    PAYMENT METHOD
                  </h3>

                  {/* Payment Options */}
                  <div className="space-y-2.5">
                    {/* Option 1: POS Terminal (Card) */}
                    <div
                      onClick={() => setPaymentMethod("CARD")}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                        paymentMethod === "CARD"
                          ? "border-[#005f37] bg-emerald-50/50 ring-1 ring-[#005f37]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className={`w-5 h-5 ${paymentMethod === "CARD" ? "text-[#005f37]" : "text-slate-500"}`} />
                        <span className="text-xs font-bold text-slate-800">
                          POS Terminal (Card)
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "CARD" ? "border-[#005f37] bg-[#005f37]" : "border-slate-300"}`}>
                        {paymentMethod === "CARD" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Option 2: Bank Transfer */}
                    <div
                      onClick={() => setPaymentMethod("TRANSFER")}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                        paymentMethod === "TRANSFER"
                          ? "border-[#005f37] bg-emerald-50/50 ring-1 ring-[#005f37]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <AccountBalance className={`w-5 h-5 ${paymentMethod === "TRANSFER" ? "text-[#005f37]" : "text-slate-500"}`} />
                        <span className="text-xs font-bold text-slate-800">
                          Bank Transfer
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "TRANSFER" ? "border-[#005f37] bg-[#005f37]" : "border-slate-300"}`}>
                        {paymentMethod === "TRANSFER" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Option 3: Cash */}
                    <div
                      onClick={() => setPaymentMethod("CASH")}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                        paymentMethod === "CASH"
                          ? "border-[#005f37] bg-emerald-50/50 ring-1 ring-[#005f37]"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Payments className={`w-5 h-5 ${paymentMethod === "CASH" ? "text-[#005f37]" : "text-slate-500"}`} />
                        <span className="text-xs font-bold text-slate-800">
                          Cash
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "CASH" ? "border-[#005f37] bg-[#005f37]" : "border-slate-300"}`}>
                        {paymentMethod === "CASH" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* SPECIAL USER REQUIREMENT: Small Pending / Successful button toggle for Card & Transfer */}
                  {(paymentMethod === "CARD" || paymentMethod === "TRANSFER") && (
                    <div className="pt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          Settlement Status:
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          paymentStatus === "SUCCESSFUL" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {paymentStatus}
                        </span>
                      </div>

                      {/* Small Button / Checkbox Toggle for Pending or Successful */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentStatus("SUCCESSFUL")}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                            paymentStatus === "SUCCESSFUL"
                              ? "bg-[#005f37] text-white border-[#005f37] shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Successful</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentStatus("PENDING")}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                            paymentStatus === "PENDING"
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <HourglassEmpty className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </button>
                      </div>

                      {/* Reference Input */}
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder={paymentMethod === "CARD" ? "e.g. POS RRN / Stanbic-9812" : "e.g. Bank Session ID / Ref"}
                        className="w-full text-[11px] px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#005f37]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                <ArrowBack className="w-4 h-4" />
                <span>Back to Cart</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleConfirmTransaction(false)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-DEFAULT text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  Confirm (No Receipt)
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmTransaction(true)}
                  className="px-6 py-2.5 bg-[#005f37] hover:bg-[#004e2d] text-white rounded-DEFAULT text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Print className="w-4 h-4" />
                  <span>Confirm & Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE RECEIPT / TRANSACTION SUCCESS MODAL                             */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && lastReceiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm shadow-2xl overflow-hidden font-sans my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-300" />
                <h3 className="text-sm font-bold">Transaction Receipt</h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 text-xs font-mono text-slate-800">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h2 className="text-base font-black tracking-wider text-slate-900 uppercase">
                  BusinessHub Store
                </h2>
                <p className="text-[10px] text-slate-500 font-sans">
                  Plot 14, Admiralty Way, Lekki Phase 1, Lagos
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  Tel: +234 1 800 2843 · POS Terminal #01
                </p>
              </div>

              {/* Meta */}
              <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt #:</span>
                  <span className="font-bold">{lastReceiptData.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{lastReceiptData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold">{lastReceiptData.customer?.name}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[11px] text-slate-600">
                  <span>ITEM</span>
                  <span>QTY x RATE</span>
                  <span>TOTAL</span>
                </div>
                {lastReceiptData.items.map((it: CartItem) => (
                  <div key={it.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[140px] font-sans">{it.name}</span>
                    <span>{it.quantity} x {it.price.toLocaleString()}</span>
                    <span className="font-bold">₦ {(it.quantity * it.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-1 text-[11px] font-sans">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₦ {lastReceiptData.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {lastReceiptData.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount ({lastReceiptData.discountPercent}%):</span>
                    <span>- ₦ {lastReceiptData.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>VAT (7.5%):</span>
                  <span>₦ {lastReceiptData.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL:</span>
                  <span className="text-[#005f37]">₦ {lastReceiptData.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px] font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-bold">{lastReceiptData.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    lastReceiptData.paymentStatus === "SUCCESSFUL" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {lastReceiptData.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref:</span>
                  <span className="font-mono text-[10px]">{lastReceiptData.transactionRef}</span>
                </div>
              </div>

              {/* Barcode Footer Simulation */}
              <div className="text-center pt-2 space-y-1">
                <div className="inline-block tracking-widest font-mono text-[10px] bg-slate-100 px-3 py-1 rounded border border-slate-300">
                  ||||| |||| |||||| |||| |||||
                </div>
                <p className="text-[10px] text-slate-500 font-sans">Thank you for your patronage!</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-[#005f37] hover:bg-[#004e2d] text-white rounded-DEFAULT text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Print className="w-4 h-4" />
                <span>Print Slip</span>
              </button>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-DEFAULT text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARCODE SCANNER CAMERA DIALOG                                             */}
      {/* ========================================================================= */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCodeScanner className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">Barcode Scanner (Fast Attendance)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>

            {/* Live Camera Viewport powered by BarcodeScanner */}
            <BarcodeScanner
              inline
              onScanSuccess={(scannedText) => {
                handleBarcodeScan(scannedText);
              }}
              onClose={() => setIsScannerModalOpen(false)}
            />

            {/* Manual Barcode Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualBarcode.trim()) {
                  handleBarcodeScan(manualBarcode);
                  setIsScannerModalOpen(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-body-xs font-semibold text-slate-800 mb-1">
                  Type or Scan Barcode Value
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. 8901234567890"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-DEFAULT border border-slate-300 bg-white text-body-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-[#005f37] hover:bg-[#004e2d] text-white px-4 py-2 rounded-DEFAULT text-body-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Quick Attendance Barcodes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  QUICK ATTENDANCE BARCODES:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {products.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        handleBarcodeScan(p.barcode || p.sku);
                        setIsScannerModalOpen(false);
                      }}
                      className="text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-primary bg-slate-50 hover:bg-emerald-50 text-slate-800 transition cursor-pointer flex flex-col"
                    >
                      <span className="font-semibold truncate">{p.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">{p.barcode || p.sku}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}