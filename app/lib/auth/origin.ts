function hostnameOf(host: string) {
  return host.split(",")[0].trim().replace(/:\d+$/, "").toLowerCase();
}

export function isLocalHost(host: string) {
  const hostname = hostnameOf(host);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

export function oauthCallbackUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/auth/callback`;
}
