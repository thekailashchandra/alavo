const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", "app", ".env");
const t = fs.readFileSync(envPath, "utf8");
for (const k of [
  "DATABASE_URL",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
]) {
  const m = t.match(new RegExp("^" + k + "=(.*)$", "m"));
  if (!m) {
    console.log(k + ": MISSING");
    continue;
  }
  let v = m[1].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  if (k === "DATABASE_URL") {
    try {
      const u = new URL(v.replace(/^postgresql:/, "postgres:"));
      console.log(
        k +
          ": SET host=" +
          u.hostname +
          " port=" +
          (u.port || "5432") +
          " db=" +
          u.pathname
      );
    } catch {
      console.log(k + ": SET (unparsed)");
    }
  } else if (/PASS|SECRET|KEY/i.test(k)) {
    console.log(k + ": SET (" + v.length + " chars)");
  } else {
    console.log(k + ":", v || "(empty)");
  }
}
