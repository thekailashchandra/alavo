import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const from = process.env.RESEND_FROM_EMAIL || "Alavo <onboarding@resend.dev>";

  const resend = getResend();

  // Always expose the link in development so local signup works without inbox delivery
  const includeDevLink =
    process.env.NODE_ENV === "development" || process.env.EXPOSE_VERIFY_LINK === "true";

  if (!resend) {
    console.info("[Alavo] Email verification link (dev fallback):", verifyUrl);
    return { queued: false, verifyUrl };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: email,
      subject: "Verify your Alavo account",
      html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 22px; margin-bottom: 8px;">Welcome to Alavo</h1>
        <p style="color: #555; line-height: 1.5;">
          Confirm your email to start tracking habits. This link expires in 24 hours.
        </p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}" style="background:#5B6B9A;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;display:inline-block;">
            Verify email
          </a>
        </p>
        <p style="color:#888;font-size:12px;word-break:break-all;">${verifyUrl}</p>
      </div>
    `,
    });

    if (result.error) {
      console.warn("[Alavo] Resend send failed:", result.error);
      return { queued: false, verifyUrl };
    }

    return {
      queued: true,
      verifyUrl: includeDevLink ? verifyUrl : undefined,
    };
  } catch (error) {
    console.warn("[Alavo] Resend send threw:", error);
    return { queued: false, verifyUrl };
  }
}
