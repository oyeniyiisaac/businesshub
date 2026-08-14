import mongoose, { Schema, Document } from 'mongoose';

// 1. DEFINE TS INTERFACES FOR NESTED OBJECTS

interface IInventoryTracking {
  sku?: string;
  unitOfMeasure: string;
  barcode?: string;
}

interface IPricingAndTax {
  costPrice: number;
  sellingPrice: number;
  taxRule: string;
}

interface IStockLevel {
  initialQuantity: number;
  lowStockThreshold: number;
  enableLowStockAlerts: boolean;
}

// MAIN PRODUCT INTERFACE
export interface IProduct extends Document {
  name: string;
  category: Schema.Types.ObjectId;
  brand?: Schema.Types.ObjectId;
  description?: string;
  
  // Nested Objects (Object within Object)
  inventoryTracking: IInventoryTracking;
  pricing: IPricingAndTax;
  stockLevel: IStockLevel;
}

// 2. DEFINE MONGOOSE SCHEMAS FOR NESTED OBJECTS

const inventoryTrackingSchema = new Schema<IInventoryTracking>(
  {
    sku: { type: String, trim: true },
    unitOfMeasure: { type: String, default: 'Pcs' },
    barcode: { type: String, trim: true },
  },
  { _id: false } // Prevents Mongoose from auto-generating _id for this sub-object
);

const pricingAndTaxSchema = new Schema<IPricingAndTax>(
  {
    costPrice: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    taxRule: { type: String, default: 'VAT 7.5%' },
  },
  { _id: false }
);

const stockLevelSchema = new Schema<IStockLevel>(
  {
    initialQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    enableLowStockAlerts: { type: Boolean, default: true },
  },
  { _id: false }
);

// 3. MAIN PRODUCT SCHEMA

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
    description: { type: String, trim: true },

    // Embedding the nested objects
    inventoryTracking: { type: inventoryTrackingSchema, required: true },
    pricing: { type: pricingAndTaxSchema, required: true },
    stockLevel: { type: stockLevelSchema, required: true },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);