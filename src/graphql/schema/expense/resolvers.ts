import { Expense } from "@/src/app/model/expense";
import { connectDB } from "@/src/lib/connect";

interface ExpenseInput {
    amount: number;
    description: string;
    dateOfExpense: string;
    category: string;
    paymentMethod: string;
    referenceNumber?: string;
    receiptUrl?: string;
    isRecurring?: boolean;
    vendor?: string;
}

export const resolvers = {
    Query: {
        expenses: async () => {
            await connectDB();
            return Expense.find();
        },
        expense: async (_: any, { id }: { id: string }) => {
            await connectDB();
            return Expense.findById(id);
        },
    },
    Mutation: {
        createExpense: async (
            _: any,
            { input }: { input: ExpenseInput }
               
        ) => {
            await connectDB();
            const {
                 amount,
                description,
                dateOfExpense,
                category,
                paymentMethod,
                referenceNumber,
                receiptUrl,
                isRecurring,
                vendor,
            } = input;
            if (!amount || !description || !dateOfExpense || !category || !paymentMethod) {
                throw new Error("Missing required fields: amount, description, dateOfExpense, category, and payment method.");
            }

            if (Number(amount) < 0) {
                throw new Error("Amount must be a positive number.");
            }

            const newExpense = new Expense({
                amount,
                description,
                dateOfExpense,
                category,
                paymentMethod,
                referenceNumber,
                receiptUrl,
                isRecurring,
                vendor,
            });

            return await newExpense.save();
        },
        updateExpense: async (
            _: any,
            {
                id,
                amount,
                description,
                dateOfExpense,
                category,
                paymentMethod,
                referenceNumber,
                receiptUrl,
                isRecurring,
                vendor,
            }: { id: string } & Partial<ExpenseInput>
        ) => {
            await connectDB();

            const updatedExpense = await Expense.findByIdAndUpdate(
                id,
                {
                    amount,
                    description,
                    dateOfExpense,
                    category,
                    paymentMethod,
                    referenceNumber,
                    receiptUrl,
                    isRecurring,
                    vendor,
                },
                { new: true }
            );

            if (!updatedExpense) {
                throw new Error("Expense not found.");
            }

            return updatedExpense;
        },
        deleteExpense: async (_: any, { id }: { id: string }) => {
            await connectDB();

            const deletedExpense = await Expense.findByIdAndDelete(id);

            if (!deletedExpense) {
                throw new Error("Expense not found.");
            }

            return deletedExpense;
        },
    },
};