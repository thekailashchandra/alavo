import { createNeonAuth } from "@neondatabase/auth/next/server";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is missing. Set it in .env and restart the dev server.`
    );
  }
  return value;
}

const baseUrl = requireEnv("NEON_AUTH_BASE_URL");
const cookieSecret = requireEnv("NEON_AUTH_COOKIE_SECRET");

try {
  // Fail fast with a clear message instead of "Invalid URL"
  // eslint-disable-next-line no-new
  new URL(baseUrl);
} catch {
  throw new Error(
    `NEON_AUTH_BASE_URL is not a valid URL: "${baseUrl}". Copy it from Neon Console → Auth → Configuration.`
  );
}

if (cookieSecret.length < 32) {
  throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters.");
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "error",
});
