import nodemailer from "nodemailer";

function getMailTransport() {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim();
  const smtpPass =
    process.env.SMTP_PASSWORD?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();

  if (!smtpUser || !smtpPass) return null;

  // Prefer explicit SMTP (Hostinger / custom domain mail)
  if (smtpHost) {
    const port = Number(process.env.SMTP_PORT || "465");
    const secure =
      process.env.SMTP_SECURE === "true" ||
      process.env.SMTP_SECURE === "1" ||
      port === 465;

    return nodemailer.createTransport({
      host: smtpHost,
      port,
      secure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  // Fallback: Gmail app password
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export function getFromAddress() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "Alavo <hi@alavo.cc>"
  );
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const transporter = getMailTransport();
  if (!transporter) {
    return {
      ok: false,
      error:
        "Email is not configured (set SMTP_* for hi@alavo.cc or GMAIL_USER / GMAIL_APP_PASSWORD)",
    };
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      replyTo: options.replyTo || process.env.EMAIL_REPLY_TO || "hi@alavo.cc",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Send failed";
    console.warn("[Alavo] Email send failed:", message);
    return { ok: false, error: message };
  }
}

export async function sendOtpEmail(args: {
  to: string;
  otp: string;
  otpType?: string;
  appName?: string;
}) {
  const appName = args.appName || "Alavo";
  const label =
    args.otpType === "forget-password"
      ? "password reset"
      : args.otpType === "sign-in"
        ? "sign-in"
        : "email verification";

  return sendMail({
    to: args.to,
    subject: `${args.otp} is your ${appName} ${label} code`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 22px; margin-bottom: 8px;">${appName}</h1>
        <p style="color: #555; line-height: 1.5;">
          Your ${label} code is:
        </p>
        <p style="font-size: 32px; letter-spacing: 0.2em; font-weight: 700; margin: 24px 0;">
          ${args.otp}
        </p>
        <p style="color:#888;font-size:13px;">This code expires in 15 minutes.</p>
      </div>
    `,
  });
}

export async function sendMagicLinkEmail(args: {
  to: string;
  linkUrl: string;
  linkType?: string;
  appName?: string;
}) {
  const appName = args.appName || "Alavo";
  const label =
    args.linkType === "forget-password"
      ? "Reset your password"
      : args.linkType === "sign-in"
        ? "Sign in"
        : "Verify your email";

  return sendMail({
    to: args.to,
    subject: `${label} — ${appName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 22px; margin-bottom: 8px;">${appName}</h1>
        <p style="color: #555; line-height: 1.5;">${label} to continue with Alavo.</p>
        <p style="margin: 28px 0;">
          <a href="${args.linkUrl}" style="background:#5B6B9A;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;display:inline-block;">
            ${label}
          </a>
        </p>
        <p style="color:#888;font-size:12px;word-break:break-all;">${args.linkUrl}</p>
      </div>
    `,
  });
}

/** @deprecated Prefer sendOtpEmail / Neon Auth webhook. Kept for any legacy token links. */
export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const includeDevLink =
    process.env.NODE_ENV === "development" || process.env.EXPOSE_VERIFY_LINK === "true";

  const result = await sendMagicLinkEmail({
    to: email,
    linkUrl: verifyUrl,
    linkType: "email-verification",
  });

  if (!result.ok) {
    console.info("[Alavo] Email verification link (dev fallback):", verifyUrl);
    return { queued: false, verifyUrl };
  }

  return {
    queued: true,
    verifyUrl: includeDevLink ? verifyUrl : undefined,
  };
}
