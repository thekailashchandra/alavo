async function tryReq(label, url, init) {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    console.log("\n===", label, "===");
    console.log("status", res.status);
    console.log("body", text.slice(0, 800));
  } catch (e) {
    console.log("\n===", label, "===");
    console.log("FAIL", e.message);
  }
}

(async () => {
  const origins = [
    "https://app.alavo.cc",
    "https://alavo-app.vercel.app",
    "https://www.alavo.cc",
  ];

  for (const origin of origins) {
    await tryReq(
      `sign-up from ${origin}`,
      "https://app.alavo.cc/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          Referer: `${origin}/signup`,
        },
        body: JSON.stringify({
          email: `probe-${Date.now()}@example.com`,
          password: "Test1234!",
          name: "Probe",
        }),
      }
    );
  }

  await tryReq(
    "sign-in from app.alavo.cc",
    "https://app.alavo.cc/api/auth/sign-in/email",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://app.alavo.cc",
        Referer: "https://app.alavo.cc/login",
      },
      body: JSON.stringify({
        email: "brandmenstudio@gmail.com",
        password: "wrong-password-check",
      }),
    }
  );
})();
