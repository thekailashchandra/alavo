const fs = require("fs");
const path = require("path");

const auth = JSON.parse(
  fs.readFileSync(
    path.join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    "utf8"
  )
);
const token = auth.token || auth.accessToken;
const teamId = "skailash12321-9840s-projects"; // slug; API may need team id

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
  // resolve team
  if (!api.teamId) {
    const u = await fetch("https://api.vercel.com/v2/teams", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const teams = await u.json();
    const team =
      (teams.teams || []).find((t) => t.slug === "skailash12321-9840s-projects") ||
      (teams.teams || [])[0];
    api.teamId = team?.id;
    console.log("Team:", team?.slug, api.teamId);
  }
  if (api.teamId) url.searchParams.set("teamId", api.teamId);

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
    const err = new Error(json?.error?.message || json?.message || text || res.statusText);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function upsertEnv(projectId, key, value) {
  // Team policy: sensitive vars cannot include "development"
  const targets = ["production", "preview"];
  const existing = await api(`/v9/projects/${projectId}/env`);
  const envs = existing.envs || existing || [];
  for (const e of envs) {
    if (e.key === key) {
      await api(`/v9/projects/${projectId}/env/${e.id}`, { method: "DELETE" });
    }
  }
  await api(`/v10/projects/${projectId}/env`, {
    method: "POST",
    body: JSON.stringify({
      key,
      value,
      type: "plain",
      target: targets,
    }),
  });
  console.log("  env set:", key);
}

async function ensureProject(name, rootDirectory, framework) {
  let project;
  try {
    project = await api(`/v9/projects/${name}`);
    console.log("Updating project", name);
    project = await api(`/v9/projects/${name}`, {
      method: "PATCH",
      body: JSON.stringify({
        rootDirectory,
        framework,
        installCommand: "npm install --legacy-peer-deps --prefix=..",
        buildCommand: "npm run build",
        outputDirectory: null,
        nodeVersion: "22.x",
      }),
    });
  } catch (e) {
    if (e.status !== 404) throw e;
    console.log("Creating project", name);
    project = await api(`/v10/projects`, {
      method: "POST",
      body: JSON.stringify({
        name,
        framework,
        rootDirectory,
        installCommand: "npm install --legacy-peer-deps --prefix=..",
        buildCommand: "npm run build",
        gitRepository: {
          type: "github",
          repo: "thekailashchandra/alavo",
        },
      }),
    });
  }
  console.log("Project ready:", project.id, project.name, "root=", project.rootDirectory);
  return project;
}

async function linkGitIfNeeded(projectId) {
  try {
    await api(`/v9/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    // Try linking via create if missing
    const p = await api(`/v9/projects/${projectId}`);
    if (!p.link) {
      console.log("No git link on project — will deploy via CLI from local");
    } else {
      console.log("Git linked:", p.link?.type, p.link?.repo);
    }
    return p;
  } catch (e) {
    console.warn("link check:", e.message);
  }
}

async function main() {
  const local = loadEnv(path.join("app", ".env"));

  // Website project (reuse alavo)
  const website = await ensureProject("alavo", "website", "nextjs");
  await linkGitIfNeeded(website.id);
  await upsertEnv(website.id, "NEXT_PUBLIC_PRODUCT_URL", "https://app.alavo.cc");

  // App project
  let appProject;
  try {
    appProject = await ensureProject("alavo-app", "app", "nextjs");
  } catch (e) {
    console.error("alavo-app ensure failed:", e.message, e.body);
    throw e;
  }
  await linkGitIfNeeded(appProject.id);

  const appEnv = {
    DATABASE_URL: local.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: local.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: local.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: local.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: "https://app.alavo.cc",
    CRON_SECRET: local.CRON_SECRET,
    GMAIL_USER: local.GMAIL_USER,
    GMAIL_APP_PASSWORD: local.GMAIL_APP_PASSWORD,
    EMAIL_FROM: local.EMAIL_FROM,
    EMAIL_REPLY_TO: local.EMAIL_REPLY_TO,
    VAPID_PUBLIC_KEY: local.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: local.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT_EMAIL: local.VAPID_SUBJECT_EMAIL || "mailto:hi@alavo.cc",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: local.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  };

  for (const [k, v] of Object.entries(appEnv)) {
    if (!v) {
      console.warn("  skip empty", k);
      continue;
    }
    await upsertEnv(appProject.id, k, v);
  }

  fs.writeFileSync(
    ".vercel-deploy-ids.json",
    JSON.stringify(
      {
        website: { id: website.id, name: website.name },
        app: { id: appProject.id, name: appProject.name },
        teamId: api.teamId,
      },
      null,
      2
    )
  );
  console.log("Wrote .vercel-deploy-ids.json");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});
