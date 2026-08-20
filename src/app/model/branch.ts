import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export enum TaxRule {
  STANDARD_VAT = 'STANDARD_VAT', // 7.5%
  ZERO_RATED = 'ZERO_RATED',     // 0%
  TAX_EXEMPT = 'TAX_EXEMPT',
}

export interface IBusinessHours {
  openingTime: string; // e.g., "08:00 AM"
  closingTime: string; // e.g., "06:00 PM"
}

export interface IBranch extends Document {
  _id: mongoose.Types.ObjectId;
  // Branch Details
  branchName: string;
  branchCode: string;
  assignedManager?: string; // Can be a User ObjectId or String reference
  
  // Location & Contact
  fullAddress?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  branchEmail?: string;
  
  // Operational Settings
  defaultTaxRule: TaxRule;
  businessHours: IBusinessHours;
  totalStaff?: number;
  todaySales?: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const BusinessHoursSchema = new Schema<IBusinessHours>(
  {
    openingTime: { type: String, default: '08:00 AM' },
    closingTime: { type: String, default: '06:00 PM' },
  },
  { _id: false }
);

const BranchSchema = new Schema<IBranch>(
  {
    branchName: {
      type: String,
      required: [true, 'Branch Name is required'],
      trim: true,
    },
    branchCode: {
      type: String,
      required: [true, 'Branch Code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    assignedManager: {
      type: String,
      trim: true,
      default: null,
    },
    fullAddress: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    state: {
      type: String,
      trim: true,
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
    },
    branchEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    defaultTaxRule: {
      type: String,
      enum: Object.values(TaxRule),
      default: TaxRule.STANDARD_VAT,
    },
    businessHours: {
      type: BusinessHoursSchema,
      default: () => ({ openingTime: '08:00 AM', closingTime: '06:00 PM' }),
    },
    totalStaff: {
      type: Number,
      default: 0,
    },
    todaySales: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Branch: Model<IBranch> =
  models.Branch || model<IBranch>('Branch', BranchSchema);