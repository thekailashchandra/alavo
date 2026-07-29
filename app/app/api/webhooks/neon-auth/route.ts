import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendMagicLinkEmail, sendOtpEmail } from "@/lib/email";

type NeonWebhookPayload = {
  event_type: string;
  user?: { email?: string; name?: string | null };
  context?: { project_name?: string };
  event_data?: {
    otp_code?: string;
    otp_type?: string;
    link_url?: string;
    link_type?: string;
    token?: string;
  };
};

async function verifyNeonWebhook(rawBody: string, headers: Headers) {
  const signature = headers.get("x-neon-signature");
  const kid = headers.get("x-neon-signature-kid");
  const timestamp = headers.get("x-neon-timestamp");
  const baseUrl = process.env.NEON_AUTH_BASE_URL?.trim();

  if (!signature || !kid || !timestamp) {
    throw new Error("Missing required Neon webhook headers");
  }
  if (!baseUrl) {
    throw new Error("NEON_AUTH_BASE_URL is not configured");
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/.well-known/jwks.json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS (${res.status})`);
  }

  const jwks = (await res.json()) as { keys: Array<JsonWebKey & { kid?: string }> };
  const jwk = jwks.keys.find((k) => k.kid === kid);
  if (!jwk) throw new Error(`Key ${kid} not found in JWKS`);

  const publicKey = crypto.createPublicKey({
    key: jwk as crypto.JsonWebKey,
    format: "jwk",
  });
  const [headerB64, emptyPayload, signatureB64] = signature.split(".");
  if (emptyPayload !== "") throw new Error("Expected detached JWS format");

  const payloadB64 = Buffer.from(rawBody, "utf8").toString("base64url");
  const signaturePayload = `${timestamp}.${payloadB64}`;
  const signaturePayloadB64 = Buffer.from(signaturePayload, "utf8").toString("base64url");
  const signingInput = `${headerB64}.${signaturePayloadB64}`;

  const isValid = crypto.verify(
    null,
    Buffer.from(signingInput),
    publicKey,
    Buffer.from(signatureB64, "base64url")
  );

  if (!isValid) throw new Error("Invalid webhook signature");

  const ageMs = Date.now() - parseInt(timestamp, 10);
  if (Number.isFinite(ageMs) && ageMs > 5 * 60 * 1000) {
    throw new Error("Webhook timestamp too old");
  }

  return JSON.parse(rawBody) as NeonWebhookPayload;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    const payload = await verifyNeonWebhook(rawBody, request.headers);
    const email = payload.user?.email;
    const appName = payload.context?.project_name || "Alavo";

    if (!email) {
      return NextResponse.json({ error: "Missing user email" }, { status: 400 });
    }

    if (payload.event_type === "send.otp") {
      const otp = payload.event_data?.otp_code;
      if (!otp) {
        return NextResponse.json({ error: "Missing otp_code" }, { status: 400 });
      }

      const result = await sendOtpEmail({
        to: email,
        otp,
        otpType: payload.event_data?.otp_type,
        appName,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }

      return NextResponse.json({ success: true });
    }

    if (payload.event_type === "send.magic_link") {
      const linkUrl = payload.event_data?.link_url;
      if (!linkUrl) {
        return NextResponse.json({ error: "Missing link_url" }, { status: 400 });
      }

      const result = await sendMagicLinkEmail({
        to: email,
        linkUrl,
        linkType: payload.event_data?.link_type,
        appName,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }

      return NextResponse.json({ success: true });
    }

    // Acknowledge other events so Neon does not retry forever
    return NextResponse.json({ success: true, ignored: payload.event_type });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed";
    console.warn("[Alavo] Neon Auth webhook error:", message);
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
