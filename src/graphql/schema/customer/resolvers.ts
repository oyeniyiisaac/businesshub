import Customer from "@/src/app/model/customer";
import { connectDB } from "@/src/lib/connect";

interface CustomerInput {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    status?: string;
    totalPurchases?: number;
    loyaltyPoints?: number;
    creditBalance?: number;
    accountBalance?: {
        credit?: number;
        debt?: number;
    };
    loyaltyProgram?: boolean;
}

export const resolvers = {
    Query: {
        customers: async () => {
            await connectDB();
            const list = await Customer.find().sort({ createdAt: -1 });
            return list.map((c) => ({
                id: c._id.toString(),
                name: c.name,
                email: c.email,
                phone: c.phone,
                address: c.address,
                status: c.status || "Active",
                totalPurchases: typeof c.totalPurchases === "number" ? c.totalPurchases : 0,
                loyaltyPoints: typeof c.loyaltyPoints === "number" ? c.loyaltyPoints : 0,
                creditBalance: typeof c.creditBalance === "number" ? c.creditBalance : (c.accountBalance?.debt || 0),
                accountBalance: c.accountBalance,
                loyaltyProgram: Boolean(c.loyaltyProgram),
                createdAt: c.createdAt ? c.createdAt.toISOString() : null,
                updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
            }));
        },
        customer: async (_: any, { id }: { id: string }) => {
            await connectDB();
            const c = await Customer.findById(id);
            if (!c) return null;
            return {
                id: c._id.toString(),
                name: c.name,
                email: c.email,
                phone: c.phone,
                address: c.address,
                status: c.status || "Active",
                totalPurchases: typeof c.totalPurchases === "number" ? c.totalPurchases : 0,
                loyaltyPoints: typeof c.loyaltyPoints === "number" ? c.loyaltyPoints : 0,
                creditBalance: typeof c.creditBalance === "number" ? c.creditBalance : (c.accountBalance?.debt || 0),
                accountBalance: c.accountBalance,
                loyaltyProgram: Boolean(c.loyaltyProgram),
                createdAt: c.createdAt ? c.createdAt.toISOString() : null,
                updatedAt: c.updatedAt ? c.updatedAt.toISOString() : null,
            };
        },
    },
    Mutation: {
        addCustomer: async (
            _: any,
            args: CustomerInput
        ) => {
            await connectDB();

            const {
                name,
                email,
                phone,
                address,
                status = "Active",
                totalPurchases = 0,
                loyaltyPoints = 0,
                creditBalance = 0,
                accountBalance,
                loyaltyProgram,
            } = args;

            if (!name || !email || !phone || !address) {
                throw new Error("Missing required fields: name, email, phone, and address.");
            }

            const newCustomer = new Customer({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                address: address.trim(),
                status: status === "Inactive" ? "Inactive" : "Active",
                totalPurchases: Number(totalPurchases) || 0,
                loyaltyPoints: Number(loyaltyPoints) || 0,
                creditBalance: Number(creditBalance) || Number(accountBalance?.debt) || 0,
                accountBalance: {
                    credit: Number(accountBalance?.credit ?? 0),
                    debt: Number(accountBalance?.debt ?? creditBalance ?? 0),
                },
                loyaltyProgram: loyaltyProgram ?? true,
            });

            const saved = await newCustomer.save();
            return {
                id: saved._id.toString(),
                name: saved.name,
                email: saved.email,
                phone: saved.phone,
                address: saved.address,
                status: saved.status,
                totalPurchases: saved.totalPurchases,
                loyaltyPoints: saved.loyaltyPoints,
                creditBalance: saved.creditBalance,
                accountBalance: saved.accountBalance,
                loyaltyProgram: saved.loyaltyProgram,
            };
        },
        updateCustomer: async (
            _: any,
            args: CustomerInput
        ) => {
            await connectDB();
            const { id, name, phone, address, status, totalPurchases, loyaltyPoints, creditBalance, accountBalance, loyaltyProgram } = args;

            const updateData: any = {};
            if (name !== undefined) updateData.name = name.trim();
            if (phone !== undefined) updateData.phone = phone.trim();
            if (address !== undefined) updateData.address = address.trim();
            if (status !== undefined) updateData.status = status;
            if (totalPurchases !== undefined) updateData.totalPurchases = Number(totalPurchases);
            if (loyaltyPoints !== undefined) updateData.loyaltyPoints = Number(loyaltyPoints);
            if (creditBalance !== undefined) {
                updateData.creditBalance = Number(creditBalance);
                updateData["accountBalance.debt"] = Number(creditBalance);
            }
            if (accountBalance !== undefined) updateData.accountBalance = accountBalance;
            if (loyaltyProgram !== undefined) updateData.loyaltyProgram = loyaltyProgram;

            const updated = await Customer.findByIdAndUpdate(id, updateData, { new: true });
            if (!updated) {
                throw new Error("Customer not found.");
            }

            return {
                id: updated._id.toString(),
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                address: updated.address,
                status: updated.status,
                totalPurchases: updated.totalPurchases,
                loyaltyPoints: updated.loyaltyPoints,
                creditBalance: updated.creditBalance,
                accountBalance: updated.accountBalance,
                loyaltyProgram: updated.loyaltyProgram,
            };
        },
        deleteCustomer: async (_: any, { id }: { id: string }) => {
            await connectDB();
            const deletedCustomer = await Customer.findByIdAndDelete(id);
            if (!deletedCustomer) {
                throw new Error("Customer not found.");
            }
            return true;
        },
    },
};