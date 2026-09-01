/**
 * Seeds demo admin accounts — one per role — for development/testing.
 *
 *   node scripts/seedDemoAdmins.js
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in server/.env.
 * Safe to run multiple times — existing accounts are updated, not duplicated.
 */
import { supabaseAdmin } from "../src/config/supabase.js";

const DEMOS = [
  {
    email: "demo.superadmin@kudinode.ng",
    password: "KudiNode@2026!",
    full_name: "Super Admin",
    role: "super_admin",
  },
  {
    email: "demo.ops@kudinode.ng",
    password: "KudiNode@2026!",
    full_name: "Peace Okon",
    role: "operations_manager",
  },
  {
    email: "demo.risk@kudinode.ng",
    password: "KudiNode@2026!",
    full_name: "Ahmad Lawal",
    role: "risk_officer",
  },
  {
    email: "demo.credit@kudinode.ng",
    password: "KudiNode@2026!",
    full_name: "Funke Abikin",
    role: "credit_analyst",
  },
  {
    email: "demo.compliance@kudinode.ng",
    password: "KudiNode@2026!",
    full_name: "Taiwo Balogun",
    role: "compliance_officer",
  },
];

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function upsertDemo({ email, password, full_name, role }) {
  let user = await findUserByEmail(email);

  if (user) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "admin", is_admin_staff: true },
    });
    if (error) throw error;
    console.log(`↻ Updated existing: ${email}`);
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "admin", is_admin_staff: true },
    });
    if (error) throw error;
    user = data.user;
    console.log(`✅ Created: ${email}`);
  }

  // Ensure the profile row exists (trigger may have already created it).
  const { error: upsErr } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      role: "admin",
      approval_status: "approved",
      full_name,
      email,
    },
    { onConflict: "id" },
  );
  if (upsErr) throw upsErr;

  // RBAC — write to admin_users (source of truth).
  const { error: adminErr } = await supabaseAdmin
    .from("admin_users")
    .upsert({ id: user.id, role, full_name, email }, { onConflict: "id" });
  if (adminErr) throw adminErr;

  console.log(`   Role: ${role}`);
}

async function main() {
  console.log("Seeding demo admin accounts…\n");
  for (const demo of DEMOS) {
    try {
      await upsertDemo(demo);
    } catch (e) {
      console.error(`✖ Failed for ${demo.email}:`, e.message);
      process.exitCode = 1;
    }
  }

  console.log("\n── Demo Login Credentials ──");
  console.log("──────────────────────────────");
  for (const r of DEMOS) {
    const label = r.role
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    console.log(`  ${label.padEnd(22)} ${r.email}  /  ${r.password}`);
  }
  console.log("──────────────────────────────");
  console.log(
    process.exitCode
      ? "Done with errors."
      : "All demo accounts ready. Access the admin dashboard at https://kudinode-admin.vercel.app or http://localhost:5173",
  );
  process.exit(process.exitCode || 0);
}

main();
