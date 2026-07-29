/**
 * Configure Neon Auth: application name + Gmail SMTP.
 *
 * Required in app/.env:
 *   NEON_API_KEY=...
 *   NEON_PROJECT_ID=...
 *   NEON_BRANCH_ID=...   (optional — defaults to main branch)
 *   GMAIL_USER=...
 *   GMAIL_APP_PASSWORD=...
 *   EMAIL_FROM=Alavo <you@gmail.com>
 *
 * Manual alternative (no API key):
 *   Neon Console → Project → Auth → Configuration → Application name: Alavo
 *
 * Create API key: https://console.neon.tech/app/settings/api-keys
 */
const fs = require("fs");

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
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
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const from = process.env.EMAIL_FROM || `Alavo <${gmailUser}>`;

function parseFrom(value) {
  const m = String(value).match(/^(.*?)\s*<([^>]+)>$/);
  if (m) return { name: m[1].trim().replace(/^"|"$/g, ""), email: m[2].trim() };
  return { name: "Alavo", email: value };
}

async function neon(path, options = {}) {
  const res = await fetch(`https://console.neon.tech/api/v2${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
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
  if (!apiKey) throw new Error("Set NEON_API_KEY in .env");
  if (!projectId) throw new Error("Set NEON_PROJECT_ID in .env");
  if (!gmailUser || !gmailPass) {
    throw new Error("Set GMAIL_USER and GMAIL_APP_PASSWORD in .env");
  }

  if (!branchId) {
    const branches = await neon(`/projects/${projectId}/branches`);
    const list = branches.branches || branches || [];
    const primary =
      list.find((b) => b.default || b.name === "main" || b.name === "production") ||
      list[0];
    if (!primary?.id) throw new Error("Could not resolve NEON_BRANCH_ID");
    branchId = primary.id;
    console.log("Using branch", primary.name, branchId);
  }

  const { name: senderName, email: senderEmail } = parseFrom(from);

  console.log('Updating Neon Auth application name → "Alavo"…');
  const config = await neon(
    `/projects/${projectId}/branches/${branchId}/auth/config`,
    { method: "PATCH", body: JSON.stringify({ name: "Alavo" }) }
  );
  console.log("Auth config:", JSON.stringify(config, null, 2));

  const payload = {
    type: "standard",
    host: "smtp.gmail.com",
    port: 465,
    username: gmailUser,
    password: gmailPass,
    sender_email: senderEmail,
    sender_name: senderName || "Alavo",
  };

  console.log("Updating Neon Auth email provider → Gmail SMTP…");
  const updated = await neon(
    `/projects/${projectId}/branches/${branchId}/auth/email_provider`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  console.log("Updated:", JSON.stringify(updated, null, 2));

  console.log("Sending Neon test email to", gmailUser, "…");
  try {
    const test = await neon(
      `/projects/${projectId}/branches/${branchId}/auth/send_test_email`,
      {
        method: "POST",
        body: JSON.stringify({ email: gmailUser }),
      }
    );
    console.log("Test email result:", JSON.stringify(test, null, 2));
  } catch (e) {
    console.warn("Test email endpoint failed (provider may still be set):", e.message);
  }

  console.log("\nDone. Sign up again and check inbox/spam for the code.");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});
