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
  if (ids.teamId) url.searchParams.set("teamId", ids.teamId);
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
    const err = new Error(json?.error?.message || json?.message || text);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function deploy(projectName, projectId) {
  const p = await api(`/v9/projects/${projectId}`);
  const link = p.link;
  if (!link) throw new Error(`Project ${projectName} has no git link`);

  console.log(`Deploying ${projectName} from`, link.org, link.repo, link.productionBranch || "master");

  const body = {
    name: projectName,
    project: projectId,
    target: "production",
    gitSource: {
      type: "github",
      org: link.org,
      repo: link.repo,
      ref: link.productionBranch || "master",
    },
  };

  // Some accounts need repoId
  if (link.repoId) {
    body.gitSource = {
      type: "github",
      repoId: link.repoId,
      ref: link.productionBranch || "master",
    };
  }

  const d = await api(`/v13/deployments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  console.log("  deployment:", d.id, d.url, d.status || d.readyState);
  return d;
}

async function main() {
  const website = await deploy(ids.website.name, ids.website.id);
  const app = await deploy(ids.app.name, ids.app.id);
  fs.writeFileSync(
    ".vercel-deploy-ids.json",
    JSON.stringify({ ...ids, deployments: { website, app: { id: app.id, url: app.url } } }, null, 2)
  );
  console.log("\nWebsite:", `https://${website.url}`);
  console.log("App:", `https://${app.url}`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  if (e.body) console.error(JSON.stringify(e.body, null, 2));
  process.exit(1);
});
