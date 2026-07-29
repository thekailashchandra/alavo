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
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function upsertEnv(project, key, value) {
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
  console.log("set", project, key, "=", value);
}

async function main() {
  await upsertEnv("alavo", "NEXT_PUBLIC_PRODUCT_URL", "https://app.alavo.cc");
  await upsertEnv("alavo-app", "NEXT_PUBLIC_APP_URL", "https://app.alavo.cc");

  const html = await (await fetch("https://alavo.cc")).text();
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  console.log(
    "current alavo.cc auth links:",
    hrefs.filter((h) => /login|signup|localhost|app\.alavo/i.test(h))
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
