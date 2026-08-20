import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPermissionAction {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface IPermissionModule {
  module: string; // e.g., 'dashboard', 'inventory', 'pos', 'customers', 'suppliers', 'expenses', 'reports', 'settings'
  permissions: IPermissionAction;
}

export interface IRole extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Branch Manager', 'Accountant', 'Cashier'
  description?: string;
  isSystemRole: boolean; // Protects built-in roles like 'SUPER_ADMIN' or 'Business Owner' from deletion
  modules: IPermissionModule[];
  createdAt: Date;
  updatedAt: Date;
}

const PermissionActionSchema = new Schema<IPermissionAction>(
  {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
  },
  { _id: false }
);

const PermissionModuleSchema = new Schema<IPermissionModule>(
  {
    module: { type: String, required: true },
    permissions: { type: PermissionActionSchema, required: true },
  },
  { _id: false }
);

const RoleSchema = new Schema<IRole>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    modules: [PermissionModuleSchema],
  },
  { timestamps: true }
);

// Prevent duplicate role names within the same business
RoleSchema.index({ businessId: 1, name: 1 }, { unique: true });

const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);

export default Role;