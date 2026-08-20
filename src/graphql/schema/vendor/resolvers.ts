import { IVendor, PaymentTerms, Vendor } from "@/src/app/model/vendor";
import { connectDB } from "@/src/lib/connect";

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
    vendors: async () => {
      await connectDB();
      const list = await Vendor.find().sort({ createdAt: -1 });
      return list.map(mapVendor);
    },
    vendor: async (_: unknown, { id }: { id: string }) => {
      await connectDB();
      const v = await Vendor.findById(id);
      return v ? mapVendor(v) : null;
    },
    suppliers: async () => {
      await connectDB();
      const list = await Vendor.find().sort({ createdAt: -1 });
      return list.map(mapVendor);
    },
    supplier: async (_: unknown, { id }: { id: string }) => {
      await connectDB();
      const v = await Vendor.findById(id);
      return v ? mapVendor(v) : null;
    },
  },

  Mutation: {
    createVendor: async (
      _: unknown,
      { input }: { input: CreateVendorInput }
    ) => {
      await connectDB();
      const payload: any = {
        ...input,
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
      { id, input }: { id: string; input: UpdateVendorInput }
    ) => {
      await connectDB();
      const updateData: any = { ...input };
      if (input.outstandingBalance !== undefined) {
        updateData.outstandingBalance = Number(input.outstandingBalance);
      }
      const updated = await Vendor.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        throw new Error("Supplier/Vendor not found");
      }
      return mapVendor(updated);
    },

    deleteVendor: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<boolean> => {
      await connectDB();
      const result = await Vendor.findByIdAndDelete(id);
      return !!result;
    },

    createSupplier: async (
      _: unknown,
      { input }: { input: CreateVendorInput }
    ) => {
      await connectDB();
      const payload: any = {
        ...input,
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
      { id, input }: { id: string; input: UpdateVendorInput }
    ) => {
      await connectDB();
      const updateData: any = { ...input };
      if (input.outstandingBalance !== undefined) {
        updateData.outstandingBalance = Number(input.outstandingBalance);
      }
      const updated = await Vendor.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        throw new Error("Supplier not found");
      }
      return mapVendor(updated);
    },

    deleteSupplier: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<boolean> => {
      await connectDB();
      const result = await Vendor.findByIdAndDelete(id);
      return !!result;
    },
  },
};