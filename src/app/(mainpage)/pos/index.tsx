'use client';

import React, { useState } from 'react';
import {
    Search,
    FilterList,
    Add,
    Remove,
    Close,
    DeleteOutline,
    Payments,
    CreditCard,
    AccountBalance,
    ArrowForward,
    ShoppingCart,
} from 'google-material-icons/outlined';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    sku: string;
}

interface CartItem extends Product {
    quantity: number;
}

const SAMPLE_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Premium Ceramic Mug',
        price: 4500,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80',
        sku: 'MUG-001',
    },
    {
        id: '2',
        name: 'Executive Leather Notebook',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&q=80',
        sku: 'NOTE-002',
    },
    {
        id: '3',
        name: 'Signature Ballpoint Pen',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&q=80',
        sku: 'PEN-003',
    },
    {
        id: '4',
        name: 'Generic Office Supplies Set',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80',
        sku: 'OFF-004',
    },
    {
        id: '5',
        name: 'Wireless Ergonomic Mouse',
        price: 15500,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80',
        sku: 'MSE-005',
    },
];

export default function POSpage() {
    const [cart, setCart] = useState<CartItem[]>([
        {
            id: '2',
            name: 'Executive Leather Notebook',
            price: 12000,
            image: '',
            sku: 'NOTE-002',
            quantity: 2,
        },
        {
            id: '3',
            name: 'Signature Ballpoint Pen',
            price: 2800,
            image: '',
            sku: 'PEN-003',
            quantity: 1,
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');

    // Cart Handlers
    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.id === id) {
                        const newQty = item.quantity + delta;
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
    const discount = 0;
    const vatRate = 0.075;
    const vatAmount = subtotal * vatRate;
    const grandTotal = subtotal - discount + vatAmount;

    // Filter Products
    const filteredProducts = SAMPLE_PRODUCTS.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-surface-container-lowest/8  overflow-hidden">
            {/* LEFT AREA: Product Catalog Grid */}
            <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto transition-all duration-300">
                {/* Search Bar & Category Filter */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products, SKU, or barcode..."
                            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-DEFAULT text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface-lowest border border-outline-variant rounded-DEFAULT text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
                        <FilterList className="w-5 h-5 text-on-surface-variant" />
                        <span>Category</span>
                    </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="group bg-surface-lowest border border-outline-variant hover:border-primary/60 rounded-lg p-3 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
                        >
                            <div className="aspect-square rounded-DEFAULT bg-surface-container-low overflow-hidden mb-3 relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-body-sm font-medium text-on-surface line-clamp-2 leading-snug">
                                    {product.name}
                                </h3>
                                <p className="text-body-sm font-bold text-primary">
                                    ₦ {product.price.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDEBAR: Checkout Panel */}
            {cart.length > 0 && (
                <div className="w-96 bg-surface-lowest border-l border-outline-variant flex flex-col h-full shadow-lg transition-all duration-300 shrink-0">
                    {/* Header */}
                    <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            <h2 className="text-body-md font-bold text-on-surface">Current Order</h2>
                        </div>
                        <button
                            onClick={clearCart}
                            className="flex items-center gap-1 text-body-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                        >
                            <DeleteOutline className="w-4 h-4" />
                            <span>CLEAR</span>
                        </button>
                    </div>

                    {/* Order Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 space-y-2"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="text-body-sm font-semibold text-on-surface leading-tight">
                                            {item.name}
                                        </h4>
                                        <p className="text-body-xs text-on-surface-variant">
                                            ₦ {item.price.toLocaleString()} / unit
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-on-surface-variant/60 hover:text-rose-600 transition-colors p-0.5"
                                    >
                                        <Close className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    {/* Quantity Toggle */}
                                    <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-DEFAULT">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                                        >
                                            <Remove className="w-4 h-4" />
                                        </button>
                                        <span className="px-3 text-body-xs font-bold text-on-surface select-none">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                                        >
                                            <Add className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <span className="text-body-sm font-bold text-on-surface">
                                        ₦ {(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cost Summary & Pay Button */}
                    <div className="border-t border-outline-variant p-4 space-y-4 bg-surface-container-lowest">
                        <div className="space-y-1.5 text-body-xs">
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Subtotal</span>
                                <span className="font-semibold text-on-surface">
                                    ₦ {subtotal.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-on-surface-variant">
                                <span>Discount</span>
                                <span className="font-semibold text-on-surface">
                                    - ₦ {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between text-on-surface-variant">
                                <span>VAT (7.5%)</span>
                                <span className="font-semibold text-on-surface">
                                    ₦ {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between">
                            <span className="text-body-md font-bold text-on-surface">Total</span>
                            <span className="text-xl font-extrabold text-primary">
                                ₦ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Payment Selection */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                            <button
                                onClick={() => setPaymentMethod('CASH')}
                                className={`py-2 px-1 rounded-DEFAULT border text-body-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    paymentMethod === 'CASH'
                                        ? 'bg-primary-container/20 border-primary text-primary'
                                        : 'bg-surface-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                                }`}
                            >
                                <Payments className="w-4 h-4" />
                                <span>CASH</span>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('CARD')}
                                className={`py-2 px-1 rounded-DEFAULT border text-body-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    paymentMethod === 'CARD'
                                        ? 'bg-primary-container/20 border-primary text-primary'
                                        : 'bg-surface-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                                }`}
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>CARD</span>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('TRANSFER')}
                                className={`py-2 px-1 rounded-DEFAULT border text-body-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    paymentMethod === 'TRANSFER'
                                        ? 'bg-primary-container/20 border-primary text-primary'
                                        : 'bg-surface-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                                }`}
                            >
                                <AccountBalance className="w-4 h-4" />
                                <span>TRANSFER</span>
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                alert(`Sale completed using ${paymentMethod}!`);
                                clearCart();
                            }}
                            className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3 rounded-DEFAULT flex items-center justify-center gap-2 transition-colors shadow-xs"
                        >
                            <span>COMPLETE SALE</span>
                            <ArrowForward className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}