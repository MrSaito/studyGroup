# In-memory stand-in for the six Supabase endpoints Keel's client uses (GoTrue + PostgREST + one function).
# Purpose: deterministic Playwright e2e for auth + sync on a machine with no Supabase reachable.
# It enforces the same per-user boundary the RLS policies do: every row is scoped to the bearer's uid.
import json, sys, uuid, hashlib, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4175
OTP = "123456"
TABLES = {t: {} for t in ("users", "enrollments", "completions", "reviews", "events", "push_subscriptions", "notification_prefs")}
PK = {"users": "id", "enrollments": "id", "completions": "id", "reviews": "id", "events": "id", "push_subscriptions": "endpoint", "notification_prefs": "user_id"}
APPEND_ONLY = {"completions", "reviews", "events"}
LOCK = threading.Lock()
LOG = []

def uid_for(email): return str(uuid.UUID(hashlib.sha256(email.lower().encode()).hexdigest()[:32]))
def session(uid, email): return {"access_token": f"tok:{uid}", "refresh_token": f"ref:{uid}", "expires_in": 3600, "token_type": "bearer", "user": {"id": uid, "email": email, "aud": "authenticated"}}

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "*"); self.send_header("Access-Control-Allow-Headers", "apikey, authorization, content-type, prefer, accept, x-client-info")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
    def reply(self, code, body=None):
        data = b"" if body is None else json.dumps(body).encode()
        self.send_response(code); self.cors(); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)
    def body(self):
        n = int(self.headers.get("Content-Length") or 0); return json.loads(self.rfile.read(n) or b"null") if n else None
    def uid(self):
        a = self.headers.get("Authorization", "")
        if a.startswith("Bearer tok:"): return a[len("Bearer tok:"):]
        return None
    def do_OPTIONS(self): self.send_response(204); self.cors(); self.end_headers()

    def do_POST(self):
        u = urlparse(self.path); q = parse_qs(u.query); b = self.body()
        with LOCK:
            LOG.append(("POST", u.path))
            if u.path == "/auth/v1/otp": return self.reply(200, {})
            if u.path == "/auth/v1/verify":
                if b.get("token") != OTP: return self.reply(403, {"msg": "Token has expired or is invalid"})
                email = b.get("email") or b.get("phone"); uid = uid_for(email)
                TABLES["users"].setdefault(uid, {"id": uid, "tz": "Asia/Karachi", "locale": "en"})
                return self.reply(200, session(uid, email))
            if u.path == "/auth/v1/token":
                if q.get("grant_type") == ["refresh_token"] and str(b.get("refresh_token", "")).startswith("ref:"):
                    uid = b["refresh_token"][4:]; return self.reply(200, session(uid, "refreshed@test"))
                return self.reply(400, {"error": "invalid_grant"})
            if u.path == "/auth/v1/logout": return self.reply(204)
            uid = self.uid()
            if not uid: return self.reply(401, {"message": "JWT required"})
            if u.path == "/functions/v1/delete-account":
                for t in TABLES.values():
                    for k in [k for k, r in t.items() if r.get("user_id") == uid or (r.get("id") == uid and "user_id" not in r)]: del t[k]
                return self.reply(200, {"deleted": True})
            if u.path.startswith("/rest/v1/"):
                table = u.path[len("/rest/v1/"):]
                if table not in TABLES: return self.reply(404, {"message": "no table"})
                prefer = self.headers.get("Prefer", ""); rows = b if isinstance(b, list) else [b]; pk = PK[table]
                for r in rows:
                    if r.get("user_id", uid) != uid: return self.reply(403, {"code": "42501", "message": "new row violates row-level security policy"})
                    r.setdefault("user_id", uid)
                    if pk not in r: r[pk] = str(uuid.uuid4())
                    key = r[pk]
                    if key in TABLES[table]:
                        if "ignore-duplicates" in prefer: continue
                        if "merge-duplicates" in prefer: TABLES[table][key] = {**TABLES[table][key], **r}; continue
                        return self.reply(409, {"code": "23505", "message": "duplicate key"})
                    TABLES[table][key] = r
                return self.reply(201, [] if "return=minimal" in prefer else rows)
            return self.reply(404, {})

    def rows_for(self, table, uid, q):
        out = []
        for r in TABLES[table].values():
            if table == "users":
                if r["id"] != uid: continue
            elif r.get("user_id") != uid: continue
            ok = True
            for k, vs in q.items():
                if k in ("select", "order", "limit", "on_conflict"): continue
                op, _, val = unquote(vs[0]).partition(".")
                x = r.get(k)
                if op == "eq" and str(x) != val: ok = False
                if op == "gt" and not (x is not None and str(x) > val): ok = False
                if op == "gte" and not (x is not None and str(x) >= val): ok = False
            if ok: out.append(r)
        if "order" in q:
            col, _, d = q["order"][0].partition("."); out.sort(key=lambda r: str(r.get(col, "")), reverse=(d == "desc"))
        if "limit" in q: out = out[: int(q["limit"][0])]
        return out

    def do_GET(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        with LOCK:
            if u.path == "/__log": return self.reply(200, LOG)
            if u.path == "/__tables": return self.reply(200, {t: list(v.values()) for t, v in TABLES.items()})
            uid = self.uid()
            if not uid: return self.reply(401, {"message": "JWT required"})
            if u.path == "/auth/v1/user": return self.reply(200, {"id": uid})
            if u.path.startswith("/rest/v1/"):
                table = u.path[len("/rest/v1/"):]
                if table not in TABLES: return self.reply(404, {})
                if table == "events": return self.reply(200, [])  # no select policy
                return self.reply(200, self.rows_for(table, uid, q))
            return self.reply(404, {})

    def do_PATCH(self):
        u = urlparse(self.path); q = parse_qs(u.query); b = self.body()
        with LOCK:
            uid = self.uid()
            if not uid: return self.reply(401, {})
            table = u.path[len("/rest/v1/"):]
            if table in APPEND_ONLY: return self.reply(403, {"code": "42501", "message": "permission denied"})
            for r in self.rows_for(table, uid, q): r.update({k: v for k, v in b.items() if k != "user_id"})
            return self.reply(204)

    def do_DELETE(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        with LOCK:
            uid = self.uid()
            if not uid: return self.reply(401, {})
            table = u.path[len("/rest/v1/"):]
            if table in APPEND_ONLY or table == "users": return self.reply(403, {"code": "42501"})
            for r in self.rows_for(table, uid, q): del TABLES[table][r[PK[table]]]
            return self.reply(204)

if __name__ == "__main__":
    print(f"fake supabase on 127.0.0.1:{PORT}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
