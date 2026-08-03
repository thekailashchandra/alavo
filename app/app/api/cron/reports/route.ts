import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runScheduledReports, sendReportToUser } from "@/lib/reports/send";
import { requireAuth } from "@/lib/auth";

const bodySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).optional(),
  userId: z.string().optional(),
  /** Force send ignoring schedule window (cron secret or authed user) */
  force: z.boolean().optional(),
});

function authorizeCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  if (req.headers.get("x-cron-secret") === secret) return true;
  // Vercel Cron sends this automatically when CRON_SECRET is set
  const vercelAuth = req.headers.get("authorization");
  return vercelAuth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runScheduledReports();
  return NextResponse.json({ ok: true, ...summary });
}

export async function POST(req: NextRequest) {
  const body = bodySchema.parse(await req.json().catch(() => ({})));
  const isCron = authorizeCron(req);

  if (isCron && !body.force && !body.userId && !body.period) {
    const summary = await runScheduledReports();
    return NextResponse.json({ ok: true, ...summary });
  }

  // Authenticated user sending themselves a test / forced report
  if (!isCron) {
    const { user, error } = await requireAuth(req);
    if (error || !user) return error!;
    const period = body.period || "weekly";
    const result = await sendReportToUser(user.id, period);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason || "Could not send report" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, period, email: result.email });
  }

  // Cron + force specific user/period
  if (body.userId && body.period) {
    const result = await sendReportToUser(body.userId, body.period);
    return NextResponse.json(result);
  }

  const summary = await runScheduledReports();
  return NextResponse.json({ ok: true, ...summary });
}
