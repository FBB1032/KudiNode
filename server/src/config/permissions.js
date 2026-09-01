export const ADMIN_ROLES = {
  super_admin:          { level: 100, label: "Super Admin" },
  operations_manager:   { level: 70,  label: "Operations Manager" },
  risk_officer:         { level: 60,  label: "Risk Officer" },
  credit_analyst:       { level: 60,  label: "Credit Analyst" },
  compliance_officer:   { level: 60,  label: "Compliance Officer" },
};

// Super Admin has unrestricted access to every resource & action.
const FULL_ACCESS = {
  dashboard:     ["view"],
  merchants:     ["view", "create", "edit", "approve", "reject", "suspend", "export"],
  credit:        ["view", "create", "edit"],
  coop:          ["view", "create", "edit"],
  risk:          ["view", "create", "edit"],
  reports:       ["view", "export"],
  settings:      ["view", "edit"],
  admin_users:   ["view", "create", "edit", "delete"],
  audit_log:     ["view"],
};

export const PERMISSIONS = {
  super_admin: {
    level: 100,
    resources: "*",
    fullAccess: FULL_ACCESS,
  },
  operations_manager: {
    level: 70,
    resources: {
      dashboard:     ["view"],
      merchants:     ["view", "create", "edit", "approve", "reject", "suspend", "export"],
      credit:        ["view"],
      coop:          ["view", "create", "edit"],
      reports:       ["view", "export"],
      settings:      ["view"],
    },
  },
  risk_officer: {
    level: 60,
    resources: {
      dashboard:     ["view"],
      merchants:     ["view", "export"],
      risk:          ["view", "create", "edit"],
      reports:       ["view", "export"],
    },
  },
  credit_analyst: {
    level: 60,
    resources: {
      dashboard:     ["view"],
      merchants:     ["view", "export"],
      credit:        ["view", "create", "edit"],
      reports:       ["view", "export"],
    },
  },
  compliance_officer: {
    level: 60,
    resources: {
      dashboard:     ["view"],
      merchants:     ["view", "approve", "reject", "export"],
      audit_log:     ["view"],
      reports:       ["view", "export"],
    },
  },
};

export function hasPermission(role, resource, action) {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  if (perms.resources === "*") return true;
  const resourcePerms = perms.resources[resource];
  if (!resourcePerms) return false;
  return resourcePerms.includes(action);
}

export function getResourcesForRole(role) {
  const perms = PERMISSIONS[role];
  if (!perms) return [];
  if (perms.resources === "*") return Object.keys(FULL_ACCESS);
  return Object.keys(perms.resources);
}

export function getPermissionsForRole(role) {
  const perms = PERMISSIONS[role];
  if (!perms) return {};
  if (perms.resources === "*") return FULL_ACCESS;
  return perms.resources;
}