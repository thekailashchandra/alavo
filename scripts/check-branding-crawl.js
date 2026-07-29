async function check(label, headers) {
  const res = await fetch("https://alavo.cc/", {
    headers: { ...headers, "cache-control": "no-cache" },
  });
  const h = await res.text();
  const h1 = (h.match(/<h1[^>]*>([^<]*)<\/h1>/) || [])[1];
  const title = (h.match(/<title>([^<]+)<\/title>/) || [])[1];
  console.log("===", label, "status", res.status, "===");
  console.log("title:", title);
  console.log("h1:", JSON.stringify(h1));
  console.log(
    "purpose:",
    /Alavo is a habit tracking app/i.test(h),
    "| privacy:",
    h.includes("/privacy")
  );
}

(async () => {
  await check("browser", {
    "user-agent": "Mozilla/5.0",
  });
  await check("googlebot", {
    "user-agent":
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  });
  try {
    const robots = await fetch("https://alavo.cc/robots.txt").then((r) =>
      r.text()
    );
    console.log("robots.txt:", robots.slice(0, 300) || "(empty/missing)");
  } catch (e) {
    console.log("robots.txt: missing");
  }
})();
