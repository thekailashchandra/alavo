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

const deploymentIds = process.argv.slice(2);
if (deploymentIds.length === 0) {
  console.error("Usage: node scripts/wait-vercel-deploys.js <id> <id>");
  process.exit(1);
}

async function getDeployment(id) {
  const url = new URL(`https://api.vercel.com/v13/deployments/${id}`);
  url.searchParams.set("teamId", ids.teamId);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function main() {
  const pending = new Set(deploymentIds);
  while (pending.size) {
    for (const id of [...pending]) {
      const d = await getDeployment(id);
      const state = d.readyState || d.status;
      console.log(id, state, d.url || "", d.errorMessage || "");
      if (["READY", "ERROR", "CANCELED"].includes(state)) {
        pending.delete(id);
        if (state === "READY") {
          console.log("  READY https://" + d.url);
          console.log("  inspector", d.inspectorUrl);
        } else {
          console.log("  FAILED", JSON.stringify(d.errorCode || d.errorMessage || d));
        }
      }
    }
    if (pending.size) await new Promise((r) => setTimeout(r, 8000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
