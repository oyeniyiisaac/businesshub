import Customer from "@/src/app/model/customer";
import { connectDB } from "@/src/lib/connect";

interface Account {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    accountBalance?: {
        credit?: number;
        debt?: number;
    };
    loyaltyProgram?: boolean;
}

export  const resolvers = {
    Query: {
        customers: async () => {
            await connectDB();
            return Customer.find();
        },
        customer: async (_: any, { id }: { id: string }) => {
            await connectDB();
            return Customer.findById(id);
        },
    },
    Mutation: {
        addCustomer: async (
            _: any,
            {
                name,
                email,
                phone,
                address,
                accountBalance,
                loyaltyProgram,
            }: Account
        ) => {
            await connectDB();

            if (!name || !email || !phone || !address) {
                throw new Error("Missing required fields: name, email, phone, and address.");
            }

            const newCustomer = new Customer({
                name,
                email,
                phone,
                address,
                accountBalance: {
                    credit: Number(accountBalance?.credit ?? 0),
                    debt: Number(accountBalance?. debt ?? 0)
                },
                loyaltyProgram: loyaltyProgram ?? false,
            });

            return newCustomer.save();
        },
        updateCustomer: async (
            _: any,
            {
                id,
                name,
                email,
                phone,
                address,
                accountBalance,
                loyaltyProgram,
            }: Account
        ) => {
            await connectDB();

            const updatedCustomer = await Customer.findByIdAndUpdate(
                id,
                {
                    ...(name && { name }),
                    ...(phone && { phone }),
                    ...(address && { address }),
                    ...(accountBalance ? {accountBalance} : {}),
                    ...(loyaltyProgram !== undefined && { loyaltyProgram }),
                },
                { new: true }
            );

            if (!updatedCustomer) {
                throw new Error("   Customer not found.");
            }
            if(email){
                throw new Error("email can not be updated")
            }

            return updatedCustomer;
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
}