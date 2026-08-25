import mongoose from "mongoose";
import { Product } from "@/src/app/model/product.model";
import { connectDB } from "@/src/lib/connect";
import { toBusinessQuery, requireBusinessId } from "@/src/lib/tenant";

interface ProductInput {
    name: string;
    category: string;
    brand?: string;
    supplier?: string;
    description?: string;
    imageUrl?: string;
    inventoryTracking: {
        sku?: string;
        unitOfMeasure?: string;
        barcode?: string;
    };
    pricing: {
        costPrice?: number;
        sellingPrice?: number;
        taxRule?: string;
    };
    stockLevel: {
        initialQuantity?: number;
        lowStockThreshold?: number;
        enableLowStockAlerts?: boolean;
    };
}

export const resolvers = {
    Query: {
        products: async (_: any, __: any, context: any) => {
            await connectDB();
            const businessId = context?.user?.businessId;
            if (!businessId) return [];
            return Product.find({ businessId: toBusinessQuery(businessId) }).sort({ createdAt: -1 });
        },
        product: async (_: any, { id }: { id: string }, context: any) => {
            await connectDB();
            const businessId = context?.user?.businessId;
            if (!businessId) return null;
            return Product.findOne({ _id: id, businessId: toBusinessQuery(businessId) });
        },
    },
    Mutation: {
        addProduct: async (
            _: any,
            {
                name,
                category,
                brand,
                supplier,
                description,
                imageUrl,
                inventoryTracking,
                pricing,
                stockLevel,
            }: ProductInput,
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);

            if (!name || !category || !pricing?.sellingPrice) {
                throw new Error("Missing required fields: name, category, and selling price.");
            }

            if (Number(pricing.sellingPrice) < 0) {
                throw new Error("Selling price must be a positive number.");
            }

            if (Number(stockLevel?.initialQuantity ?? 0) < 0) {
                throw new Error("Initial quantity cannot be negative.");
            }

            const newProduct = await Product.create({
                businessId: new mongoose.Types.ObjectId(businessId),
                name: name.trim(),
                category: category.trim(),
                brand: brand ? brand.trim() : undefined,
                supplier: supplier ? supplier.trim() : "Main Warehouse",
                description: description ? description.trim() : "",
                imageUrl: imageUrl || "",
                inventoryTracking: {
                    sku: inventoryTracking?.sku ? inventoryTracking.sku.trim() : "",
                    unitOfMeasure: inventoryTracking?.unitOfMeasure || "Pcs (Pieces)",
                    barcode: inventoryTracking?.barcode ? inventoryTracking.barcode.trim() : "",
                },
                pricing: {
                    costPrice: Number(pricing?.costPrice ?? 0),
                    sellingPrice: Number(pricing.sellingPrice),
                    taxRule: pricing?.taxRule || "VAT 7.5%",
                },
                stockLevel: {
                    initialQuantity: Number(stockLevel?.initialQuantity ?? 0),
                    lowStockThreshold: Number(stockLevel?.lowStockThreshold ?? 5),
                    enableLowStockAlerts: Boolean(stockLevel?.enableLowStockAlerts ?? true),
                },
            });

            return newProduct;
        },
        createProduct: async (
            _: any,
            args: ProductInput,
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);

            const {
                name,
                category,
                brand,
                supplier,
                description,
                imageUrl,
                inventoryTracking,
                pricing,
                stockLevel,
            } = args;

            if (!name || !category || !pricing?.sellingPrice) {
                throw new Error("Missing required fields: name, category, and selling price.");
            }

            const newProduct = await Product.create({
                businessId: new mongoose.Types.ObjectId(businessId),
                name: name.trim(),
                category: category.trim(),
                brand: brand ? brand.trim() : undefined,
                supplier: supplier ? supplier.trim() : "Main Warehouse",
                description: description ? description.trim() : "",
                imageUrl: imageUrl || "",
                inventoryTracking: {
                    sku: inventoryTracking?.sku ? inventoryTracking.sku.trim() : "",
                    unitOfMeasure: inventoryTracking?.unitOfMeasure || "Pcs (Pieces)",
                    barcode: inventoryTracking?.barcode ? inventoryTracking.barcode.trim() : "",
                },
                pricing: {
                    costPrice: Number(pricing?.costPrice ?? 0),
                    sellingPrice: Number(pricing.sellingPrice),
                    taxRule: pricing?.taxRule || "VAT 7.5%",
                },
                stockLevel: {
                    initialQuantity: Number(stockLevel?.initialQuantity ?? 0),
                    lowStockThreshold: Number(stockLevel?.lowStockThreshold ?? 5),
                    enableLowStockAlerts: Boolean(stockLevel?.enableLowStockAlerts ?? true),
                },
            });
            return newProduct;
        },
        updateProduct: async (
            _: any,
            { id, name, category, brand, supplier, description, imageUrl, inventoryTracking, pricing, stockLevel }: any,
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);

            const updatedProduct = await Product.findOneAndUpdate(
                { _id: id, businessId: toBusinessQuery(businessId) },
                {
                    ...(name ? { name: name.trim() } : {}),
                    ...(category ? { category: category.trim() } : {}),
                    ...(brand !== undefined ? { brand: brand.trim() } : {}),
                    ...(supplier !== undefined ? { supplier: supplier.trim() } : {}),
                    ...(description !== undefined ? { description: description.trim() } : {}),
                    ...(imageUrl !== undefined ? { imageUrl } : {}),
                    ...(inventoryTracking ? { inventoryTracking } : {}),
                    ...(pricing ? { pricing } : {}),
                    ...(stockLevel ? { stockLevel } : {}),
                },
                { new: true }
            );

            if (!updatedProduct) {
                throw new Error("Product not found or update unauthorized.");
            }

            return updatedProduct;
        },
        deleteProduct: async (_: any, { id }: { id: string }, context: any) => {
            await connectDB();
            const businessId = requireBusinessId(context);
            const deletedProduct = await Product.findOneAndDelete({
                _id: id,
                businessId: toBusinessQuery(businessId),
            });
            return Boolean(deletedProduct);
        },
    },
};