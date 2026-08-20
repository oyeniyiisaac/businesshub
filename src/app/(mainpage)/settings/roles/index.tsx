"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Add,
  BarChart,
  Close,
  ContentCopy,
  Delete,
  FilterList,
  Inventory2,
  LocalShipping,
  People,
  PointOfSale,
  ReceiptLong,
  Security,
  Settings,
  SpaceDashboard,
  Store,
  SupervisorAccount,
} from "google-material-icons/filled";

interface PermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

interface GraphQLRole {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  userCount: number;
  modules: {
    module: string;
    permissions: PermissionActions;
  }[];
}

const MODULE_META: Record<string, { name: string; icon: React.ReactNode }> = {
  dashboard: { name: "Dashboard", icon: <SpaceDashboard size={16} /> },
  inventory: { name: "Inventory", icon: <Inventory2 size={16} /> },
  pos: { name: "POS", icon: <PointOfSale size={16} /> },
  customers: { name: "Customers", icon: <People size={16} /> },
  suppliers: { name: "Suppliers", icon: <LocalShipping size={16} /> },
  expenses: { name: "Expenses", icon: <ReceiptLong size={16} /> },
  reports: { name: "Reports", icon: <BarChart size={16} /> },
  settings: { name: "Settings", icon: <Settings size={16} /> },
};

const ORDERED_MODULES = [
  "dashboard",
  "inventory",
  "pos",
  "customers",
  "suppliers",
  "expenses",
  "reports",
  "settings",
];

const getRoleIcon = (roleName: string) => {
  const norm = roleName.toLowerCase();
  if (norm.includes("owner") || norm.includes("admin")) return <Security size={18} />;
  if (norm.includes("manager")) return <SupervisorAccount size={18} />;
  if (norm.includes("cashier")) return <ReceiptLong size={18} />;
  if (norm.includes("accountant")) return <Store size={18} />;
  if (norm.includes("inventory")) return <Inventory2 size={18} />;
  return <People size={18} />;
};

export default function RolesAndPermissionsContent() {
  const [roles, setRoles] = useState<GraphQLRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentModules, setCurrentModules] = useState<{ module: string; permissions: PermissionActions }[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State for New Role
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [duplicateFromRoleId, setDuplicateFromRoleId] = useState<string>("");

  const loadRoleModules = (role: GraphQLRole) => {
    const existingMap = new Map(role.modules.map((m) => [m.module, m.permissions]));
    const formatted = ORDERED_MODULES.map((modKey) => ({
      module: modKey,
      permissions: existingMap.get(modKey) || {
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
    }));
    setCurrentModules(formatted);
  };

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            query GetRoles {
              roles {
                id
                businessId
                name
                description
                isSystemRole
                userCount
                modules {
                  module
                  permissions {
                    view
                    create
                    edit
                    delete
                    approve
                  }
                }
              }
            }
          `,
        }),
      });

      const result = await res.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0].message || "Failed to fetch roles");
      }

      const fetchedRoles: GraphQLRole[] = result.data?.roles || [];
      setRoles(fetchedRoles);

      if (fetchedRoles.length > 0) {
        setSelectedRoleId((prev) => {
          const match = fetchedRoles.find((r) => r.id === prev);
          const activeRole = match || fetchedRoles[0];
          loadRoleModules(activeRole);
          return activeRole.id;
        });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSelectRole = (role: GraphQLRole) => {
    setSelectedRoleId(role.id);
    loadRoleModules(role);
    setFeedback(null);
  };

  const handleToggle = (
    moduleKey: string,
    action: keyof PermissionActions
  ) => {
    setCurrentModules((prev) =>
      prev.map((mod) =>
        mod.module === moduleKey
          ? {
              ...mod,
              permissions: {
                ...mod.permissions,
                [action]: !mod.permissions[action],
              },
            }
          : mod
      )
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedRoleId) return;
    setFeedback(null);
    setUpdating(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const cleanedModules = currentModules.map((m) => ({
        module: m.module,
        permissions: {
          view: Boolean(m.permissions.view),
          create: Boolean(m.permissions.create),
          edit: Boolean(m.permissions.edit),
          delete: Boolean(m.permissions.delete),
          approve: Boolean(m.permissions.approve),
        },
      }));

      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
              updateRole(id: $id, input: $input) {
                id
                name
                description
                isSystemRole
                userCount
                modules {
                  module
                  permissions {
                    view
                    create
                    edit
                    delete
                    approve
                  }
                }
              }
            }
          `,
          variables: {
            id: selectedRoleId,
            input: {
              modules: cleanedModules,
            },
          },
        }),
      });

      const result = await res.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0].message || "Failed to update role permissions");
      }

      try {
        localStorage.setItem("permissions_updated", Date.now().toString());
        window.dispatchEvent(new Event("storage"));
      } catch {
        // ignore
      }

      setFeedback({ type: "success", message: "Role permissions saved successfully!" });
      await fetchRoles();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save permissions." });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setFeedback(null);
    setCreating(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      let initialPerms = currentModules;
      if (duplicateFromRoleId) {
        const sourceRole = roles.find((r) => r.id === duplicateFromRoleId);
        if (sourceRole) {
          initialPerms = sourceRole.modules;
        }
      }

      const formattedModules = ORDERED_MODULES.map((modKey) => {
        const source = initialPerms.find((m) => m.module === modKey);
        return {
          module: modKey,
          permissions: {
            view: Boolean(source?.permissions.view),
            create: Boolean(source?.permissions.create),
            edit: Boolean(source?.permissions.edit),
            delete: Boolean(source?.permissions.delete),
            approve: Boolean(source?.permissions.approve),
          },
        };
      });

      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            mutation CreateRole($input: CreateRoleInput!) {
              createRole(input: $input) {
                id
                name
                description
                isSystemRole
                userCount
                modules {
                  module
                  permissions {
                    view
                    create
                    edit
                    delete
                    approve
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              name: newRoleName.trim(),
              description: newRoleDescription.trim() || undefined,
              modules: formattedModules,
            },
          },
        }),
      });

      const result = await res.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0].message || "Failed to create role");
      }

      setIsAddModalOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      setDuplicateFromRoleId("");
      setFeedback({ type: "success", message: `Role "${newRoleName}" created successfully!` });

      await fetchRoles();
      if (result.data?.createRole) {
        setSelectedRoleId(result.data.createRole.id);
        loadRoleModules(result.data.createRole);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to create role." });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (role: GraphQLRole) => {
    if (role.isSystemRole) {
      alert("System roles are protected and cannot be deleted.");
      return;
    }

    if (role.userCount > 0) {
      alert(`Cannot delete role: ${role.userCount} staff member(s) are currently assigned to it.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            mutation DeleteRole($id: ID!) {
              deleteRole(id: $id)
            }
          `,
          variables: { id: role.id },
        }),
      });

      const result = await res.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0].message || "Failed to delete role");
      }

      setFeedback({ type: "success", message: `Role "${role.name}" deleted.` });
      await fetchRoles();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete role." });
    } finally {
      setDeleting(false);
    }
  };

  const currentRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="p-4 md:p-6 space-y-6 w-full bg-surface-bright min-h-full">
      {/* Breadcrumbs & Header Section */}
      <div>
        <div className="text-xs text-on-surface-variant mb-1 font-medium flex items-center gap-1.5">
          <Link href="/settings" className="hover:text-primary transition-colors">
            Settings
          </Link>
          <span>&gt;</span>
          <span className="text-on-surface font-semibold">Roles & Permissions</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Roles & Permissions</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Define and manage access levels for your staff members to ensure operational security and efficiency.
            </p>
          </div>

          <button
            onClick={() => {
              setDuplicateFromRoleId(selectedRoleId);
              setIsAddModalOpen(true);
            }}
            className="self-start sm:self-auto bg-primary hover:bg-primary-container text-on-primary font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Add size={16} /> Add New Role
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:opacity-70">
            <Close size={14} />
          </button>
        </div>
      )}

      {loading && roles.length === 0 ? (
        <div className="flex items-center justify-center p-12 bg-surface-container-lowest rounded-xl border border-outline-variant">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-xs text-on-surface-variant">Loading roles and permissions matrix...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
          <p className="font-semibold">Unable to load roles</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : (
        /* Configuration Grid */
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column - Roles Selector */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-outline-variant">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                All Roles ({roles.length})
              </span>
              <button onClick={() => fetchRoles()} className="text-on-surface-variant hover:text-on-surface" title="Refresh">
                <FilterList size={16} />
              </button>
            </div>

            <div className="space-y-1 max-h-[550px] overflow-y-auto">
              {roles.map((role) => {
                const isActive = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-xs transition cursor-pointer ${
                      isActive
                        ? "bg-primary-container/20 text-primary font-semibold border border-primary/30"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? "text-primary" : "text-on-surface-variant"}>
                        {getRoleIcon(role.name)}
                      </span>
                      <div className="text-left">
                        <div>{role.name}</div>
                        {role.isSystemRole && (
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant">System</span>
                        )}
                      </div>
                    </div>
                    {role.userCount > 0 && (
                      <span className="text-[10px] text-primary font-medium">
                        {role.userCount} User{role.userCount > 1 ? "s" : ""} &gt;
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column - Permissions Matrix */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span>{currentRole?.name || "Role"} Permissions</span>
                  {currentRole?.isSystemRole && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-normal">
                      System Role
                    </span>
                  )}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {currentRole?.description || "Configure feature access and action privileges for this role."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-on-surface-variant">
                {currentRole && !currentRole.isSystemRole && (
                  <button
                    onClick={() => handleDeleteRole(currentRole)}
                    disabled={deleting}
                    className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition"
                    title="Delete Role"
                  >
                    <Delete size={18} />
                  </button>
                )}
                {currentRole && (
                  <button
                    onClick={() => {
                      setNewRoleName(`${currentRole.name} (Copy)`);
                      setNewRoleDescription(currentRole.description || "");
                      setDuplicateFromRoleId(currentRole.id);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 rounded hover:bg-surface-container-low transition"
                    title="Duplicate Role"
                  >
                    <ContentCopy size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Table Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-outline-variant text-on-surface-variant font-semibold">
                    <th className="py-3 px-2">Module / Category</th>
                    <th className="py-3 px-2 text-center">View</th>
                    <th className="py-3 px-2 text-center">Create</th>
                    <th className="py-3 px-2 text-center">Edit</th>
                    <th className="py-3 px-2 text-center">Delete</th>
                    <th className="py-3 px-2 text-center">Approve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {currentModules.map((item) => {
                    const meta = MODULE_META[item.module] || {
                      name: item.module,
                      icon: <Settings size={16} />,
                    };
                    return (
                      <tr key={item.module} className="hover:bg-surface-container-low/50">
                        <td className="py-3.5 px-2 font-medium text-on-surface flex items-center gap-2.5">
                          <span className="text-on-surface-variant">{meta.icon}</span>
                          <span className="capitalize">{meta.name}</span>
                        </td>

                        {(
                          ["view", "create", "edit", "delete", "approve"] as const
                        ).map((action) => (
                          <td key={action} className="py-3.5 px-2 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={Boolean(item.permissions[action])}
                                onChange={() => handleToggle(item.module, action)}
                              />
                              <div className="w-8 h-4 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-8 pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
              <button
                onClick={() => currentRole && loadRoleModules(currentRole)}
                className="px-4 py-2 border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-low transition cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={updating}
                className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Create Role Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">Create New Staff Role</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <Close size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-on-surface mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Procurement Specialist"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe the responsibilities of this role..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">
                  Base Permissions On (Optional)
                </label>
                <select
                  value={duplicateFromRoleId}
                  onChange={(e) => setDuplicateFromRoleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">Default Clean Matrix</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface font-semibold rounded-lg hover:bg-surface-container-low transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary font-semibold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creating ? "Creating..." : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
