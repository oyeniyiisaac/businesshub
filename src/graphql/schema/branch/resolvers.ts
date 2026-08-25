import mongoose from "mongoose";
import { Branch, IBusinessHours, TaxRule } from "@/src/app/model/branch";
import { connectDB } from "@/src/lib/connect";
import { toBusinessQuery, requireBusinessId } from "@/src/lib/tenant";

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
        branches: async (_: any, __: any, context: any) => {
            await connectDB();
            const businessId = context?.user?.businessId;
            if (!businessId) return [];
            return Branch.find({ businessId: toBusinessQuery(businessId) }).sort({ createdAt: -1 });
        },
        branch: async (_: any, { id }: { id: string }, context: any) => {
            await connectDB();
            const businessId = context?.user?.businessId;
            if (!businessId) return null;
            return Branch.findOne({ _id: id, businessId: toBusinessQuery(businessId) });
        },
    },
    Mutation: {
        createBranch: async (
            _: any,
            { input }: { input: CreateBranchInput },
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);
            const { branchName, branchCode, assignedManager } = input;
            if (!branchName || !branchCode || !assignedManager) {
                throw new Error("Missing required fields: branchName, branchCode, and assignedManager.");
            }

            const existingBranch = await Branch.findOne({
                businessId: toBusinessQuery(businessId),
                branchCode: branchCode.trim().toUpperCase(),
            });
            if (existingBranch) {
                throw new Error(`Branch with code ${branchCode} already exists in your business.`);
            }

            const newBranch = new Branch({
                ...input,
                businessId: new mongoose.Types.ObjectId(businessId),
                branchCode: branchCode.trim().toUpperCase(),
            });

            return newBranch.save();
        },
        updateBranch: async (
            _: any,
            { id, input }: { id: string; input: UpdateBranchInput },
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);
            const updated = await Branch.findOneAndUpdate(
                { _id: id, businessId: toBusinessQuery(businessId) },
                input,
                { new: true }
            );

            if (!updated) {
                throw new Error("Branch not found or unauthorized.");
            }

            return updated;
        },
        deleteBranch: async (
            _: any,
            { id }: { id: string },
            context: any
        ) => {
            await connectDB();
            const businessId = requireBusinessId(context);
            const deleted = await Branch.findOneAndDelete({
                _id: id,
                businessId: toBusinessQuery(businessId),
            });
            return Boolean(deleted);
        }
    },
};