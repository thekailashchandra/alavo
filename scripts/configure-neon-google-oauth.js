/**
 * Attach YOUR Google OAuth client to Neon Auth (removes neon.tech shared branding).
 *
 * 1. Create OAuth Web client in Google Cloud Console
 * 2. Authorized redirect URI (exact):
 *    {NEON_AUTH_BASE_URL}/callback/google
 * 3. OAuth consent screen → App name: Alavo
 * 4. Add to app/.env:
 *      NEON_API_KEY=...
 *      NEON_PROJECT_ID=...
 *      GOOGLE_CLIENT_ID=...
 *      GOOGLE_CLIENT_SECRET=...
 * 5. Run: node scripts/configure-neon-google-oauth.js
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
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authBase = (process.env.NEON_AUTH_BASE_URL || "").replace(/\/$/, "");
let branchId = process.env.NEON_BRANCH_ID;

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
  if (!clientId || !clientSecret) {
    throw new Error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in app/.env");
  }

  console.log("Required Google redirect URI:");
  console.log(`  ${authBase}/callback/google\n`);

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

  try {
    await neon(`/projects/${projectId}/branches/${branchId}/auth/config`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Alavo" }),
    });
    console.log('Auth app name set to "Alavo"');
  } catch (e) {
    console.warn("Could not set auth name:", e.message);
  }

  const body = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    enabled: true,
  });

  try {
    await neon(
      `/projects/${projectId}/branches/${branchId}/auth/oauth_providers/google`,
      { method: "PATCH", body }
    );
    console.log("Updated Google OAuth provider with your client credentials");
  } catch (e) {
    if (e.status === 404) {
      await neon(
        `/projects/${projectId}/branches/${branchId}/auth/oauth_providers`,
        {
          method: "POST",
          body: JSON.stringify({
            id: "google",
            client_id: clientId,
            client_secret: clientSecret,
            enabled: true,
          }),
        }
      );
      console.log("Added Google OAuth provider with your client credentials");
    } else {
      throw e;
    }
  }

  console.log("\nDone. Retry Continue with Google — it should no longer say neon.tech.");
  console.log(
    "Consent screen app name comes from Google Cloud → OAuth branding (set to Alavo)."
  );
}

main().catch((e) => {
  console.error(e.message);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});
