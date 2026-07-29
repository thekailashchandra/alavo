const fs = require("fs");
const path = require("path");

// Load .env manually (no dotenv dependency required)
const envPath = path.join(process.cwd(), ".env");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const webpush = require("web-push");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: String(detail ?? "") });
}

const required = [
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT_EMAIL",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
];

for (const k of required) {
  const v = process.env[k];
  const bad =
    !v ||
    v.includes("replace_with") ||
    v.includes("USER:PASSWORD");
  check(`${k} set`, !bad, bad ? "missing/placeholder" : "ok");
}

check(
  "JWT_ACCESS_SECRET length >= 32",
  (process.env.JWT_ACCESS_SECRET || "").length >= 32,
  `len=${(process.env.JWT_ACCESS_SECRET || "").length}`
);
check(
  "JWT_REFRESH_SECRET length >= 32",
  (process.env.JWT_REFRESH_SECRET || "").length >= 32,
  `len=${(process.env.JWT_REFRESH_SECRET || "").length}`
);
check(
  "JWT secrets are different",
  process.env.JWT_ACCESS_SECRET !== process.env.JWT_REFRESH_SECRET,
  "unique pair"
);

check(
  "NEXT_PUBLIC_APP_URL is http(s)",
  /^https?:\/\//.test(process.env.NEXT_PUBLIC_APP_URL || ""),
  process.env.NEXT_PUBLIC_APP_URL
);
check(
  "DATABASE_URL is postgres",
  /^postgresql:\/\//.test(process.env.DATABASE_URL || ""),
  "scheme ok"
);
check(
  "DATABASE_URL has sslmode=require",
  (process.env.DATABASE_URL || "").includes("sslmode=require"),
  "sslmode"
);
check(
  "VAPID public matches NEXT_PUBLIC",
  process.env.VAPID_PUBLIC_KEY === process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  "match"
);
check(
  "VAPID_SUBJECT_EMAIL is mailto",
  /^mailto:/.test(process.env.VAPID_SUBJECT_EMAIL || ""),
  process.env.VAPID_SUBJECT_EMAIL
);

try {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  const raw = process.env.VAPID_PUBLIC_KEY;
  const pad = "=".repeat((4 - (raw.length % 4)) % 4);
  const pub = Buffer.from(
    (raw + pad).replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  );
  check("VAPID public key bytes", pub.length === 65, `bytes=${pub.length}`);
  check("VAPID keys accepted by web-push", true, "ok");
} catch (e) {
  check("VAPID keys accepted by web-push", false, e.message);
}

check(
  "GMAIL_USER set",
  !process.env.GMAIL_USER || process.env.GMAIL_USER.includes("@"),
  process.env.GMAIL_USER || "empty (optional until sending mail)"
);
check(
  "GMAIL_APP_PASSWORD set",
  !process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD.replace(/\s/g, "").length >= 16,
  process.env.GMAIL_APP_PASSWORD ? "present" : "empty (optional until sending mail)"
);
check(
  "EMAIL_FROM set",
  true,
  process.env.EMAIL_FROM || "defaults to Alavo <GMAIL_USER>"
);

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRaw`SELECT 1::int AS ok`;
    check("Neon DB connection", Array.isArray(rows), "connected");
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    check(
      "DB tables present",
      tables.length > 0,
      tables.map((t) => t.table_name).join(", ") || "none yet"
    );
  } catch (e) {
    check("Neon DB connection", false, e.message);
  } finally {
    await prisma.$disconnect();
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      await transporter.verify();
      check("Gmail SMTP connection", true, "ok");
    } catch (e) {
      check("Gmail SMTP connection", false, e.message);
    }
  }

  const failed = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"} | ${r.name} | ${r.detail}`);
  }
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main();
