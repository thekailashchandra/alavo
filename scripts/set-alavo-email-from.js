const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", "app", ".env");
let lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

const drop = new Set([
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASSWORD",
]);

lines = lines.filter((line) => {
  const key = line.split("=")[0];
  return !drop.has(key);
});

let t = lines.join("\n");
function setEnv(key, value) {
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=`, "m").test(t)) {
    t = t.replace(new RegExp(`^${key}=.*$`, "m"), line);
  } else {
    t = t.trimEnd() + "\n" + line + "\n";
  }
}

setEnv("EMAIL_FROM", "Alavo <hi@alavo.cc>");
setEnv("EMAIL_REPLY_TO", "hi@alavo.cc");

fs.writeFileSync(envPath, t.endsWith("\n") ? t : t + "\n");
console.log("Removed SMTP_* ; kept Gmail + EMAIL_FROM hi@alavo.cc");
