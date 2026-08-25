import mongoose,{ Schema, Document } from 'mongoose';

interface account {
    credit: number;
    debt: number
}

export interface Customer extends Document {
    businessId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive';
    totalPurchases: number;
    loyaltyPoints: number;
    creditBalance: number;
    loyaltyProgram: boolean;
    accountBalance: account;
    createdAt: Date;
    updatedAt: Date;
}

const accountSchema = new Schema<account>(
    {
        credit: { type: Number, default: 0 },
        debt: { type: Number, default: 0 },
    },
    { _id: false }
);

const customerSchema = new mongoose.Schema(
    {
        businessId: {
            type: Schema.Types.ObjectId,
            ref: 'Business',
            required: [true, 'Business ID is required'],
            index: true,
        },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
        totalPurchases: { type: Number, default: 0 },
        loyaltyPoints: { type: Number, default: 0 },
        creditBalance: { type: Number, default: 0 },
        loyaltyProgram: { type: Boolean, default: false },
        accountBalance: { type: accountSchema, default: () => ({ credit: 0, debt: 0 }) },
    },
    { timestamps: true }
);

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export default Customer;          