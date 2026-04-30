/**
 * Do not run with plain `node scripts/create-admin.ts` — Node will not resolve TS/modules.
 * Use: npm run create-admin
 * Or:  node --import tsx scripts/create-admin.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";
import { hashPassword } from "../lib/auth";
import { User } from "../models/User";

function loadEnvFile(filename: string, overrideExisting: boolean) {
  const p = resolve(process.cwd(), filename);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (overrideExisting || process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

/** Same order as Next: `.env` then `.env.local` (local wins). */
function loadProjectEnv() {
  loadEnvFile(".env", false);
  loadEnvFile(".env.local", true);
}

async function main() {
  loadProjectEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env or .env.local.");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env or .env.local, or pass them for this run:\n" +
        "  ADMIN_EMAIL=admin@company.com ADMIN_PASSWORD='your-password' npm run create-admin"
    );
    process.exit(1);
  }

  await mongoose.connect(uri);

  const existing = await User.findOne({ email });
  if (existing && existing.role !== "admin") {
    console.error(
      `A user with email ${email} already exists with role "${existing.role}". Use a different email or update the user in MongoDB.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashed = await hashPassword(password);
  if (existing) {
    existing.password = hashed;
    existing.approvalStatus = "approved";
    await existing.save();
    console.log(`Updated admin password for ${email}`);
  } else {
    await User.create({
      email,
      password: hashed,
      name: "Admin",
      role: "admin",
      approvalStatus: "approved",
      canManageContent: true,
      authProvider: "email",
    });
    console.log(`Created admin: ${email}`);
  }

  console.log("Sign in at /admin/login (email + password; the form sends role admin).");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
