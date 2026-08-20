'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Info,
    Image,
    CloudUpload,
    Inventory2,
    Payments,
    Save,
    QrCodeScanner,
    Warehouse,
    Add,
    Close,
    PhotoCamera,
} from 'google-material-icons/outlined';
import { BarcodeScanner } from './components';
import { usePermissions } from '@/src/context/PermissionsContext';
import CameraCaptureModal from '@/src/components/CameraCaptureModal';

const DEFAULT_CATEGORIES = [
    'Electronics',
    'Mobile Phones',
    'Furniture',
    'Office Supplies',
    'Groceries',
    'Health & Beauty',
    'Fashion & Apparel',
    'Home & Kitchen',
    'Accessories',
    'General',
];

const DEFAULT_BRANDS = [
    'Samsung',
    'Apple',
    'HP',
    'Dell',
    'Sony',
    'LG',
    'Lenovo',
    'Nike',
    'Generic / No Brand',
];

function AddProductForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams ? (searchParams.get('id') || searchParams.get('edit')) : null;
    const { canCreate, canEdit } = usePermissions();

    // 1. FORM STATES
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');

    // Dynamic Categories & Brands State
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);

    // Inline Add Category / Brand State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [isAddingBrand, setIsAddingBrand] = useState(false);
    const [newBrandInput, setNewBrandInput] = useState('');

    // Media Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // Inventory & Tracking State
    const [sku, setSku] = useState('');
    const [unitOfMeasure, setUnitOfMeasure] = useState('Pcs (Pieces)');
    const [barcode, setBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // Pricing & Tax State
    const [costPrice, setCostPrice] = useState<number | ''>('');
    const [sellingPrice, setSellingPrice] = useState<number | ''>('');
    const [taxRule, setTaxRule] = useState('VAT 7.5%');

    // Initial Stock Level State
    const [initialQuantity, setInitialQuantity] = useState<number>(0);
    const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
    const [enableLowStockAlerts, setEnableLowStockAlerts] = useState<boolean>(true);

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Fetch single product details if editing
    const fetchProductToEdit = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            const res = await fetch('/api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    query: `
                        query GetProductToEdit($id: ID!) {
                            product(id: $id) {
                                id
                                name
                                category
                                brand
                                description
                                imageUrl
                                inventoryTracking {
                                    sku
                                    unitOfMeasure
                                    barcode
                                }
                                pricing {
                                    costPrice
                                    sellingPrice
                                    taxRule
                                }
                                stockLevel {
                                    initialQuantity
                                    lowStockThreshold
                                    enableLowStockAlerts
                                }
                            }
                        }
                    `,
                    variables: { id },
                }),
            });

            const result = await res.json();
            const p = result.data?.product;
            if (p) {
                setName(p.name || '');
                setCategory(p.category || '');
                setBrand(p.brand || '');
                setDescription(p.description || '');
                if (p.imageUrl) {
                    setImageUrl(p.imageUrl);
                    setPreviewUrl(p.imageUrl);
                }
                setSku(p.inventoryTracking?.sku || '');
                setUnitOfMeasure(p.inventoryTracking?.unitOfMeasure || 'Pcs (Pieces)');
                setBarcode(p.inventoryTracking?.barcode || '');
                setCostPrice(p.pricing?.costPrice ?? '');
                setSellingPrice(p.pricing?.sellingPrice ?? '');
                setTaxRule(p.pricing?.taxRule || 'VAT 7.5%');
                setInitialQuantity(p.stockLevel?.initialQuantity ?? 0);
                setLowStockThreshold(p.stockLevel?.lowStockThreshold ?? 5);
                setEnableLowStockAlerts(p.stockLevel?.enableLowStockAlerts ?? true);
            }
        } catch (err) {
            console.error('Failed to fetch product details for edit:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (editId) {
            fetchProductToEdit(editId);
        }
    }, [editId, fetchProductToEdit]);

    // Load existing categories and brands from DB & LocalStorage
    const fetchExistingMetadata = useCallback(async () => {
        try {
            // 1. Load saved custom categories/brands from localStorage
            let customCats: string[] = [];
            let customBrnds: string[] = [];
            if (typeof window !== 'undefined') {
                const savedCats = localStorage.getItem('custom_categories');
                if (savedCats) customCats = JSON.parse(savedCats);

                const savedBrnds = localStorage.getItem('custom_brands');
                if (savedBrnds) customBrnds = JSON.parse(savedBrnds);
            }

            // 2. Fetch distinct categories and brands from DB products
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            const res = await fetch('/api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    query: `
                        query GetProductMetadata {
                            products {
                                category
                                brand
                            }
                        }
                    `,
                }),
            });

            const result = await res.json();
            const dbCategories: string[] = [];
            const dbBrands: string[] = [];

            if (result.data?.products) {
                result.data.products.forEach((p: any) => {
                    if (p.category && !dbCategories.includes(p.category)) {
                        dbCategories.push(p.category);
                    }
                    if (p.brand && !dbBrands.includes(p.brand)) {
                        dbBrands.push(p.brand);
                    }
                });
            }

            // Combine unique sets
            const mergedCategories = Array.from(
                new Set([...DEFAULT_CATEGORIES, ...customCats, ...dbCategories].filter(Boolean))
            );
            const mergedBrands = Array.from(
                new Set([...DEFAULT_BRANDS, ...customBrnds, ...dbBrands].filter(Boolean))
            );

            setCategories(mergedCategories);
            setBrands(mergedBrands);
        } catch {
            // Keep default lists
        }
    }, []);

    useEffect(() => {
        fetchExistingMetadata();
    }, [fetchExistingMetadata]);

    // Handle adding new custom category
    const handleCreateCategory = () => {
        const trimmed = newCategoryInput.trim();
        if (!trimmed) return;

        setCategories((prev) => {
            const next = Array.from(new Set([trimmed, ...prev]));
            if (typeof window !== 'undefined') {
                const custom = next.filter((c) => !DEFAULT_CATEGORIES.includes(c));
                localStorage.setItem('custom_categories', JSON.stringify(custom));
            }
            return next;
        });

        setCategory(trimmed);
        setNewCategoryInput('');
        setIsAddingCategory(false);
    };

    // Handle adding new custom brand
    const handleCreateBrand = () => {
        const trimmed = newBrandInput.trim();
        if (!trimmed) return;

        setBrands((prev) => {
            const next = Array.from(new Set([trimmed, ...prev]));
            if (typeof window !== 'undefined') {
                const custom = next.filter((b) => !DEFAULT_BRANDS.includes(b));
                localStorage.setItem('custom_brands', JSON.stringify(custom));
            }
            return next;
        });

        setBrand(trimmed);
        setNewBrandInput('');
        setIsAddingBrand(false);
    };

    // Media Handlers
    const handleMediaClick = () => {
        mediaInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Upload Image to Cloudinary Route Handler
    const uploadToCloudinary = async (file: File): Promise<string> => {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image size exceeds 5MB limit');
        }

        const formData = new FormData();
        formData.append('file', file);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to upload image');
            return data.url;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Upload timed out. Please try a smaller image.');
            }
            throw error;
        }
    };

    // 2. SAVE / UPDATE PRODUCT FUNCTION
    const saveProduct = async () => {
        const hasPermission = editId ? canEdit('inventory') : canCreate('inventory');
        if (!hasPermission) {
            setFeedback({ type: 'error', message: `You do not have permission to ${editId ? 'edit' : 'add'} products.` });
            return;
        }

        if (!name.trim() || !category.trim() || !sellingPrice) {
            setFeedback({ type: 'error', message: 'Please fill in all required fields (Product Name, Category, Selling Price).' });
            return;
        }

        setLoading(true);
        setFeedback(null);

        try {
            let uploadedImageUrl = imageUrl;

            if (selectedFile) {
                setUploadingImage(true);
                uploadedImageUrl = await uploadToCloudinary(selectedFile);
                setImageUrl(uploadedImageUrl);
                setUploadingImage(false);
            }

            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            const query = editId
                ? `
                    mutation UpdateProduct(
                        $id: ID!
                        $name: String
                        $category: String
                        $brand: String
                        $description: String
                        $imageUrl: String
                        $inventoryTracking: InventoryTrackingInput
                        $pricing: PricingAndTaxInput
                        $stockLevel: StockLevelInput
                    ) {
                        updateProduct(
                            id: $id
                            name: $name
                            category: $category
                            brand: $brand
                            description: $description
                            imageUrl: $imageUrl
                            inventoryTracking: $inventoryTracking
                            pricing: $pricing
                            stockLevel: $stockLevel
                        ) {
                            id
                            name
                        }
                    }
                `
                : `
                    mutation AddProduct(
                        $name: String!
                        $category: String!
                        $brand: String
                        $description: String
                        $imageUrl: String
                        $inventoryTracking: InventoryTrackingInput!
                        $pricing: PricingAndTaxInput!
                        $stockLevel: StockLevelInput!
                    ) {
                        addProduct(
                            name: $name
                            category: $category
                            brand: $brand
                            description: $description
                            imageUrl: $imageUrl
                            inventoryTracking: $inventoryTracking
                            pricing: $pricing
                            stockLevel: $stockLevel
                        ) {
                            id
                            name
                        }
                    }
                `;

            const variables = editId
                ? {
                    id: editId,
                    name: name.trim(),
                    category: category.trim(),
                    brand: brand.trim() || null,
                    description: description.trim() || '',
                    imageUrl: uploadedImageUrl || null,
                    inventoryTracking: {
                        sku: sku.trim() || '',
                        unitOfMeasure: unitOfMeasure || 'Pcs (Pieces)',
                        barcode: barcode.trim() || '',
                    },
                    pricing: {
                        costPrice: Number(costPrice) || 0.0,
                        sellingPrice: Number(sellingPrice) || 0.0,
                        taxRule: taxRule || 'VAT 7.5%',
                    },
                    stockLevel: {
                        initialQuantity: Number(initialQuantity) || 0,
                        lowStockThreshold: Number(lowStockThreshold) || 1,
                        enableLowStockAlerts: Boolean(enableLowStockAlerts),
                    },
                }
                : {
                    name: name.trim(),
                    category: category.trim(),
                    brand: brand.trim() || null,
                    description: description.trim() || '',
                    imageUrl: uploadedImageUrl || null,
                    inventoryTracking: {
                        sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
                        unitOfMeasure: unitOfMeasure || 'Pcs (Pieces)',
                        barcode: barcode.trim() || '',
                    },
                    pricing: {
                        costPrice: Number(costPrice) || 0.0,
                        sellingPrice: Number(sellingPrice) || 0.0,
                        taxRule: taxRule || 'VAT 7.5%',
                    },
                    stockLevel: {
                        initialQuantity: Number(initialQuantity) || 0,
                        lowStockThreshold: Number(lowStockThreshold) || 1,
                        enableLowStockAlerts: Boolean(enableLowStockAlerts),
                    },
                };

            const response = await fetch('/api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ query, variables }),
            });

            const result = await response.json();

            if (result.errors?.length) {
                throw new Error(result.errors[0].message || `Failed to ${editId ? 'update' : 'save'} product`);
            }

            setFeedback({ type: 'success', message: `Product "${name}" ${editId ? 'updated' : 'added to inventory'} successfully!` });
            setTimeout(() => {
                router.push('/inventory');
            }, 1200);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message || 'An error occurred while saving product.' });
        } finally {
            setUploadingImage(false);
            setLoading(false);
        }
    };

    const hasPermission = editId ? canEdit('inventory') : canCreate('inventory');

    return (
        <div className="space-y-6 pb-12 font-sans antialiased">
            {/* 1. TOP HEADER & BREADCRUMB */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <nav className="text-body-xs text-on-surface-variant flex items-center gap-1.5 mb-1">
                        <Link href="/inventory" className="hover:text-primary transition-colors">
                            Inventory
                        </Link>
                        <span>&gt;</span>
                        <span className="font-semibold text-on-surface">
                            {editId ? 'Edit Product' : 'Add New Product'}
                        </span>
                    </nav>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                        {editId ? 'Edit Product Details' : 'Add New Product'}
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
                    <button
                        onClick={saveProduct}
                        disabled={loading || uploadingImage || !hasPermission}
                        className={`font-medium px-4 py-2.5 rounded-DEFAULT flex items-center gap-2 shadow-xs transition-colors ${
                            hasPermission && !loading && !uploadingImage
                                ? 'bg-primary hover:bg-primary-container text-on-primary cursor-pointer'
                                : 'bg-surface-container-high text-on-surface-variant opacity-60 cursor-not-allowed'
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        <span>
                            {!hasPermission
                                ? 'Not Permitted'
                                : uploadingImage
                                    ? 'Uploading Image...'
                                    : loading
                                        ? editId ? 'Updating...' : 'Saving...'
                                        : editId ? 'Update Product' : 'Save Product'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Feedback Notification Banner */}
            {feedback && (
                <div
                    className={`p-3.5 rounded-lg text-body-sm font-medium flex items-center justify-between animate-in fade-in duration-200 ${
                        feedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <span>{feedback.message}</span>
                    <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        className="hover:opacity-75 cursor-pointer font-bold px-1"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* 2. BASIC INFORMATION & MEDIA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
                        <Info className="w-5 h-5 text-primary" />
                        <h2 className="text-body-md font-bold text-on-surface">Basic Information</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Product Name */}
                        <div className="space-y-1.5">
                            <label className="text-body-xs font-semibold text-on-surface-variant">
                                Product Name <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Samsung Galaxy S23 Ultra"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Category & Brand with Dynamic Add */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Category Field */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-body-xs font-semibold text-on-surface-variant">
                                        Category <span className="text-rose-600">*</span>
                                    </label>
                                    {!isAddingCategory && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCategory(true)}
                                            className="text-xs font-bold text-[#005f37] hover:text-[#004e2d] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Add className="w-3.5 h-3.5" />
                                            <span>Add New</span>
                                        </button>
                                    )}
                                </div>

                                {!isAddingCategory ? (
                                    <select
                                        value={category}
                                        onChange={(e) => {
                                            if (e.target.value === '__NEW__') {
                                                setIsAddingCategory(true);
                                            } else {
                                                setCategory(e.target.value);
                                            }
                                        }}
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                        <option value="__NEW__" className="text-primary font-bold">
                                            + Add New Category...
                                        </option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={newCategoryInput}
                                            onChange={(e) => setNewCategoryInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleCreateCategory();
                                                } else if (e.key === 'Escape') {
                                                    setIsAddingCategory(false);
                                                    setNewCategoryInput('');
                                                }
                                            }}
                                            placeholder="Enter category name..."
                                            className="flex-1 bg-surface-container-low border border-primary rounded-DEFAULT px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            disabled={!newCategoryInput.trim()}
                                            className="bg-[#005f37] hover:bg-[#004e2d] disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-DEFAULT transition-colors cursor-pointer shrink-0"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingCategory(false);
                                                setNewCategoryInput('');
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                            title="Cancel"
                                        >
                                            <Close className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Brand Field */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-body-xs font-semibold text-on-surface-variant">
                                        Brand
                                    </label>
                                    {!isAddingBrand && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingBrand(true)}
                                            className="text-xs font-bold text-[#005f37] hover:text-[#004e2d] hover:underline flex items-center gap-0.5 cursor-pointer"
                                        >
                                            <Add className="w-3.5 h-3.5" />
                                            <span>Add New</span>
                                        </button>
                                    )}
                                </div>

                                {!isAddingBrand ? (
                                    <select
                                        value={brand}
                                        onChange={(e) => {
                                            if (e.target.value === '__NEW__') {
                                                setIsAddingBrand(true);
                                            } else {
                                                setBrand(e.target.value);
                                            }
                                        }}
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((b) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                        <option value="__NEW__" className="text-primary font-bold">
                                            + Add New Brand...
                                        </option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={newBrandInput}
                                            onChange={(e) => setNewBrandInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleCreateBrand();
                                                } else if (e.key === 'Escape') {
                                                    setIsAddingBrand(false);
                                                    setNewBrandInput('');
                                                }
                                            }}
                                            placeholder="Enter brand name..."
                                            className="flex-1 bg-surface-container-low border border-primary rounded-DEFAULT px-3 py-1.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateBrand}
                                            disabled={!newBrandInput.trim()}
                                            className="bg-[#005f37] hover:bg-[#004e2d] disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-DEFAULT transition-colors cursor-pointer shrink-0"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingBrand(false);
                                                setNewBrandInput('');
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                            title="Cancel"
                                        >
                                            <Close className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-body-xs font-semibold text-on-surface-variant">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter detailed product description..."
                                className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Media Upload */}
                <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-4 h-full flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                        <div className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-primary" />
                            <h2 className="text-body-md font-bold text-on-surface">Media</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCameraModalOpen(true)}
                            className="px-2.5 py-1 rounded border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <PhotoCamera className="w-4 h-4" />
                            <span>Take Photo</span>
                        </button>
                    </div>

                    <div
                        onClick={handleMediaClick}
                        className="flex-1 border-2 border-dashed border-outline-variant hover:border-primary/60 bg-surface-container-lowest hover:bg-surface-container-low rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden min-h-[180px]"
                    >
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Selected preview"
                                className="absolute inset-0 w-full h-full object-contain p-2 bg-black/5"
                            />
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                                    <CloudUpload className="w-6 h-6 text-on-surface-variant" />
                                </div>
                                <p className="text-body-sm font-semibold text-on-surface mb-1">
                                    Click to upload or drag & drop
                                </p>
                                <p className="text-body-xs text-on-surface-variant/80 mb-3">
                                    SVG, PNG, JPG or GIF (max. 5MB)
                                </p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCameraModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-body-xs font-semibold flex items-center gap-1.5 border border-outline-variant/60 transition cursor-pointer"
                                >
                                    <PhotoCamera className="w-4 h-4 text-primary" />
                                    <span>Use Camera Instead</span>
                                </button>
                            </>
                        )}
                        <input
                            ref={mediaInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <CameraCaptureModal
                    isOpen={isCameraModalOpen}
                    onClose={() => setIsCameraModalOpen(false)}
                    onCapture={(file, url) => {
                        setSelectedFile(file);
                        setPreviewUrl(url);
                    }}
                />
            </div>

            {/* 3. INVENTORY & PRICING */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Inventory & Tracking */}
                <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
                        <Inventory2 className="w-5 h-5 text-primary" />
                        <h2 className="text-body-md font-bold text-on-surface">
                            Inventory & Tracking
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-body-xs font-semibold text-on-surface-variant">
                                    SKU (Stock Keeping Unit)
                                </label>
                                <input
                                    type="text"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="e.g. SAM-S23-BLK"
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-body-xs font-semibold text-on-surface-variant">
                                    Unit of Measure
                                </label>
                                <select
                                    value={unitOfMeasure}
                                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="Pcs (Pieces)">Pcs (Pieces)</option>
                                    <option value="Box">Box</option>
                                    <option value="Kg (Kilograms)">Kg (Kilograms)</option>
                                    <option value="Pack">Pack</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-body-xs font-semibold text-on-surface-variant">
                                Barcode (UPC/EAN)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="Scan or enter barcode"
                                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsScanning(true);
                                    }}
                                    className="p-2.5 bg-surface-container border border-outline-variant rounded-DEFAULT text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
                                    title="Scan Barcode"
                                >
                                    <QrCodeScanner className="w-5 h-5" />
                                </button>
                                {isScanning && (
                                    <BarcodeScanner
                                        onScanSuccess={(scannedText) => {
                                            setBarcode(scannedText);
                                            setIsScanning(false);
                                        }}
                                        onClose={() => setIsScanning(false)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing & Tax */}
                <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
                        <Payments className="w-5 h-5 text-primary" />
                        <h2 className="text-body-md font-bold text-on-surface">Pricing & Tax</h2>
                    </div>

                    <div className="space-y-4">
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
                                        value={costPrice}
                                        onChange={(e) =>
                                            setCostPrice(
                                                e.target.value === '' ? '' : Number(e.target.value)
                                            )
                                        }
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
                                        value={sellingPrice}
                                        onChange={(e) =>
                                            setSellingPrice(
                                                e.target.value === '' ? '' : Number(e.target.value)
                                            )
                                        }
                                        placeholder="0.00"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT pl-8 pr-3.5 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-body-xs font-semibold text-on-surface-variant">
                                Tax Rule
                            </label>
                            <select
                                value={taxRule}
                                onChange={(e) => setTaxRule(e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            >
                                <option value="VAT 7.5%">VAT 7.5%</option>
                                <option value="Tax Exempt (0%)">Tax Exempt (0%)</option>
                                <option value="Custom Tax Rate">Custom Tax Rate</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. INITIAL STOCK LEVEL */}
            <div className="bg-surface-lowest border border-outline-variant rounded-lg p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/60">
                    <Warehouse className="w-5 h-5 text-primary" />
                    <h2 className="text-body-md font-bold text-on-surface">Initial Stock Level</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-1.5">
                        <label className="text-body-xs font-semibold text-on-surface-variant">
                            Initial Quantity
                        </label>
                        <input
                            type="number"
                            value={initialQuantity}
                            onChange={(e) => setInitialQuantity(Number(e.target.value))}
                            min={0}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-body-xs font-semibold text-on-surface-variant">
                            Low Stock Alert Threshold
                        </label>
                        <input
                            type="number"
                            value={lowStockThreshold}
                            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                            min={1}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-DEFAULT px-3.5 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 pb-2">
                        <button
                            type="button"
                            onClick={() => setEnableLowStockAlerts(!enableLowStockAlerts)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enableLowStockAlerts ? 'bg-primary' : 'bg-outline-variant'
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${enableLowStockAlerts ? 'translate-x-5' : 'translate-x-0'
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

export default function AddProductPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-body-sm text-on-surface-variant">Loading product details...</div>}>
            <AddProductForm />
        </Suspense>
    );
}