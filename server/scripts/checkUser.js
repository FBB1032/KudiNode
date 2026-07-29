/**
 * Quick diagnostic script to check user data in Supabase
 * Usage: node scripts/checkUser.js 08012345678
 */
import { supabaseAdmin } from "../src/config/supabase.js";
import { normalizePhone } from "../src/utils/credentials.js";

const phoneArg = process.argv[2];

if (!phoneArg) {
  console.log("Usage: node scripts/checkUser.js <phone_number>");
  console.log("Example: node scripts/checkUser.js 08012345678");
  process.exit(1);
}

const normalizedPhone = normalizePhone(phoneArg);

console.log("🔍 Checking user with phone:", phoneArg);
console.log("📱 Normalized format:", normalizedPhone);
console.log("---");

async function checkUser() {
  try {
    // Check profiles table
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (error) {
      console.error("❌ Error querying profiles:", error.message);
      return;
    }

    if (!profile) {
      console.log("❌ No profile found with phone:", normalizedPhone);
      console.log("\n🔎 Searching all profiles to see what's stored...\n");
      
      // Show all profiles with their phone numbers
      const { data: allProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, phone, full_name, approval_status")
        .limit(10);

      if (allProfiles && allProfiles.length > 0) {
        console.log("📋 Recent profiles in database:");
        allProfiles.forEach(p => {
          console.log(`  - Phone: ${p.phone} | Email: ${p.email} | Name: ${p.full_name} | Status: ${p.approval_status}`);
        });
      } else {
        console.log("⚠️  No profiles found in database at all!");
      }
      return;
    }

    // Profile found!
    console.log("✅ Profile found!");
    console.log("---");
    console.log("ID:", profile.id);
    console.log("Email:", profile.email);
    console.log("Phone:", profile.phone);
    console.log("Full Name:", profile.full_name);
    console.log("Role:", profile.role);
    console.log("Approval Status:", profile.approval_status);
    console.log("KYC Tier:", profile.kyc_tier);
    console.log("---");

    // Check if user exists in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (authError) {
      console.log("⚠️  Could not fetch auth user:", authError.message);
    } else if (authUser) {
      console.log("✅ User exists in Supabase Auth");
      console.log("Auth Email:", authUser.user.email);
      console.log("Email Confirmed:", authUser.user.email_confirmed_at ? "Yes" : "No");
    }

    // Check approval status
    if (profile.approval_status !== "approved") {
      console.log("\n⚠️  User is NOT approved!");
      console.log("Current status:", profile.approval_status);
      console.log("\nTo approve this user:");
      console.log("1. Go to Supabase Dashboard → Table Editor → profiles");
      console.log(`2. Find user with email: ${profile.email}`);
      console.log("3. Change approval_status to 'approved'");
    } else {
      console.log("\n✅ User is approved and can login!");
    }

  } catch (err) {
    console.error("❌ Unexpected error:", err);
  } finally {
    process.exit(0);
  }
}

checkUser();
