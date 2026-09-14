// Auth against Supabase GoTrue over plain fetch (decision B4: no SDK — the
// bundle stays inside its budget and the surface is five endpoints).
// Session lives in IndexedDB kv "session"; the offline queue re-checks it
// before replaying (SECURITY-BASELINE): an expired refresh → AuthExpired,
// the caller keeps its queue and asks the learner to sign in again.
import { BACKEND } from "./config.ts";
import { store } from "./store.ts";

export interface Session {
  access_token: string;
  refresh_token: string;
  /** Epoch seconds. */
  expires_at: number;
  user: { id: string; email?: string; phone?: string };
}
export class AuthExpired extends Error { constructor() { super("auth expired"); this.name = "AuthExpired"; } }
export class AuthError extends Error { constructor(msg: string, public status: number) { super(msg); this.name = "AuthError"; } }

const base = () => `${BACKEND.url}/auth/v1`;
const headers = (extra: Record<string, string> = {}) => ({ apikey: BACKEND.anonKey, "Content-Type": "application/json", ...extra });

async function post(path: string, body: unknown, extra: Record<string, string> = {}): Promise<Record<string, unknown>> {
  const r = await fetch(`${base()}${path}`, { method: "POST", headers: headers(extra), body: JSON.stringify(body) });
  const text = await r.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!r.ok) throw new AuthError(String(data.msg ?? data.error_description ?? data.error ?? data.message ?? r.status), r.status);
  return data;
}

function toSession(d: Record<string, unknown>): Session {
  const user = d.user as { id: string; email?: string; phone?: string };
  const expiresIn = Number(d.expires_in ?? 3600);
  return { access_token: String(d.access_token), refresh_token: String(d.refresh_token), expires_at: Math.floor(Date.now() / 1000) + expiresIn, user: { id: user.id, email: user.email, phone: user.phone } };
}

/** Email OTP: GoTrue emails a 6-digit code (and a magic link we do not use). */
export async function requestEmailOtp(email: string): Promise<void> {
  await post("/otp", { email, create_user: true, redirect_to: location.origin + location.pathname });
}
export async function verifyEmailOtp(email: string, token: string): Promise<Session> {
  const s = toSession(await post("/verify", { type: "email", email, token }));
  await store.putSession(s);
  return s;
}
/** Phone OTP needs an SMS provider configured in the Supabase project (B3 note). Same shape. */
export async function requestPhoneOtp(phone: string): Promise<void> { await post("/otp", { phone, create_user: true }); }
export async function verifyPhoneOtp(phone: string, token: string): Promise<Session> {
  const s = toSession(await post("/verify", { type: "sms", phone, token }));
  await store.putSession(s);
  return s;
}

export async function signOut(): Promise<void> {
  const s = await store.getSession();
  if (s) { try { await post("/logout", {}, { Authorization: `Bearer ${s.access_token}` }); } catch { /* server session may already be gone */ } }
  await store.clearSession();
}

/** Current session with a fresh access token, or null when signed out. Throws AuthExpired when the refresh token is dead. */
export async function freshSession(): Promise<Session | null> {
  const s = await store.getSession();
  if (!s) return null;
  if (s.expires_at - Math.floor(Date.now() / 1000) > 60) return s;
  try {
    const next = toSession(await post("/token?grant_type=refresh_token", { refresh_token: s.refresh_token }));
    await store.putSession(next);
    return next;
  } catch (e) {
    if (e instanceof AuthError && (e.status === 400 || e.status === 401 || e.status === 403)) { await store.clearSession(); throw new AuthExpired(); }
    throw e; // network: keep the session, try later
  }
}

/**
 * Magic link landing: GoTrue redirects to the Site URL with `#access_token=…&refresh_token=…&expires_in=…`.
 * Called once on app load. Returns the stored session or null; always scrubs the hash so tokens never linger in history.
 */
export async function captureSessionFromHash(): Promise<Session | null> {
  const h = location.hash;
  if (!h.includes("access_token=")) return null;
  const q = new URLSearchParams(h.replace(/^#/, ""));
  history.replaceState(null, "", location.pathname + location.search);
  const access = q.get("access_token"), refresh = q.get("refresh_token");
  if (!access || !refresh) return null;
  try {
    const r = await fetch(`${base()}/user`, { headers: headers({ Authorization: `Bearer ${access}` }) });
    if (!r.ok) return null;
    const user = (await r.json()) as { id: string; email?: string; phone?: string };
    const s: Session = { access_token: access, refresh_token: refresh, expires_at: Math.floor(Date.now() / 1000) + Number(q.get("expires_in") ?? 3600), user: { id: user.id, email: user.email, phone: user.phone } };
    await store.putSession(s);
    return s;
  } catch { return null; }
}
