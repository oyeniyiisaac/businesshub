import mongoose from "mongoose";
import { IVendor, PaymentTerms, Vendor } from "@/src/app/model/vendor";
import { connectDB } from "@/src/lib/connect";
import { toBusinessQuery, requireBusinessId } from "@/src/lib/tenant";

interface CreateVendorInput {
  businessName: string;
  category?: string;
  tin?: string;
  primaryContactPerson?: string;
  phoneNumber?: string;
  emailAddress?: string;
  physicalAddress?: string;
  defaultPaymentTerms?: PaymentTerms;
  initialBalanceOwed?: number;
  outstandingBalance?: number;
  activeOrders?: number;
  pendingDeliveries?: number;
  status?: string;
  enforceCreditLimit?: boolean;
  creditLimitAmount?: number;
}

interface UpdateVendorInput extends Partial<CreateVendorInput> {}

const mapVendor = (v: any) => ({
  id: v._id.toString(),
  businessName: v.businessName,
  category: v.category || "General",
  tin: v.tin,
  primaryContactPerson: v.primaryContactPerson,
  phoneNumber: v.phoneNumber,
  emailAddress: v.emailAddress,
  physicalAddress: v.physicalAddress,
  defaultPaymentTerms: v.defaultPaymentTerms || PaymentTerms.NET_30,
  initialBalanceOwed: typeof v.initialBalanceOwed === "number" ? v.initialBalanceOwed : 0,
  outstandingBalance: typeof v.outstandingBalance === "number" ? v.outstandingBalance : (v.initialBalanceOwed || 0),
  activeOrders: typeof v.activeOrders === "number" ? v.activeOrders : 0,
  pendingDeliveries: typeof v.pendingDeliveries === "number" ? v.pendingDeliveries : 0,
  status: v.status || "Active",
  enforceCreditLimit: Boolean(v.enforceCreditLimit),
  creditLimitAmount: typeof v.creditLimitAmount === "number" ? v.creditLimitAmount : 0,
  createdAt: v.createdAt ? v.createdAt.toISOString() : null,
  updatedAt: v.updatedAt ? v.updatedAt.toISOString() : null,
});

export const resolvers = {
  Query: {
    vendors: async (_: any, __: any, context: any) => {
      await connectDB();
      const businessId = context?.user?.businessId;
      if (!businessId) return [];
      const list = await Vendor.find({ businessId: toBusinessQuery(businessId) }).sort({ createdAt: -1 });
      return list.map(mapVendor);
    },
    vendor: async (_: unknown, { id }: { id: string }, context: any) => {
      await connectDB();
      const businessId = context?.user?.businessId;
      if (!businessId) return null;
      const v = await Vendor.findOne({ _id: id, businessId: toBusinessQuery(businessId) });
      return v ? mapVendor(v) : null;
    },
    suppliers: async (_: any, __: any, context: any) => {
      await connectDB();
      const businessId = context?.user?.businessId;
      if (!businessId) return [];
      const list = await Vendor.find({ businessId: toBusinessQuery(businessId) }).sort({ createdAt: -1 });
      return list.map(mapVendor);
    },
    supplier: async (_: unknown, { id }: { id: string }, context: any) => {
      await connectDB();
      const businessId = context?.user?.businessId;
      if (!businessId) return null;
      const v = await Vendor.findOne({ _id: id, businessId: toBusinessQuery(businessId) });
      return v ? mapVendor(v) : null;
    },
  },

  Mutation: {
    createVendor: async (
      _: unknown,
      { input }: { input: CreateVendorInput },
      context: any
    ) => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const payload: any = {
        ...input,
        businessId: new mongoose.Types.ObjectId(businessId),
        businessName: input.businessName.trim(),
        outstandingBalance: input.outstandingBalance ?? input.initialBalanceOwed ?? 0,
        initialBalanceOwed: input.initialBalanceOwed ?? input.outstandingBalance ?? 0,
        status: input.status === "Inactive" ? "Inactive" : "Active",
      };
      const vendor = new Vendor(payload);
      const saved = await vendor.save();
      return mapVendor(saved);
    },

    updateVendor: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateVendorInput },
      context: any
    ) => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const updateData: any = { ...input };
      if (input.outstandingBalance !== undefined) {
        updateData.outstandingBalance = Number(input.outstandingBalance);
      }
      const updated = await Vendor.findOneAndUpdate(
        { _id: id, businessId: toBusinessQuery(businessId) },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updated) {
        throw new Error("Supplier/Vendor not found or unauthorized");
      }
      return mapVendor(updated);
    },

    deleteVendor: async (
      _: unknown,
      { id }: { id: string },
      context: any
    ): Promise<boolean> => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const result = await Vendor.findOneAndDelete({
        _id: id,
        businessId: toBusinessQuery(businessId),
      });
      return !!result;
    },

    createSupplier: async (
      _: unknown,
      { input }: { input: CreateVendorInput },
      context: any
    ) => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const payload: any = {
        ...input,
        businessId: new mongoose.Types.ObjectId(businessId),
        businessName: input.businessName.trim(),
        outstandingBalance: input.outstandingBalance ?? input.initialBalanceOwed ?? 0,
        initialBalanceOwed: input.initialBalanceOwed ?? input.outstandingBalance ?? 0,
        status: input.status === "Inactive" ? "Inactive" : "Active",
      };
      const vendor = new Vendor(payload);
      const saved = await vendor.save();
      return mapVendor(saved);
    },

    updateSupplier: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateVendorInput },
      context: any
    ) => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const updateData: any = { ...input };
      if (input.outstandingBalance !== undefined) {
        updateData.outstandingBalance = Number(input.outstandingBalance);
      }
      const updated = await Vendor.findOneAndUpdate(
        { _id: id, businessId: toBusinessQuery(businessId) },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updated) {
        throw new Error("Supplier not found or unauthorized");
      }
      return mapVendor(updated);
    },

    deleteSupplier: async (
      _: unknown,
      { id }: { id: string },
      context: any
    ): Promise<boolean> => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const result = await Vendor.findOneAndDelete({
        _id: id,
        businessId: toBusinessQuery(businessId),
      });
      return !!result;
    },
  },
};