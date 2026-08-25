import mongoose from "mongoose";
import { Expense, PaymentMethod } from "@/src/app/model/expense";
import { connectDB } from "@/src/lib/connect";
import { toBusinessQuery, requireBusinessId } from "@/src/lib/tenant";

interface ExpenseInput {
    amount: number;
    description: string;
    dateOfExpense?: string;
    category: string;
    paymentMethod?: PaymentMethod;
    referenceNumber?: string;
    receiptUrl?: string;
    status?: string;
    isRecurring?: boolean;
}

const mapExpense = (e: any) => ({
    id: e._id.toString(),
    category: e.category,
    amount: typeof e.amount === "number" ? e.amount : 0,
    dateOfExpense: e.dateOfExpense ? new Date(e.dateOfExpense).toISOString() : new Date().toISOString(),
    paymentMethod: e.paymentMethod || "CASH",
    referenceNumber: e.referenceNumber,
    description: e.description,
    receiptUrl: e.receiptUrl,
    status: e.status || "Approved",
    isRecurring: Boolean(e.isRecurring),
    createdAt: e.createdAt ? e.createdAt.toISOString() : null,
    updatedAt: e.updatedAt ? e.updatedAt.toISOString() : null,
});

export const resolvers = {
    Query: {
        expenses: async (_: any, __: any, context: any) => {
            await connectDB();
            const businessId = context?.user?.businessId;
            if (!businessId) return [];
            const list = await Expense.find({ businessId: toBusinessQuery(businessId) }).sort({ dateOfExpense: -1, createdAt: -1 });
            return list.map(mapExpense);
        },
        expense: async (_: any, { id }: { id: string }, context: any) => {
            await connectDB();
            const businessId = context?.user?.businessId;
            if (!businessId) return null;
            const e = await Expense.findOne({ _id: id, businessId: toBusinessQuery(businessId) });
            return e ? mapExpense(e) : null;
        },
    },
    Mutation: {
        createExpense: async (
            _: any,
            { input }: { input: ExpenseInput },
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);
            const {
                amount,
                description,
                dateOfExpense,
                category,
                paymentMethod = PaymentMethod.CASH,
                referenceNumber,
                receiptUrl,
                status = "Approved",
                isRecurring = false,
            } = input;

            if (!amount || !description || !category) {
                throw new Error("Missing required fields: amount, description, category.");
            }

            const newExpense = new Expense({
                businessId: new mongoose.Types.ObjectId(businessId),
                amount: Number(amount),
                description: description.trim(),
                dateOfExpense: dateOfExpense ? new Date(dateOfExpense) : new Date(),
                category: category.trim(),
                paymentMethod,
                referenceNumber,
                receiptUrl,
                status,
                isRecurring,
            });

            const saved = await newExpense.save();
            return mapExpense(saved);
        },
        updateExpense: async (
            _: any,
            { id, input }: { id: string; input: Partial<ExpenseInput> },
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);
            const updateData: any = { ...input };
            if (input.dateOfExpense) {
                updateData.dateOfExpense = new Date(input.dateOfExpense);
            }
            if (input.amount !== undefined) {
                updateData.amount = Number(input.amount);
            }

            const updatedExpense = await Expense.findOneAndUpdate(
                { _id: id, businessId: toBusinessQuery(businessId) },
                updateData,
                { new: true }
            );
            if (!updatedExpense) {
                throw new Error("Expense not found or unauthorized.");
            }

            return mapExpense(updatedExpense);
        },
        deleteExpense: async (_: any, { id }: { id: string }, context: any) => {
            await connectDB();
            const businessId = requireBusinessId(context);
            const deleted = await Expense.findOneAndDelete({
                _id: id,
                businessId: toBusinessQuery(businessId),
            });
            return !!deleted;
        },
    },
};