import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const publicKey =
      process.env.VAPID_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!publicKey) {
      return jsonError("VAPID public key not configured", 503);
    }

    return jsonOk({ publicKey });
  } catch (error) {
    return handleApiError(error);
  }
}
