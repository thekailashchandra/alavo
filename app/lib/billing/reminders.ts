import { differenceInCalendarDays, format } from "date-fns";
import { sendMail } from "@/lib/email";
import { adminEmails } from "@/lib/admin-emails";
import { prisma } from "@/lib/prisma";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://app.alavo.cc").replace(
    /\/$/,
    ""
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPlanValidityReminders(now = new Date()) {
  const users = await prisma.user.findMany({
    where: {
      lifetime: false,
      plan: { in: ["PRO", "TEAM"] },
      planExpiresAt: {
        gte: now,
        lte: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      email: true,
      plan: true,
      planExpiresAt: true,
    },
  });

  let sent = 0;
  const notified: { email: string; plan: string; until: string; daysLeft: number }[] =
    [];
  for (const user of users) {
    if (!user.planExpiresAt) continue;
    const daysLeft = differenceInCalendarDays(user.planExpiresAt, now);
    if (daysLeft !== 3 && daysLeft !== 1 && daysLeft !== 0) continue;

    const planName = user.plan === "TEAM" ? "Team" : "Pro";
    const until = format(user.planExpiresAt, "d MMMM yyyy");
    const heading =
      daysLeft === 0
        ? `${planName} access ends today`
        : `${planName} access ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

    const result = await sendMail({
      to: user.email,
      subject: `${heading} · Alavo`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
          <p style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7B08E0;">Alavo</p>
          <h1 style="font-size:22px;">${heading}</h1>
          <p style="color:#6B7280;line-height:1.5;">
            Your ${planName} plan stays active until <strong>${escapeHtml(until)}</strong>.
            Renew from Plans &amp; billing to keep unlimited habits and full history.
          </p>
          <p style="margin:24px 0;">
            <a href="${appUrl()}/settings/subscription" style="background:#7B08E0;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:600;">
              Renew plan
            </a>
          </p>
          <p style="color:#9CA3AF;font-size:12px;">
            After that date Alavo stays free, with the Free limits.
          </p>
        </div>
      `,
    });
    if (result.ok) {
      sent += 1;
      notified.push({
        email: user.email,
        plan: planName,
        until,
        daysLeft,
      });
    }
  }

  if (notified.length > 0) {
    const admins = [...adminEmails()];
    if (admins.length > 0) {
      const rows = notified
        .map(
          (item) =>
            `<li><strong>${escapeHtml(item.email)}</strong> — ${escapeHtml(item.plan)} until ${escapeHtml(item.until)} (${item.daysLeft === 0 ? "ends today" : `${item.daysLeft} day${item.daysLeft === 1 ? "" : "s"} left`})</li>`
        )
        .join("");
      await sendMail({
        to: admins.join(", "),
        subject: `Plan validity: ${notified.length} reminder${notified.length === 1 ? "" : "s"} sent`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
            <h1 style="font-size:20px;">Plan validity reminders</h1>
            <p style="color:#6B7280;">These subscribers were emailed today.</p>
            <ul style="line-height:1.7;">${rows}</ul>
            <p><a href="${appUrl()}/admin">Open admin dashboard</a></p>
          </div>
        `,
      }).catch((error) => {
        console.warn("[Alavo] Admin validity digest failed:", error);
      });
    }
  }

  return { checked: users.length, sent };
}
