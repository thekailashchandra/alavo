import { NextRequest, NextResponse } from "next/server";
import { runScheduledReminders } from "@/lib/reminders/send";

function authorizeCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  if (req.headers.get("x-cron-secret") === secret) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runScheduledReminders();
  return NextResponse.json({ ok: true, ...summary });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
