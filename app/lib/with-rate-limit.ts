import { jsonError } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/** Apply IP-based rate limiting to sensitive API routes. */
export function enforceRateLimit(
  req: Request,
  routeKey: string,
  limit = 60,
  windowMs = 60_000
) {
  const ip = getClientIp(req);
  const result = rateLimit(`${routeKey}:${ip}`, limit, windowMs);
  if (!result.success) {
    return jsonError("Too many requests. Please try again later.", 429);
  }
  return null;
}
