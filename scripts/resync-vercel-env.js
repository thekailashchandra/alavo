const fs = require("fs");
const path = require("path");

const auth = JSON.parse(
  fs.readFileSync(
    path.join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    "utf8"
  )
);
const token = auth.token || auth.accessToken;
const ids = JSON.parse(fs.readFileSync(".vercel-deploy-ids.json", "utf8"));

function loadEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
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
    env[k] = v;
  }
  return env;
}

async function api(pathname, options = {}) {
  const url = new URL(`https://api.vercel.com${pathname}`);
  url.searchParams.set("teamId", ids.teamId);
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
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
    throw new Error(`${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function upsert(project, key, value) {
  if (!value) {
    console.log("SKIP empty", key);
    return;
  }
  const existing = await api(`/v9/projects/${project}/env`);
  for (const e of existing.envs || []) {
    if (e.key === key) {
      await api(`/v9/projects/${project}/env/${e.id}`, { method: "DELETE" });
    }
  }
  await api(`/v10/projects/${project}/env`, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: "plain",
      target: ["production", "preview"],
    }),
  });
  console.log("SET", key, `(${value.length} chars)`);
}

async function main() {
  const env = loadEnv(path.join("app", ".env"));
  const map = {
    DATABASE_URL: env.DATABASE_URL,
    NEON_AUTH_BASE_URL: env.NEON_AUTH_BASE_URL,
    NEON_AUTH_COOKIE_SECRET: env.NEON_AUTH_COOKIE_SECRET,
    NEXT_PUBLIC_APP_URL: "https://app.alavo.cc",
    ALLOWED_ORIGINS:
      "https://app.alavo.cc,https://alavo-app.vercel.app,https://alavo.cc,https://www.alavo.cc",
    GMAIL_USER: env.GMAIL_USER,
    GMAIL_APP_PASSWORD: env.GMAIL_APP_PASSWORD,
    EMAIL_FROM: env.EMAIL_FROM,
    VAPID_PUBLIC_KEY: env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: env.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT_EMAIL: env.VAPID_SUBJECT_EMAIL || "mailto:dev@alavo.local",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  };

  for (const [k, v] of Object.entries(map)) {
    await upsert("alavo-app", k, v);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
