const fs = require("fs");
const line = fs
  .readFileSync(".env", "utf8")
  .split(/\n/)
  .find((l) => l.startsWith("NEON_AUTH_BASE_URL="));
if (!line) {
  console.log("MISSING");
  process.exit(1);
}
let v = line.slice("NEON_AUTH_BASE_URL=".length).trim();
if (
  (v.startsWith('"') && v.endsWith('"')) ||
  (v.startsWith("'") && v.endsWith("'"))
) {
  v = v.slice(1, -1);
}
console.log("len=" + v.length);
console.log("url=" + v);
console.log("host=" + new URL(v).host);
