import Role, { IPermissionAction } from "@/src/app/model/role.model";
import { connectDB } from "@/src/lib/connect";

export type PermissionActionKey = "view" | "create" | "edit" | "delete" | "approve";

export type ModuleKey =
  | "dashboard"
  | "inventory"
  | "pos"
  | "customers"
  | "suppliers"
  | "expenses"
  | "reports"
  | "settings";

/**
 * Checks if a specific role in a business has permission for a module and action.
 * Super Admins / Business Owners always have full permissions.
 */
export async function checkRolePermission(
  businessId: string,
  roleNameOrId: string,
  moduleKey: ModuleKey,
  action: PermissionActionKey
): Promise<boolean> {
  if (!roleNameOrId) return false;

  const normalized = roleNameOrId.toUpperCase().replace(/\s+/g, "_");

  // SUPER_ADMIN or OWNER has full access to everything
  if (
    normalized === "SUPER_ADMIN" ||
    normalized === "BUSINESS_OWNER" ||
    normalized === "OWNER"
  ) {
    return true;
  }

  await connectDB();

  // Search role by ID or Name
  const role = await Role.findOne({
    businessId,
    $or: [
      { name: { $regex: new RegExp(`^${roleNameOrId}$`, "i") } },
      { name: { $regex: new RegExp(`^${normalized.replace(/_/g, " ")}$`, "i") } },
      ...(roleNameOrId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: roleNameOrId }] : []),
    ],
  });

  if (!role) {
    return false;
  }

  const modulePerm = role.modules.find(
    (m) => m.module.toLowerCase() === moduleKey.toLowerCase()
  );

  if (!modulePerm || !modulePerm.permissions) {
    return false;
  }

  return Boolean(modulePerm.permissions[action]);
}

/**
 * Helper to get all permissions for a role in a business.
 */
export async function getRolePermissionMatrix(
  businessId: string,
  roleNameOrId: string
): Promise<Record<string, IPermissionAction>> {
  await connectDB();

  const normalized = roleNameOrId.toUpperCase().replace(/\s+/g, "_");

  if (
    normalized === "SUPER_ADMIN" ||
    normalized === "BUSINESS_OWNER" ||
    normalized === "OWNER"
  ) {
    const fullAccess: IPermissionAction = {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
    };
    return {
      dashboard: fullAccess,
      inventory: fullAccess,
      pos: fullAccess,
      customers: fullAccess,
      suppliers: fullAccess,
      expenses: fullAccess,
      reports: fullAccess,
      settings: fullAccess,
    };
  }

  const role = await Role.findOne({
    businessId,
    $or: [
      { name: { $regex: new RegExp(`^${roleNameOrId}$`, "i") } },
      { name: { $regex: new RegExp(`^${normalized.replace(/_/g, " ")}$`, "i") } },
      ...(roleNameOrId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: roleNameOrId }] : []),
    ],
  });

  const matrix: Record<string, IPermissionAction> = {};

  if (role) {
    for (const mod of role.modules) {
      matrix[mod.module] = mod.permissions;
    }
  }

  return matrix;
}
