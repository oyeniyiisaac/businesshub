import { Branch, IBusinessHours, TaxRule } from "@/src/app/model/branch";
import { connectDB } from "@/src/lib/connect";

type CreateBranchInput = {
    branchName: string;
    branchCode: string;
    assignedManager?: string;
    fullAddress?: string;
    city?: string;
    state?: string;
    phoneNumber?: string;
    branchEmail?: string;
    defaultTaxRule?: TaxRule;
    businessHours?: IBusinessHours;
    isActive?: boolean;
};
interface UpdateBranchInput extends Partial<Omit<CreateBranchInput, 'branchCode'>> { }
export const resolvers = {
    Query: {
        branches: async () => {
            await connectDB();
            return Branch.find();
        },
        branch: async (_: any, { id }: { id: string }) => {
            await connectDB();
            return Branch.findById(id);
        },
    },
    Mutation: {
        createBranch: async (
            _: any,
            { input }: { input: CreateBranchInput }
        ) => {
            await connectDB();
            const { branchName, branchCode, assignedManager } = input;
            if (!branchName || !branchCode || !assignedManager) {
                throw new Error("Missing required fields: branchName, branchCode, and assignedManager.");
            }

            const existingBranch = await Branch.findOne({ branchCode });
            if (existingBranch) {
                throw new Error(`Branch with code ${branchCode} already exists.`);
            }

            const newBranch = new Branch(input);

            return newBranch.save();
        },
        updateBranch: async (
            _: any,
            { id, input }: { id: string; input: UpdateBranchInput }
        ) => {
            await connectDB();
            return Branch.findByIdAndUpdate(id, input, { new: true });

        },
        deleteBranch: async (
            _: any,
            { id }: { id: string }
        ) => {
            await connectDB();
            return Branch.findByIdAndDelete(id);
        }
    },
};