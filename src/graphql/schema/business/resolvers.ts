import Business from "@/src/app/model/signup.model";
import { connectDB } from "@/src/lib/connect";
import mongoose from "mongoose";

interface AuthContext {
  user?: {
    userId?: string;
    businessId?: string;
    role?: string;
    email?: string;
    isStaff?: boolean;
  };
}

const mapBusinessProfile = (business: any) => {
  const taxRates = Array.isArray(business.taxRates)
    ? business.taxRates.map((t: any) => ({
        id: t._id ? t._id.toString() : t.id || Math.random().toString(36).substring(2, 9),
        name: t.name || "",
        description: t.description || "",
        rate: typeof t.rate === "number" ? t.rate : Number(t.rate) || 0,
        type: t.type || "Exclusive",
        status: t.status || "Active",
      }))
    : [];

  return {
    id: business._id.toString(),
    businessName: business.businessName || "BusinessHub NG",
    ownerName: business.ownerName || "",
    workEmail: business.workEmail || "",
    phoneNumber: business.phoneNumber || "",
    logoUrl: business.logoUrl || null,
    registeredAddress: business.registeredAddress || "",
    currency: business.currency || "NGN",
    taxNumber: business.taxNumber || "",
    timezone: business.timezone || "(GMT+01:00) West Central Africa",
    dateFormat: business.dateFormat || "DD/MM/YYYY",
    decimalPlaces: typeof business.decimalPlaces === "number" ? business.decimalPlaces : 2,
    showCurrencySymbol: business.showCurrencySymbol !== false,
    taxRates,
    createdAt: business.createdAt ? business.createdAt.toISOString() : null,
    updatedAt: business.updatedAt ? business.updatedAt.toISOString() : null,
  };
};

export const resolvers = {
  Query: {
    businessProfile: async (_: unknown, __: unknown, context: AuthContext) => {
      await connectDB();

      const businessId = context.user?.businessId;
      if (!businessId) {
        throw new Error("Unauthorized: Please log in.");
      }

      let business = null;
      if (mongoose.Types.ObjectId.isValid(businessId)) {
        business = await Business.findById(businessId);
      }
      if (!business) {
        business = await Business.findOne({
          $or: [
            { _id: businessId },
            { workEmail: context.user?.email },
          ],
        });
      }

      if (!business) {
        throw new Error("Business profile not found.");
      }

      return mapBusinessProfile(business);
    },
  },

  Mutation: {
    updateBusinessProfile: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          businessName?: string;
          ownerName?: string;
          workEmail?: string;
          phoneNumber?: string;
          logoUrl?: string;
          registeredAddress?: string;
          currency?: string;
          taxNumber?: string;
          timezone?: string;
          dateFormat?: string;
          decimalPlaces?: number;
          showCurrencySymbol?: boolean;
          taxRates?: Array<{
            id?: string;
            name: string;
            description?: string;
            rate: number;
            type: string;
            status: string;
          }>;
        };
      },
      context: AuthContext
    ) => {
      await connectDB();

      const businessId = context.user?.businessId;
      if (!businessId) {
        throw new Error("Unauthorized: Please log in.");
      }

      let business = null;
      if (mongoose.Types.ObjectId.isValid(businessId)) {
        business = await Business.findById(businessId);
      }
      if (!business) {
        business = await Business.findOne({
          $or: [
            { _id: businessId },
            { workEmail: context.user?.email },
          ],
        });
      }

      if (!business) {
        throw new Error("Business not found.");
      }

      if (input.businessName !== undefined) business.businessName = input.businessName.trim();
      if (input.ownerName !== undefined) business.ownerName = input.ownerName.trim();
      if (input.workEmail !== undefined) business.workEmail = input.workEmail.trim();
      if (input.phoneNumber !== undefined) business.phoneNumber = input.phoneNumber.trim();
      if (input.logoUrl !== undefined) business.logoUrl = input.logoUrl;
      if (input.registeredAddress !== undefined) business.registeredAddress = input.registeredAddress.trim();
      if (input.currency !== undefined) business.currency = input.currency.trim();
      if (input.taxNumber !== undefined) business.taxNumber = input.taxNumber.trim();
      if (input.timezone !== undefined) business.timezone = input.timezone.trim();
      if (input.dateFormat !== undefined) business.dateFormat = input.dateFormat.trim();
      if (input.decimalPlaces !== undefined) business.decimalPlaces = input.decimalPlaces;
      if (input.showCurrencySymbol !== undefined) business.showCurrencySymbol = Boolean(input.showCurrencySymbol);
      if (input.taxRates !== undefined) {
        business.taxRates = input.taxRates.map((t) => ({
          name: t.name.trim(),
          description: t.description ? t.description.trim() : "",
          rate: Number(t.rate) || 0,
          type: t.type === "Inclusive" ? "Inclusive" : "Exclusive",
          status: t.status === "Inactive" ? "Inactive" : "Active",
        }));
      }

      await business.save();

      return mapBusinessProfile(business);
    },
  },
};
