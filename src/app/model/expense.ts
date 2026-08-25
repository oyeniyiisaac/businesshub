import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  POS = 'POS',
  OTHER = 'OTHER',
}

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  dateOfExpense: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  description?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Expense Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dateOfExpense: {
      type: Date,
      required: [true, 'Date of Expense is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.CASH,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    receiptUrl: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Approved',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense: Model<IExpense> =
  models.Expense || model<IExpense>('Expense', ExpenseSchema);