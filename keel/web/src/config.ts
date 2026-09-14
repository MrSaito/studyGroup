// Backend endpoints. The publishable (anon) key is public by design — RLS is the
// security boundary (CLAUDE.md §5.6, B5). Filled in by session 7 (Phase B1).
// For the local e2e a same-machine fake backend can be substituted, but only
// when the page itself is served from a loopback host.
const PROD = {
  url: "__SUPABASE_URL__",
  anonKey: "__SUPABASE_ANON_KEY__",
  vapidPublicKey: "__VAPID_PUBLIC_KEY__",
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
