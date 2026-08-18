export const dynamic = "force-dynamic";

/** Marketing site liveness probe. */
export async function GET() {
  return Response.json(
    { status: "ok", service: "alavo-website", timestamp: new Date().toISOString() },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
