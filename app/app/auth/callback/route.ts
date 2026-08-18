import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isLocalHost } from "@/lib/auth/origin";

function requestOrigin(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(",")[0].trim();
  if (host && isLocalHost(host)) {
    return `http://${host}`;
  }
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const code = request.nextUrl.searchParams.get("code");
  const provider = request.nextUrl.searchParams.get("provider") || "google";
  const isNew = request.nextUrl.searchParams.get("new") === "1";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const params = new URLSearchParams();
  if (provider) params.set("provider", provider);
  if (isNew) params.set("new", "1");
  params.set("ready", "1");

  const response = NextResponse.redirect(
    `${origin}/auth/callback/complete?${params.toString()}`
  );

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return response;
}
