/**
 * One-off script to create an admin user for the dashboard.
 *
 *   node scripts/createAdmin.js admin@kudinode.ng "StrongPass123" "Ada Admin"
 *   node scripts/createAdmin.js admin@kudinode.ng "StrongPass123" "Ada Admin" super_admin
 *
 * Requires the SUPABASE_SERVICE_ROLE_KEY in .env.
 */
import { supabaseAdmin } from "../src/config/supabase.js";

const [, , email, password, fullName = "KudiNode Admin", role = "operations_manager"] =
  process.argv;

const VALID_ROLES = [
  "super_admin",
  "operations_manager",
  "risk_officer",
  "credit_analyst",
  "compliance_officer",
];

if (!email || !password) {
  console.error(
    'Usage: node scripts/createAdmin.js <email> <password> "[full name]" [role]',
  );
  process.exit(1);
}

if (!VALID_ROLES.includes(role)) {
  console.error(`Invalid role: ${role}. Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin", is_admin_staff: true },
  });

  if (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }

  // The trigger creates the profile; ensure the role is admin + approved.
  const { error: upErr } = await supabaseAdmin
    .from("profiles")
    .update({ role: "admin", approval_status: "approved" })
    .eq("id", data.user.id);

  if (upErr) {
    console.error(
      "Created auth user but failed to set profile role:",
      upErr.message,
    );
    process.exit(1);
  }

  // RBAC source of truth lives in admin_users.
  const { error: adminErr } = await supabaseAdmin.from("admin_users").upsert(
    { id: data.user.id, role, full_name: fullName, email },
    { onConflict: "id" },
  );
  if (adminErr) {
    console.error("Created auth user but failed to register admin role:", adminErr.message);
    process.exit(1);
  }

  console.log(`✅ Admin created: ${email} (${data.user.id}) role=${role}`);
  process.exit(0);
}

main();
