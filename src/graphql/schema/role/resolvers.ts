import mongoose from "mongoose";
import Role from "@/src/app/model/role.model";
import { Staff } from "@/src/app/model/staffRole.model";
import { connectDB } from "@/src/lib/connect";

interface AuthContext {
  user?: {
    userId: string;
    businessId: string;
    role: string;
    email?: string;
  };
}

const DEFAULT_MODULE_KEYS = [
  "dashboard",
  "inventory",
  "pos",
  "customers",
  "suppliers",
  "expenses",
  "reports",
  "settings",
];

const getDefaultModulesForRole = (roleName: string) => {
  const norm = roleName.toUpperCase().replace(/\s+/g, "_");

  if (norm === "BUSINESS_OWNER" || norm === "SUPER_ADMIN" || norm === "OWNER") {
    return DEFAULT_MODULE_KEYS.map((mod) => ({
      module: mod,
      permissions: { view: true, create: true, edit: true, delete: true, approve: true },
    }));
  }

  if (norm === "BRANCH_MANAGER" || norm === "MANAGER") {
    return DEFAULT_MODULE_KEYS.map((mod) => {
      if (mod === "settings") {
        return { module: mod, permissions: { view: false, create: false, edit: false, delete: false, approve: false } };
      }
      if (mod === "reports") {
        return { module: mod, permissions: { view: true, create: false, edit: false, delete: false, approve: false } };
      }
      return { module: mod, permissions: { view: true, create: true, edit: true, delete: mod === "inventory", approve: true } };
    });
  }

  if (norm === "CASHIER") {
    return DEFAULT_MODULE_KEYS.map((mod) => {
      if (mod === "pos") {
        return { module: mod, permissions: { view: true, create: true, edit: false, delete: false, approve: false } };
      }
      if (mod === "customers" || mod === "inventory" || mod === "dashboard") {
        return { module: mod, permissions: { view: true, create: false, edit: false, delete: false, approve: false } };
      }
      return { module: mod, permissions: { view: false, create: false, edit: false, delete: false, approve: false } };
    });
  }

  if (norm === "ACCOUNTANT") {
    return DEFAULT_MODULE_KEYS.map((mod) => {
      if (mod === "expenses" || mod === "reports" || mod === "suppliers") {
        return { module: mod, permissions: { view: true, create: true, edit: true, delete: true, approve: true } };
      }
      if (mod === "customers" || mod === "dashboard") {
        return { module: mod, permissions: { view: true, create: false, edit: true, delete: false, approve: false } };
      }
      return { module: mod, permissions: { view: false, create: false, edit: false, delete: false, approve: false } };
    });
  }

  if (norm === "INVENTORY_OFFICER" || norm === "INVENTORY") {
    return DEFAULT_MODULE_KEYS.map((mod) => {
      if (mod === "inventory") {
        return { module: mod, permissions: { view: true, create: true, edit: true, delete: true, approve: true } };
      }
      if (mod === "suppliers" || mod === "dashboard") {
        return { module: mod, permissions: { view: true, create: true, edit: false, delete: false, approve: false } };
      }
      return { module: mod, permissions: { view: false, create: false, edit: false, delete: false, approve: false } };
    });
  }

  return DEFAULT_MODULE_KEYS.map((mod) => ({
    module: mod,
    permissions: { view: mod === "dashboard", create: false, edit: false, delete: false, approve: false },
  }));
};

const getStaffCountForRole = async (roleName: string, roleId: string) => {
  const norm = roleName.toUpperCase().replace(/\s+/g, "_");
  return Staff.countDocuments({
    $or: [
      { role: roleName as any },
      { role: norm as any },
      { role: roleId as any },
    ],
  } as any);
};

const seedDefaultRoles = async (businessId: string) => {
  const defaultRolesToCreate = [
    { name: "Business Owner", description: "Full enterprise privileges across all modules", isSystemRole: true },
    { name: "Branch Manager", description: "Operational management and branch supervision", isSystemRole: true },
    { name: "Cashier", description: "Point of Sale transactions and receipt generation", isSystemRole: true },
    { name: "Accountant", description: "Financial ledgers, expenses, and reporting", isSystemRole: true },
    { name: "Inventory Officer", description: "Stock intake, adjustments, and reorders", isSystemRole: true },
  ];

  for (const def of defaultRolesToCreate) {
    await Role.create({
      businessId,
      name: def.name,
      description: def.description,
      isSystemRole: def.isSystemRole,
      modules: getDefaultModulesForRole(def.name),
    });
  }
};

const toBusinessQuery = (businessId: string | mongoose.Types.ObjectId) => {
  const idStr = businessId.toString();
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    return { $in: [idStr, new mongoose.Types.ObjectId(idStr)] };
  }
  return idStr;
};

export const resolvers = {
  Query: {
    // 1. Fetch all roles for the authenticated business
    roles: async (_: unknown, __: unknown, context: AuthContext) => {
      await connectDB();

      const businessId = context.user?.businessId;
      if (!businessId) {
        throw new Error("Unauthorized: Please log in to manage roles and permissions.");
      }

      let roles = await Role.find({ businessId: toBusinessQuery(businessId) }).sort({ isSystemRole: -1, createdAt: -1 });

      // Auto-seed default system roles on first visit
      if (roles.length === 0) {
        await seedDefaultRoles(businessId);
        roles = await Role.find({ businessId: toBusinessQuery(businessId) }).sort({ isSystemRole: -1, createdAt: -1 });
      }

      return Promise.all(
        roles.map(async (role) => {
          const userCount = await getStaffCountForRole(role.name, role._id.toString());
          return {
            id: role._id.toString(),
            businessId: role.businessId.toString(),
            name: role.name,
            description: role.description,
            isSystemRole: Boolean(role.isSystemRole),
            modules: role.modules || [],
            userCount,
            createdAt: role.createdAt ? role.createdAt.toISOString() : null,
            updatedAt: role.updatedAt ? role.updatedAt.toISOString() : null,
          };
        })
      );
    },

    // 2. Fetch a single role by ID
    role: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
      await connectDB();

      const businessId = context.user?.businessId;
      if (!businessId) {
        throw new Error("Unauthorized: Please log in.");
      }

      const role = await Role.findOne({
        _id: id,
        businessId: toBusinessQuery(businessId),
      });

      if (!role) {
        throw new Error("Role not found.");
      }

      const userCount = await getStaffCountForRole(role.name, role._id.toString());

      return {
        id: role._id.toString(),
        businessId: role.businessId.toString(),
        name: role.name,
        description: role.description,
        isSystemRole: Boolean(role.isSystemRole),
        modules: role.modules || [],
        userCount,
        createdAt: role.createdAt ? role.createdAt.toISOString() : null,
        updatedAt: role.updatedAt ? role.updatedAt.toISOString() : null,
      };
    },

    // 3. Fetch the current logged in user's permissions matrix
    myPermissions: async (_: unknown, __: unknown, context: AuthContext) => {
      await connectDB();

      const user = context.user;
      if (!user) {
        throw new Error("Unauthorized: Please log in.");
      }

      const roleName = user.role || "SUPER_ADMIN";
      const normalizedRole = roleName.toUpperCase().replace(/\s+/g, "_");

      if (
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "BUSINESS_OWNER" ||
        normalizedRole === "OWNER"
      ) {
        return DEFAULT_MODULE_KEYS.map((mod) => ({
          module: mod,
          permissions: { view: true, create: true, edit: true, delete: true, approve: true },
        }));
      }

      // Resolve staff's businessId and role directly from database
      let businessId = user.businessId;
      let effectiveRole = roleName;

      if (user.userId) {
        try {
          const staffDoc = await Staff.findById(user.userId);
          if (staffDoc) {
            if (staffDoc.businessId) {
              businessId = staffDoc.businessId.toString();
            }
            if (staffDoc.role) {
              effectiveRole = staffDoc.role;
            }
          }
        } catch {
          // Ignore lookup failure
        }
      }

      const cleanRoleName = effectiveRole.trim();
      const normRoleName = cleanRoleName.toUpperCase().replace(/\s+/g, "_");

      // 1. Try finding role under the specific business
      if (businessId) {
        const customRole = await Role.findOne({
          businessId: toBusinessQuery(businessId),
          $or: [
            { name: { $regex: new RegExp(`^${cleanRoleName}$`, "i") } },
            { name: { $regex: new RegExp(`^${normRoleName.replace(/_/g, " ")}$`, "i") } },
            ...(cleanRoleName.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanRoleName }] : []),
          ],
        });

        if (customRole && customRole.modules && customRole.modules.length > 0) {
          return customRole.modules;
        }
      }

      // 2. Try finding role globally across business roles if businessId was not matched
      const fallbackRole = await Role.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${cleanRoleName}$`, "i") } },
          { name: { $regex: new RegExp(`^${normRoleName.replace(/_/g, " ")}$`, "i") } },
        ],
      }).sort({ updatedAt: -1 });

      if (fallbackRole && fallbackRole.modules && fallbackRole.modules.length > 0) {
        return fallbackRole.modules;
      }

      return getDefaultModulesForRole(cleanRoleName);
    },
  },

  Mutation: {
    // 3. Create a new role with permissions matrix
    createRole: async (
      _: unknown,
      { input }: { input: { name: string; description?: string; modules: any[] } },
      context: AuthContext
    ) => {
      await connectDB();

      const businessId = context.user?.businessId;
      if (!businessId) {
        throw new Error("Unauthorized: Please log in.");
      }

      if (!input.name || !input.name.trim()) {
        throw new Error("Role name is required.");
      }

      // Check for duplicate role names within this business
      const existingRole = await Role.findOne({
        businessId: toBusinessQuery(businessId),
        name: { $regex: new RegExp(`^${input.name.trim()}$`, "i") },
      });

      if (existingRole) {
        throw new Error("A role with this name already exists in your business.");
      }

      const newRole = await Role.create({
        businessId: new mongoose.Types.ObjectId(businessId),
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        isSystemRole: false,
        modules: input.modules && input.modules.length > 0 ? input.modules : getDefaultModulesForRole(input.name),
      });

      return {
        id: (newRole as any)._id.toString(),
        businessId: (newRole as any).businessId.toString(),
        name: (newRole as any).name,
        description: (newRole as any).description,
        isSystemRole: false,
        modules: (newRole as any).modules || [],
        userCount: 0,
        createdAt: (newRole as any).createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: (newRole as any).updatedAt?.toISOString() || new Date().toISOString(),
      };
    },

    // 4. Update an existing role's name or permissions matrix
    updateRole: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: { name?: string; description?: string; modules?: any[] };
      },
      context: AuthContext
    ) => {
      await connectDB();

      const businessId = context.user?.businessId;
      if (!businessId) {
        throw new Error("Unauthorized: Please log in.");
      }

      const role = await Role.findOne({
        _id: id,
        businessId: toBusinessQuery(businessId),
      });

      if (!role) {
        throw new Error("Role not found.");
      }

      if (input.name && input.name.trim() && input.name.trim() !== role.name) {
        const duplicateCheck = await Role.findOne({
          _id: { $ne: id },
          businessId: toBusinessQuery(businessId),
          name: { $regex: new RegExp(`^${input.name.trim()}$`, "i") },
        });
        if (duplicateCheck) {
          throw new Error("Another role with this name already exists.");
        }
        role.name = input.name.trim();
      }

      if (input.description !== undefined) {
        role.description = input.description?.trim() || "";
      }

      if (input.modules) {
        role.modules = input.modules;
      }

      await role.save();

      const userCount = await getStaffCountForRole(role.name, role._id.toString());

      return {
        id: role._id.toString(),
        businessId: role.businessId.toString(),
        name: role.name,
        description: role.description,
        isSystemRole: Boolean(role.isSystemRole),
        modules: role.modules || [],
        userCount,
        createdAt: role.createdAt ? role.createdAt.toISOString() : null,
        updatedAt: role.updatedAt ? role.updatedAt.toISOString() : null,
      };
    },

    // 5. Delete a custom role
    deleteRole: async (_: unknown, { id }: { id: string }, context: AuthContext) => {
      await connectDB();

      const businessId = context.user?.businessId;
      if (!businessId) {
        throw new Error("Unauthorized: Please log in.");
      }

      const role = await Role.findOne({
        _id: id,
        businessId,
      });

      if (!role) {
        throw new Error("Role not found.");
      }

      if (role.isSystemRole) {
        throw new Error("System roles are protected and cannot be deleted.");
      }

      const assignedStaffCount = await getStaffCountForRole(role.name, role._id.toString());
      if (assignedStaffCount > 0) {
        throw new Error(
          `Cannot delete role: ${assignedStaffCount} staff member(s) are currently assigned to it.`
        );
      }

      await Role.deleteOne({ _id: id });
      return true;
    },
  },
};