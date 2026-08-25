import mongoose from "mongoose";
import { RoleEnum, Staff } from "@/src/app/model/staffRole.model";
import { connectDB } from "@/src/lib/connect";
import { toBusinessQuery, requireBusinessId } from "@/src/lib/tenant";
import bcrypt from "bcryptjs";

type CreateStaffInput = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  temporaryPassword: string;
  role: RoleEnum;
  branchId: string;
  mustChangePassword?: boolean;
};

type UpdateStaffInput = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  temporaryPassword?: string;
  password?: string;
  role?: RoleEnum;
  branchId?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
};

type AuthContext = {
  user?: {
    userId: string;
    businessId: string;
    role: string;
    email: string;
    isStaff?: boolean;
  };
};

export const resolvers = {
  Query: {
    staffMembers: async (_: unknown, __: unknown, context: AuthContext) => {
      await connectDB();
      const businessId = context.user?.businessId;
      if (!businessId) return [];
      return Staff.find({ businessId: toBusinessQuery(businessId) }).sort({ createdAt: -1 });
    },
    staffMember: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
      await connectDB();
      const businessId = context.user?.businessId;
      if (!businessId) return null;
      return Staff.findOne({ _id: id, businessId: toBusinessQuery(businessId) });
    },
  },
  Mutation: {
    createStaff: async (
      _: unknown,
      { input }: { input: CreateStaffInput },
      context: AuthContext
    ) => {
      await connectDB();
      const businessId = requireBusinessId(context);

      const {
        fullName,
        email,
        phoneNumber,
        temporaryPassword,
        role,
        branchId,
        mustChangePassword,
      } = input;

      if (!fullName || !email || !temporaryPassword) {
        throw new Error("Missing required fields: fullName, email, and temporaryPassword.");
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingStaff = await Staff.findOne({
        email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
      });
      if (existingStaff) {
        throw new Error(`Staff member with email ${email} already exists.`);
      }

      const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

      const newStaff = new Staff({
        businessId: new mongoose.Types.ObjectId(businessId),
        fullName: fullName.trim(),
        email: normalizedEmail,
        phoneNumber: phoneNumber?.trim() || null,
        password: hashedPassword,
        role,
        branch: branchId,
        mustChangePassword: mustChangePassword ?? true,
        isActive: true,
      });

      const savedStaff = await newStaff.save();
      return savedStaff;
    },
    updateStaff: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateStaffInput },
      context: AuthContext
    ) => {
      await connectDB();
      const businessId = requireBusinessId(context);

      const { branchId, password, temporaryPassword, ...restInput } = input;

      const updateData: Record<string, unknown> = { ...restInput };
      if (branchId) updateData.branch = branchId;

      const pwdToHash = password || temporaryPassword;
      if (pwdToHash) {
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        updateData.password = await bcrypt.hash(pwdToHash, saltRounds);
      }

      const updated = await Staff.findOneAndUpdate(
        { _id: id, businessId: toBusinessQuery(businessId) },
        updateData,
        { new: true }
      );

      if (!updated) {
        throw new Error("Staff member not found or unauthorized.");
      }

      return updated;
    },
    deleteStaff: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const deletedStaff = await Staff.findOneAndDelete({
        _id: id,
        businessId: toBusinessQuery(businessId),
      });
      return Boolean(deletedStaff);
    },
  },
};