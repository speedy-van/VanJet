// ─── VanJet · Add Driver Script ───────────────────────────────
// Usage: node scripts/add-driver.mjs

import { config } from "dotenv";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

// Load .env.local first, then .env
config({ path: ".env.local" });
config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set in environment");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const driver = {
  email: "ahmadalwakai0@gmail.com",
  name: "Ahmad Alwakai",
  phone: "+44 7000 000000",
  password: "Aa234311Aa@@@",
  vanSize: "LWB",
  coverageRadius: 100,
};

async function main() {
  console.log("🚐 Adding driver:", driver.email);

  // Check if user exists
  const existing = await sql`SELECT id FROM users WHERE email = ${driver.email.toLowerCase()}`;
  
  if (existing.length > 0) {
    console.log("⚠️  User already exists with ID:", existing[0].id);
    
    // Check if they have driver role
    const user = await sql`SELECT role FROM users WHERE email = ${driver.email.toLowerCase()}`;
    if (user[0]?.role !== "driver") {
      // Update to driver role
      await sql`UPDATE users SET role = 'driver' WHERE email = ${driver.email.toLowerCase()}`;
      console.log("✅ Updated user role to 'driver'");
    }
    
    // Check if driver profile exists
    const profile = await sql`SELECT id FROM driver_profiles WHERE user_id = ${existing[0].id}`;
    if (profile.length === 0) {
      // Create driver profile
      await sql`
        INSERT INTO driver_profiles (user_id, van_size, coverage_radius_km, verified)
        VALUES (${existing[0].id}, ${driver.vanSize}, ${driver.coverageRadius}, false)
      `;
      console.log("✅ Created driver profile");
    } else {
      console.log("✅ Driver profile already exists");
    }
    
    process.exit(0);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(driver.password, 12);

  // Create user
  const [newUser] = await sql`
    INSERT INTO users (email, name, phone, role, password_hash)
    VALUES (${driver.email.toLowerCase()}, ${driver.name}, ${driver.phone}, 'driver', ${passwordHash})
    RETURNING id
  `;

  console.log("✅ Created user with ID:", newUser.id);

  // Create driver profile
  await sql`
    INSERT INTO driver_profiles (user_id, van_size, coverage_radius_km, verified)
    VALUES (${newUser.id}, ${driver.vanSize}, ${driver.coverageRadius}, false)
  `;

  console.log("✅ Created driver profile");
  console.log("\n🎉 Driver added successfully!");
  console.log("   Email:", driver.email);
  console.log("   Password:", driver.password);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
