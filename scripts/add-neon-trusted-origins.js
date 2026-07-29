/**
 * Add Neon Auth trusted origins so production signup/sign-in works.
 *
 * 1. Create API key: https://console.neon.tech/app/settings/api-keys
 * 2. Add to app/.env:
 *      NEON_API_KEY=...
 *      NEON_PROJECT_ID=...   (Project Settings → ID)
 * 3. Run: node scripts/add-neon-trusted-origins.js
 *
 * Or do it manually:
 *   Neon Console → Project → Auth → Configuration → Domains
 *   Add:
 *     https://app.alavo.cc
 *     https://alavo-app.vercel.app
 *     https://*.vercel.app   (optional, for previews)
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", "app", ".env");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  let k = t.slice(0, i).trim();
  let v = t.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env[k] = v;
}

const apiKey = process.env.NEON_API_KEY;
const projectId = process.env.NEON_PROJECT_ID;
let branchId = process.env.NEON_BRANCH_ID;

const origins = [
  "https://app.alavo.cc",
  "https://alavo-app.vercel.app",
  "https://alavo.cc",
  "https://www.alavo.cc",
  "https://*.vercel.app",
];

async function neon(pathname, options = {}) {
  const res = await fetch(`https://console.neon.tech/api/v2${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(json?.message || json?.error || text || res.statusText);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function main() {
  if (!apiKey) throw new Error("Set NEON_API_KEY in app/.env");
  if (!projectId) throw new Error("Set NEON_PROJECT_ID in app/.env");

  if (!branchId) {
    const branches = await neon(`/projects/${projectId}/branches`);
    const list = branches.branches || [];
    const primary =
      list.find((b) => b.default || b.name === "main" || b.name === "production") ||
      list[0];
    if (!primary?.id) throw new Error("Could not resolve branch id");
    branchId = primary.id;
    console.log("Using branch", primary.name, branchId);
  }

  // Rename app in emails while we're here
  try {
    await neon(`/projects/${projectId}/branches/${branchId}/auth/config`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Alavo" }),
    });
    console.log('Application name set to "Alavo"');
  } catch (e) {
    console.warn("Could not set application name:", e.message);
  }

  for (const domain of origins) {
    try {
      await neon(`/projects/${projectId}/branches/${branchId}/auth/domains`, {
        method: "POST",
        body: JSON.stringify({
          domain,
          auth_provider: "better_auth",
        }),
      });
      console.log("Added trusted origin:", domain);
    } catch (e) {
      if (/already|exist|duplicate/i.test(e.message)) {
        console.log("Already present:", domain);
      } else {
        console.warn("Failed", domain, e.message);
      }
    }
  }

  console.log("\nDone. Try signup again on https://app.alavo.cc");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});
