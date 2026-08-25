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
  businessId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  brand?: string;
  supplier?: string;
  description?: string;
  imageUrl?: string;
  
  // Nested Objects (Object within Object)
  inventoryTracking: IInventoryTracking;
  pricing: IPricingAndTax;
  stockLevel: IStockLevel;
  createdAt: Date;
  updatedAt: Date;
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
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, 
    brand: { type: String, trim: true }, 
    supplier: { type: String, trim: true, default: 'Main Warehouse' },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true, default: '' },

    // Embedding the nested objects
    inventoryTracking: { type: inventoryTrackingSchema, required: true },
    pricing: { type: pricingAndTaxSchema, required: true },
    stockLevel: { type: stockLevelSchema, required: true },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);