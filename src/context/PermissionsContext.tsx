"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface PermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface PermissionsContextType {
  userRole: string;
  isOwner: boolean;
  loading: boolean;
  permissions: Record<string, PermissionActions>;
  canView: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  canApprove: (module: string) => boolean;
  refetchPermissions: () => Promise<void>;
}

const FULL_ACTIONS: PermissionActions = {
  view: true,
  create: true,
  edit: true,
  delete: true,
  approve: true,
};

const PermissionsContext = createContext<PermissionsContextType>({
  userRole: "SUPER_ADMIN",
  isOwner: true,
  loading: true,
  permissions: {},
  canView: () => true,
  canCreate: () => true,
  canEdit: () => true,
  canDelete: () => true,
  canApprove: () => true,
  refetchPermissions: async () => {},
});

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<string>("SUPER_ADMIN");
  const [loading, setLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<Record<string, PermissionActions>>({});

  const normalized = (userRole || "SUPER_ADMIN").toUpperCase().replace(/\s+/g, "_");
  const isOwner = normalized === "SUPER_ADMIN" || normalized === "BUSINESS_OWNER" || normalized === "OWNER";

  const fetchPermissions = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole") || "SUPER_ADMIN";
    setUserRole(role);

    const normRole = role.toUpperCase().replace(/\s+/g, "_");
    if (normRole === "SUPER_ADMIN" || normRole === "BUSINESS_OWNER" || normRole === "OWNER") {
      const fullMap: Record<string, PermissionActions> = {};
      const modules = ["dashboard", "inventory", "pos", "customers", "suppliers", "expenses", "reports", "settings"];
      modules.forEach((m) => {
        fullMap[m] = { ...FULL_ACTIONS };
      });
      setPermissions(fullMap);
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetMyPermissions {
              myPermissions {
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
          `,
        }),
      });

      const result = await res.json();
      if (result.data?.myPermissions) {
        const map: Record<string, PermissionActions> = {};
        for (const item of result.data.myPermissions) {
          map[item.module.toLowerCase()] = {
            view: Boolean(item.permissions?.view),
            create: Boolean(item.permissions?.create),
            edit: Boolean(item.permissions?.edit),
            delete: Boolean(item.permissions?.delete),
            approve: Boolean(item.permissions?.approve),
          };
        }
        setPermissions(map);
        try {
          localStorage.setItem("userPermissions", JSON.stringify(map));
        } catch {
          // ignore storage errors
        }
      }
    } catch (err) {
      console.error("Failed to load permissions", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Read cached permissions on mount for instant UI load
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("userPermissions");
      if (cached) {
        try {
          setPermissions(JSON.parse(cached));
        } catch {
          // ignore parse error
        }
      }
    }
    fetchPermissions();

    // Listen for custom permissions update event across tabs or windows
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "permissions_updated" || e.key === "authToken" || e.key === "userRole") {
        fetchPermissions();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchPermissions]);

  const canView = useCallback(
    (module: string): boolean => {
      if (isOwner) return true;
      const mod = permissions[module.toLowerCase()];
      return mod ? Boolean(mod.view) : false;
    },
    [isOwner, permissions]
  );

  const canCreate = useCallback(
    (module: string): boolean => {
      if (isOwner) return true;
      const mod = permissions[module.toLowerCase()];
      return mod ? Boolean(mod.create) : false;
    },
    [isOwner, permissions]
  );

  const canEdit = useCallback(
    (module: string): boolean => {
      if (isOwner) return true;
      const mod = permissions[module.toLowerCase()];
      return mod ? Boolean(mod.edit) : false;
    },
    [isOwner, permissions]
  );

  const canDelete = useCallback(
    (module: string): boolean => {
      if (isOwner) return true;
      const mod = permissions[module.toLowerCase()];
      return mod ? Boolean(mod.delete) : false;
    },
    [isOwner, permissions]
  );

  const canApprove = useCallback(
    (module: string): boolean => {
      if (isOwner) return true;
      const mod = permissions[module.toLowerCase()];
      return mod ? Boolean(mod.approve) : false;
    },
    [isOwner, permissions]
  );

  return (
    <PermissionsContext.Provider
      value={{
        userRole,
        isOwner,
        loading,
        permissions,
        canView,
        canCreate,
        canEdit,
        canDelete,
        canApprove,
        refetchPermissions: fetchPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);
