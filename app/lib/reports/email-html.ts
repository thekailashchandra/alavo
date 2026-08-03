import type { UserReportData } from "@/lib/reports/stats";

const PRIMARY = "#5B6B9A";
const MUTED = "#6B7280";
const BG = "#F4F7F9";
const CARD = "#FFFFFF";
const DONE = "#5B6B9A";
const EMPTY = "#E5E7EB";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function daySquares(statuses: boolean[]) {
  // Cap visual grid for monthly (show rate-focused UI instead of 31 squares)
  if (statuses.length > 14) return "";
  const cells = statuses
    .map(
      (done) =>
        `<td style="padding:2px;"><div style="width:14px;height:14px;border-radius:3px;background:${done ? DONE : EMPTY};"></div></td>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>${cells}</tr></table>`;
}

function habitInitial(name: string) {
  return escapeHtml((name.trim()[0] || "A").toUpperCase());
}

function timesLabel(n: number) {
  return `${n} time${n === 1 ? "" : "s"}`;
}

export function renderReportEmailHtml(data: UserReportData, appUrl: string) {
  const privacy = "https://alavo.cc/privacy";
  const showGrid = data.dates.length <= 14;

  const activeRows = data.habits
    .map((h) => {
      const grid = showGrid
        ? `<td align="right" style="padding:14px 0 14px 12px;vertical-align:middle;">${daySquares(h.dayStatuses)}</td>`
        : "";
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #EEF0F3;vertical-align:middle;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:36px;vertical-align:middle;">
                <div style="width:32px;height:32px;border-radius:16px;background:#EEF1F7;color:${PRIMARY};font-weight:700;font-size:14px;line-height:32px;text-align:center;">${habitInitial(h.name)}</div>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <div style="font-size:15px;font-weight:600;color:#111827;">${escapeHtml(h.name)}</div>
                <div style="font-size:12px;color:${MUTED};margin-top:2px;">Total: ${timesLabel(h.completions)}</div>
              </td>
            </tr></table>
          </td>
          ${grid}
        </tr>`;
    })
    .join("");

  const rateRows = [...data.habits]
    .sort((a, b) => b.rate - a.rate)
    .map(
      (h) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #EEF0F3;width:64px;vertical-align:top;">
          <div style="font-size:22px;font-weight:700;color:#111827;line-height:1;">${h.rate}%</div>
        </td>
        <td style="padding:14px 0 14px 8px;border-bottom:1px solid #EEF0F3;vertical-align:top;">
          <div style="font-size:15px;font-weight:600;color:#111827;">${escapeHtml(h.name)}</div>
          <div style="font-size:12px;color:${MUTED};margin-top:2px;">${h.completions}/${h.expectedDays} day (${timesLabel(h.completions)})</div>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(data.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:8px 0 20px;">
              <div style="font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#111827;">alavo</div>
            </td>
          </tr>

          <tr>
            <td style="background:${CARD};border-radius:16px;padding:28px 24px;box-shadow:0 1px 2px rgba(16,24,40,0.04);">
              <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;color:${PRIMARY};">${escapeHtml(data.rangeLabel)}</div>
              <div style="font-size:26px;font-weight:700;color:#111827;margin:8px 0 12px;letter-spacing:-0.02em;">${escapeHtml(data.title)}</div>
              <p style="margin:0;font-size:15px;line-height:1.55;color:${MUTED};">${escapeHtml(data.summary)}</p>
            </td>
          </tr>

          <tr><td style="height:22px;"></td></tr>

          <tr>
            <td style="font-size:13px;font-weight:700;color:#111827;padding:0 4px 8px;">Active Habits</td>
          </tr>
          <tr>
            <td style="background:${CARD};border-radius:16px;padding:8px 20px;box-shadow:0 1px 2px rgba(16,24,40,0.04);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${activeRows}</table>
            </td>
          </tr>

          <tr><td style="height:22px;"></td></tr>

          <tr>
            <td style="font-size:13px;font-weight:700;color:#111827;padding:0 4px 8px;">Based on Completion Rate</td>
          </tr>
          <tr>
            <td style="background:${CARD};border-radius:16px;padding:8px 20px;box-shadow:0 1px 2px rgba(16,24,40,0.04);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rateRows}</table>
            </td>
          </tr>

          <tr><td style="height:28px;"></td></tr>

          <tr>
            <td align="center" style="padding:0 8px;">
              <a href="${escapeHtml(appUrl)}/today" style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px;">Open Alavo</a>
            </td>
          </tr>

          <tr><td style="height:28px;"></td></tr>

          <tr>
            <td align="center" style="font-size:12px;color:${MUTED};line-height:1.6;">
              © ${new Date().getFullYear()} Alavo. All rights reserved.<br />
              <a href="${privacy}" style="color:${PRIMARY};text-decoration:none;">Privacy Policy</a>
              &nbsp;·&nbsp;
              <a href="https://alavo.cc/terms" style="color:${PRIMARY};text-decoration:none;">Terms</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
