const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "..", "app", ".env");
let t = fs.readFileSync(envPath, "utf8");

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

// Don't overwrite SMTP password if already configured — only set defaults when missing
if (!/^SMTP_HOST=/m.test(t)) setEnv("SMTP_HOST", "smtp.hostinger.com");
if (!/^SMTP_PORT=/m.test(t)) setEnv("SMTP_PORT", "465");
if (!/^SMTP_SECURE=/m.test(t)) setEnv("SMTP_SECURE", "true");
if (!/^SMTP_USER=/m.test(t)) setEnv("SMTP_USER", "hi@alavo.cc");

fs.writeFileSync(envPath, t.endsWith("\n") ? t : t + "\n");
console.log("Updated EMAIL_FROM / EMAIL_REPLY_TO to hi@alavo.cc");
console.log(
  /^SMTP_PASSWORD=/m.test(t)
    ? "SMTP_PASSWORD already set"
    : "Add SMTP_PASSWORD=your_hi@alavo.cc_mailbox_password to app/.env"
);
