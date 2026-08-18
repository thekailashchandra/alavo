import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Liveness probe — process is up (no dependency checks). */
export async function GET(req: NextRequest) {
  const deep = req.nextUrl.searchParams.get("ready") === "1";

  if (!deep) {
    return Response.json(
      { status: "ok", service: "alavo-app", timestamp: new Date().toISOString() },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      {
        status: "ready",
        service: "alavo-app",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      {
        status: "degraded",
        service: "alavo-app",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
