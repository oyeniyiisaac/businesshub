import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ITransactionCustomer {
  customerId?: string;
  name: string;
  phone?: string;
  email?: string;
  loyaltyPointsEarned?: number;
}

export interface ITransactionCashier {
  cashierId?: string;
  name?: string;
}

export interface ITransaction extends Document {
  receiptNumber: string;
  businessId?: mongoose.Types.ObjectId;
  branchId?: string;
  customer: ITransactionCustomer;
  cashier: ITransactionCashier;
  items: ITransactionItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | "INVOICE";
  paymentStatus: "SUCCESSFUL" | "PENDING" | "REFUNDED" | "CANCELLED";
  transactionRef?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionItemSchema = new Schema<ITransactionItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const TransactionCustomerSchema = new Schema<ITransactionCustomer>(
  {
    customerId: { type: String },
    name: { type: String, default: "Walk-in Customer" },
    phone: { type: String },
    email: { type: String },
    loyaltyPointsEarned: { type: Number, default: 0 },
  },
  { _id: false }
);

const TransactionCashierSchema = new Schema<ITransactionCashier>(
  {
    cashierId: { type: String },
    name: { type: String, default: "Super Admin" },
  },
  { _id: false }
);

const TransactionSchema = new Schema<ITransaction>(
  {
    receiptNumber: { type: String, required: true, unique: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", index: true },
    branchId: { type: String, default: "Main Branch" },
    customer: { type: TransactionCustomerSchema, required: true },
    cashier: { type: TransactionCashierSchema, required: true },
    items: { type: [TransactionItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "TRANSFER", "INVOICE"],
      default: "CARD",
    },
    paymentStatus: {
      type: String,
      enum: ["SUCCESSFUL", "PENDING", "REFUNDED", "CANCELLED"],
      default: "SUCCESSFUL",
    },
    transactionRef: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
