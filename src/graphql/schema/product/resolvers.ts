import { Product } from "@/src/app/model/product.model";
import { connectDB } from "@/src/lib/connect";

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
        products: async () => {
            await connectDB();
            return Product.find();
        },
        product: async (_: any, { id }: { id: string }) => {
            await connectDB();
            return Product.findById(id);
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
            }: ProductInput
        ) => {
            await connectDB();

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
                name,
                category,
                brand: brand || undefined,
                supplier: supplier || "Main Warehouse",
                description: description || "",
                imageUrl: imageUrl || "",
                inventoryTracking: {
                    sku: inventoryTracking?.sku || "",
                    unitOfMeasure: inventoryTracking?.unitOfMeasure || "Pcs (Pieces)",
                    barcode: inventoryTracking?.barcode || "",
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
            console.log("New product created:", newProduct);
            return newProduct;
        },
        createProduct: async (
            _: any,
            args: ProductInput
        ) => {
            await connectDB();

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
                name,
                category,
                brand: brand || undefined,
                supplier: supplier || "Main Warehouse",
                description: description || "",
                imageUrl: imageUrl || "",
                inventoryTracking: {
                    sku: inventoryTracking?.sku || "",
                    unitOfMeasure: inventoryTracking?.unitOfMeasure || "Pcs (Pieces)",
                    barcode: inventoryTracking?.barcode || "",
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
            { id, name, category, brand, supplier, description, imageUrl, inventoryTracking, pricing, stockLevel }: any
        ) => {
            await connectDB();

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                {
                    ...(name ? { name } : {}),
                    ...(category ? { category } : {}),
                    ...(brand !== undefined ? { brand } : {}),
                    ...(supplier !== undefined ? { supplier } : {}),
                    ...(description !== undefined ? { description } : {}),
                    ...(imageUrl !== undefined ? { imageUrl } : {}),
                    ...(inventoryTracking ? { inventoryTracking } : {}),
                    ...(pricing ? { pricing } : {}),
                    ...(stockLevel ? { stockLevel } : {}),
                },
                { new: true }
            );

            if (!updatedProduct) {
                throw new Error("Product not found or update failed.");
            }

            return updatedProduct;
        },
        deleteProduct: async (_: any, { id }: { id: string }) => {
            await connectDB();
            const deletedProduct = await Product.findByIdAndDelete(id);
            return Boolean(deletedProduct);
        },
    },
};