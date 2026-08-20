import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export enum RoleEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  CASHIER = 'CASHIER',
  ACCOUNTANT = 'ACCOUNTANT',
  INVENTORY_OFFICER = 'INVENTORY_OFFICER',
}

export interface IStaff extends Document {
  _id: mongoose.Types.ObjectId;
  businessId?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: RoleEnum;
  branch: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      required: [true, 'Role assignment is required'],
    },
    branch: {
      type: String,
      required: [true, 'Branch assignment is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Staff: Model<IStaff> =
  models.Staff || model<IStaff>('Staff', StaffSchema);