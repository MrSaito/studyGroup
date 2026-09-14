// Backend endpoints. The publishable (anon) key is public by design — RLS is the
// security boundary (CLAUDE.md §5.6, B5). Project keel, ref qwrbevhxtflmwkmueqmw, ap-south-1 (session 8).
// For the local e2e a same-machine fake backend can be substituted, but only
// when the page itself is served from a loopback host.
const PROD = {
  url: "https://qwrbevhxtflmwkmueqmw.supabase.co",
  anonKey: "sb_publishable_L4QCokZCFT8dnCG1_cUDww_VXGaHxDV",
  vapidPublicKey: "BKeBSALdZopbMS6yvGeYn1t5Z9WPioLlXZ8IJoZz6Qnx-tz9SsvdNCr0ToeVA0TdN3QjrrsU-VKOKhsDcmTkTyw",
};

function override(): { url: string; anonKey: string; vapidPublicKey: string } | null {
  try {
    const host = location.hostname;
    if (host !== "127.0.0.1" && host !== "localhost") return null;
    const raw = localStorage.getItem("keel.backend");
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<typeof PROD>;
    if (typeof o.url !== "string") return null;
    return { url: o.url, anonKey: o.anonKey ?? "test-anon", vapidPublicKey: o.vapidPublicKey ?? PROD.vapidPublicKey };
  } catch { return null; }
}

export const BACKEND = override() ?? PROD;
export const BACKEND_CONFIGURED = !BACKEND.url.startsWith("__");
