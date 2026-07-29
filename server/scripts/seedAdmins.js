/**
 * Seeds the two fixed KudiNode admin accounts into Supabase Auth and marks their
 * profiles as role=admin, approval_status=approved.
 *
 * Usage:
 *   node scripts/seedAdmins.js
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in server/.env.
 * Safe to run multiple times — existing accounts are updated, not duplicated.
 */
import { supabaseAdmin } from "../src/config/supabase.js";

const ADMINS = [
  {
    email: "fahdbadamasi320@gmail.com",
    password: "*FahdBad2026#",
    full_name: "Fahd Badamasi",
  },
  {
    email: "yahabubakar2504@gmail.com",
    password: "*AbuYah2026#",
    full_name: "Yahaya Abubakar",
  },
];

async function findUserByEmail(email) {
  // Paginate through users to find an existing match (admin API has no direct
  // get-by-email, so we scan the first pages — fine for small user bases).
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

async function upsertAdmin({ email, password, full_name }) {
  let user = await findUserByEmail(email);

  if (user) {
    // Reset password + metadata so the known credentials always work.
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "admin" },
    });
    if (error) throw error;
    console.log(`↻ Updated existing admin: ${email}`);
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "admin" },
    });
    if (error) throw error;
    user = data.user;
    console.log(`✅ Created admin: ${email}`);
  }

  // Ensure the linked profile is an approved admin.
  const { error: upErr } = await supabaseAdmin
    .from("profiles")
    .update({
      role: "admin",
      approval_status: "approved",
      full_name,
      email,
    })
    .eq("id", user.id);
  if (upErr) throw upErr;
}

async function main() {
  for (const admin of ADMINS) {
    try {
      await upsertAdmin(admin);
    } catch (e) {
      console.error(`✖ Failed for ${admin.email}:`, e.message);
      process.exitCode = 1;
    }
  }
  console.log("Done seeding admins.");
  process.exit(process.exitCode || 0);
}

main();
