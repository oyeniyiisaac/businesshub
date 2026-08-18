import { IVendor, PaymentTerms, Vendor } from "@/src/app/model/vendor";

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
  enforceCreditLimit?: boolean;
  creditLimitAmount?: number;
}

interface UpdateVendorInput extends Partial<CreateVendorInput> {}

export const resolvers = {
  Query: {
    vendors: async (): Promise<IVendor[]> => {
      return await Vendor.find().sort({ createdAt: -1 });
    },
    vendor: async (_: unknown, { id }: { id: string }): Promise<IVendor | null> => {
      return await Vendor.findById(id);
    },
  },

  Mutation: {
    createVendor: async (
      _: unknown,
      { input }: { input: CreateVendorInput }
    ): Promise<IVendor> => {
      const vendor = new Vendor(input);
      return await vendor.save();
    },

    updateVendor: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateVendorInput }
    ): Promise<IVendor | null> => {
      return await Vendor.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      });
    },

    deleteVendor: async (
      _: unknown,
      { id }: { id: string }
    ): Promise<boolean> => {
      const result = await Vendor.findByIdAndDelete(id);
      return !!result;
    },
  },
};