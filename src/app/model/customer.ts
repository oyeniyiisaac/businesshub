import mongoose,{ Schema, Document } from 'mongoose';

interface account {
    credit: number;
    debt: number
}

export interface Customer extends Document {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    loyaltyProgram: { type: Boolean, default: false },

    accuntBalance: account
}

const accountSchema = new Schema<account>(
    {
        credit: {type: Number, default: 0},
        debt: {type: Number, default: 0}
    }
)

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    loyaltyProgram: { type: Boolean, default: false },

    accountBalance: {type: accountSchema, required: true}
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export default Customer;          