/**
 * One-off script to create an admin user for the dashboard.
 *
 *   node scripts/createAdmin.js admin@kudinode.ng "StrongPass123" "Ada Admin"
 *
 * Requires the SUPABASE_SERVICE_ROLE_KEY in .env.
 */
import { supabaseAdmin } from "../src/config/supabase.js";

const [, , email, password, fullName = "KudiNode Admin"] = process.argv;

if (!email || !password) {
  console.error(
    'Usage: node scripts/createAdmin.js <email> <password> "[full name]"',
  );
  process.exit(1);
}

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin" },
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
      "Created auth user but failed to set admin role:",
      upErr.message,
    );
    process.exit(1);
  }

  console.log(`✅ Admin created: ${email} (${data.user.id})`);
  process.exit(0);
}

main();
