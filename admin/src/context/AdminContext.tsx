import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AdminRole, AdminUser } from "../services/api";

export type NavView =
  | "dashboard"
  | "merchants"
  | "credit"
  | "coop"
  | "risk"
  | "reports"
  | "settings"
  | "admin_users"
  | "audit_log";

export const ROLE_PERMISSIONS: Record<AdminRole, Record<string, string[]>> = {
  super_admin: {
    dashboard:   ["view"],
    merchants:   ["view", "create", "edit", "approve", "reject", "suspend", "export"],
    credit:      ["view", "create", "edit", "approve", "reject", "export"],
    coop:        ["view", "create", "edit", "export"],
    risk:        ["view", "create", "edit", "export"],
    reports:     ["view", "export"],
    settings:    ["view", "edit"],
    admin_users: ["view", "create", "edit", "delete"],
    audit_log:   ["view", "export"],
  },
  operations_manager: {
    dashboard:   ["view"],
    merchants:   ["view", "create", "edit", "approve", "reject", "suspend", "export"],
    credit:      ["view"],
    coop:        ["view", "create", "edit", "export"],
    reports:     ["view", "export"],
    settings:    ["view"],
  },
  risk_officer: {
    dashboard:   ["view"],
    merchants:   ["view", "export"],
    risk:        ["view", "create", "edit", "export"],
    reports:     ["view", "export"],
  },
  credit_analyst: {
    dashboard:   ["view"],
    merchants:   ["view", "export"],
    credit:      ["view", "create", "edit", "approve", "reject", "export"],
    reports:     ["view", "export"],
  },
  compliance_officer: {
    dashboard:   ["view"],
    merchants:   ["view", "approve", "reject", "export"],
    reports:     ["view", "export"],
    audit_log:   ["view"],
  },
};

interface AdminContextValue {
  admin: AdminUser | null;
  loading: boolean;
  refresh: () => void;
  isSuperAdmin: boolean;
  hasRole: (role: AdminRole | AdminRole[]) => boolean;
  can: (resource: string, action?: string) => boolean;
  hasAnyAccess: (resource: string) => boolean;
  hasAnyNavAccess: (views: NavView[]) => boolean;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const RESOURCE_BY_VIEW: Record<NavView, string> = {
  dashboard: "dashboard",
  merchants: "merchants",
  credit: "credit",
  coop: "coop",
  risk: "risk",
  reports: "reports",
  settings: "settings",
  admin_users: "admin_users",
  audit_log: "audit_log",
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("kn_admin_user");
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {
        localStorage.removeItem("kn_admin_user");
      }
    }
    setLoading(false);
  }, []);

  const refresh = () => {
    const saved = localStorage.getItem("kn_admin_user");
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {
        setAdmin(null);
      }
    } else {
      setAdmin(null);
    }
  };

  const isSuperAdmin = admin?.role === "super_admin";

  const hasRole = (role: AdminRole | AdminRole[]) => {
    if (!admin) return false;
    if (Array.isArray(role)) return role.includes(admin.role);
    return admin.role === role;
  };

  const can = (resource: string, action = "view") => {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;

    // First check user object permissions, fallback to canonical matrix
    const perms =
      admin.permissions && Object.keys(admin.permissions).length > 0
        ? admin.permissions
        : ROLE_PERMISSIONS[admin.role] || {};

    const actions = perms[resource];
    if (!actions) return false;
    return actions.includes(action);
  };

  const hasAnyAccess = (resource: string) => {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;

    const perms =
      admin.permissions && Object.keys(admin.permissions).length > 0
        ? admin.permissions
        : ROLE_PERMISSIONS[admin.role] || {};

    const actions = perms[resource];
    return !!actions && actions.length > 0;
  };

  const hasAnyNavAccess = (views: NavView[]) => {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;
    return views.some((v) => hasAnyAccess(RESOURCE_BY_VIEW[v]));
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        refresh,
        isSuperAdmin,
        hasRole,
        can,
        hasAnyAccess,
        hasAnyNavAccess,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  operations_manager: "Operations Manager",
  risk_officer: "Risk Officer",
  credit_analyst: "Credit Analyst",
  compliance_officer: "Compliance Officer",
};

export const ROLE_BADGES: Record<AdminRole, string> = {
  super_admin: "badge-success",
  operations_manager: "badge-info",
  risk_officer: "badge-danger",
  credit_analyst: "badge-purple",
  compliance_officer: "badge-warning",
};

export type { AdminRole, AdminUser };