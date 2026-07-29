import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function allowedOrigins(): Set<string> {
  const origins = new Set<string>();
  const primary = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (primary) origins.add(primary.replace(/\/$/, ""));

  const extra = process.env.ALLOWED_ORIGINS?.split(",") ?? [];
  for (const raw of extra) {
    const o = raw.trim().replace(/\/$/, "");
    if (o) origins.add(o);
  }

  // Common Alavo production hosts
  origins.add("https://app.alavo.cc");
  origins.add("https://alavo-app.vercel.app");
  origins.add("http://localhost:3000");

  return origins;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins();
  const requestOrigin = origin?.replace(/\/$/, "") ?? "";
  const isAllowed =
    !origin ||
    allowed.has(requestOrigin) ||
    /^https:\/\/alavo(-app)?-[a-z0-9-]+\.vercel\.app$/i.test(requestOrigin);

  if (request.nextUrl.pathname.startsWith("/api")) {
    if (origin && !isAllowed && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "CORS forbidden" }, { status: 403 });
    }

    const allowOrigin =
      (origin && isAllowed ? requestOrigin : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    response.headers.set("Access-Control-Allow-Origin", allowOrigin.replace(/\/$/, ""));
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PATCH,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
