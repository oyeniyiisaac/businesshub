import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export enum PaymentTerms {
  DUE_ON_RECEIPT = 'DUE_ON_RECEIPT',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
}

export interface IVendor extends Document {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  businessName: string;
  category?: string;
  tin?: string;
  primaryContactPerson?: string;
  phoneNumber?: string;
  emailAddress?: string;
  physicalAddress?: string;
  defaultPaymentTerms: PaymentTerms;
  initialBalanceOwed: number;
  outstandingBalance: number;
  activeOrders?: number;
  pendingDeliveries?: number;
  status: 'Active' | 'Inactive';
  enforceCreditLimit: boolean;
  creditLimitAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business Name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    tin: {
      type: String,
      trim: true,
    },
    primaryContactPerson: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },
    physicalAddress: {
      type: String,
      trim: true,
    },
    defaultPaymentTerms: {
      type: String,
      enum: Object.values(PaymentTerms),
      default: PaymentTerms.NET_30,
    },
    initialBalanceOwed: {
      type: Number,
      default: 0.0,
    },
    outstandingBalance: {
      type: Number,
      default: 0.0,
    },
    activeOrders: {
      type: Number,
      default: 0,
    },
    pendingDeliveries: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    enforceCreditLimit: {
      type: Boolean,
      default: false,
    },
    creditLimitAmount: {
      type: Number,
      default: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

export const Vendor: Model<IVendor> =
  models.Vendor || model<IVendor>('Vendor', VendorSchema);