import { RoleEnum, Staff } from "@/src/app/model/staffRole.model";
import { connectDB } from "@/src/lib/connect";
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
      const filter = context.user?.businessId ? { businessId: context.user.businessId } : {};
      return Staff.find(filter);
    },
    staffMember: async (_: unknown, { id }: { id: string }) => {
      await connectDB();
      return Staff.findById(id);
    },
  },
  Mutation: {
    createStaff: async (
      _: unknown,
      { input }: { input: CreateStaffInput },
      context: AuthContext
    ) => {
      await connectDB();
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

      const businessId = context.user?.businessId || null;

      const newStaff = new Staff({
        businessId,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phoneNumber: phoneNumber?.trim() || null,
        password: hashedPassword, // Hash the password securely
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
      { id, input }: { id: string; input: UpdateStaffInput }
    ) => {
      await connectDB();
      const { branchId, password, temporaryPassword, ...restInput } = input;

      const updateData: Record<string, unknown> = { ...restInput };
      if (branchId) updateData.branch = branchId;

      const pwdToHash = password || temporaryPassword;
      if (pwdToHash) {
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        updateData.password = await bcrypt.hash(pwdToHash, saltRounds);
      }

      return Staff.findByIdAndUpdate(id, updateData, { new: true });
    },
    deleteStaff: async (_: unknown, { id }: { id: string }) => {
      await connectDB();
      const deletedStaff = await Staff.findByIdAndDelete(id);
      return Boolean(deletedStaff);
    },
  },
};