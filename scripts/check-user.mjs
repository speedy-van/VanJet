// Update driver password
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const password = "Aa234311Aa@@@";
const email = "ahmadalwakai0@gmail.com";

console.log("Hashing password...");
const hash = await bcrypt.hash(password, 12);

console.log("Updating user password...");
await sql`UPDATE users SET password_hash = ${hash} WHERE email = ${email}`;

console.log("✅ Password updated for:", email);

// Verify
const result = await sql`
  SELECT id, email, role, password_hash IS NOT NULL as has_password, LENGTH(password_hash) as hash_len
  FROM users 
  WHERE email = ${email}
`;
console.log(JSON.stringify(result, null, 2));
