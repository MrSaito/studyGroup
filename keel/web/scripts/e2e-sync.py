# B4 gate: two browser contexts, same account, against the fake backend (scripts/fake-supabase.py).
#   A: onboard, sign in (email OTP), complete a unit → synced.
#   B: fresh device → "I already use Keel on another phone" → sign in → enrollment + history arrive.
#   B offline: skip a unit → queue holds ("offline") → back online → drains → A pulls it after reload.
#   Cross-user: C signs in as someone else and sees nothing of A's.
#   Delete account from A → server has zero rows for that user.
import subprocess, sys, time, os, json, urllib.request
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
APP, API = "http://127.0.0.1:4173/", "http://127.0.0.1:4175"
srv = subprocess.Popen([sys.executable, "-m", "http.server", "4173", "-d", "dist", "--bind", "127.0.0.1"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
api = subprocess.Popen([sys.executable, os.path.join(HERE, "fake-supabase.py"), "4175"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
def tables(): return json.load(urllib.request.urlopen(API + "/__tables"))
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--no-proxy-server"])
        def device(name):
            c = b.new_context(viewport={"width": 390, "height": 844})
            c.add_init_script(f"localStorage.setItem('keel.backend', JSON.stringify({{url: '{API}', anonKey: 'test-anon'}}))")
            pg = c.new_page(); pg.on("dialog", lambda d: d.accept())
            pg.clock.set_fixed_time("2026-09-14T10:00:00"); pg.goto(APP); pg.wait_for_selector("textarea")
            return c, pg
        def wait_status(pg, *want):
            pg.wait_for_function(f"[{','.join(repr(w) for w in want)}].includes(document.querySelector('[data-sync-status]')?.dataset.syncStatus)", timeout=15000)
            return pg.get_attribute("[data-sync-status]", "data-sync-status")
        def sign_in(pg, email):
            pg.fill("[data-signin] input[name=email]", email); pg.click("button[data-action=send-code]")
            pg.fill("[data-signin] input[name=code]", "123456"); pg.click("button[data-action=verify-code]")

        # ---- A ----
        ca, a = device("A")
        a.fill("textarea", "Sync test"); a.click("button.primary"); a.click("button[data-template=sample]"); a.wait_for_selector(".days"); a.click("button.primary"); a.click("button.primary")
        a.wait_for_selector(".unit-title"); a.click("nav [data-tab=settings]"); a.wait_for_selector("[data-signin]")
        sign_in(a, "a@test.keel"); a.wait_for_selector("[data-account]"); st = wait_status(a, "idle")
        a.click("nav [data-tab=today]"); a.click("button.primary"); a.wait_for_selector(".timer"); a.fill("textarea", "synced log"); a.click(".unit .primary"); a.wait_for_selector("text=Done for today")
        a.click("nav [data-tab=settings]"); wait_status(a, "idle"); a.wait_for_timeout(2000)  # debounce + run
        tb = tables(); assert len(tb["enrollments"]) == 1 and len(tb["completions"]) == 1, {k: len(v) for k, v in tb.items()}
        assert tb["completions"][0]["log_text"] == "synced log" and tb["enrollments"][0]["status"] == "active", (tb["completions"][0], tb["enrollments"][0]["status"])
        print("A: signed in, enrollment + 1 completion on server | events:", len(tb["events"]))

        # ---- B: fresh device, same account ----
        cb, bpg = device("B")
        bpg.click("button[data-action=have-account]"); sign_in(bpg, "a@test.keel")
        bpg.wait_for_selector(".unit-title", timeout=15000)
        assert "Done for today" in bpg.inner_text(".eyebrow"), bpg.inner_text(".eyebrow")
        b_title = bpg.inner_text(".unit-title")
        bpg.click("nav [data-tab=progress]"); bpg.wait_for_selector(".cells"); assert bpg.locator(".cell.done").count() == 1
        print("B: pulled enrollment + history:", b_title)

        # ---- B offline: queue, then drain ----
        cb.set_offline(True)
        bpg.click("nav [data-tab=plan]"); bpg.click("li[data-seq='3'] button"); bpg.fill(".sheet textarea", "offline skip"); bpg.click(".sheet .primary")
        bpg.wait_for_selector("li[data-seq='3'][data-status=skipped]")
        bpg.click("nav [data-tab=settings]"); st = wait_status(bpg, "offline", "error"); print("B offline: status", st, "| server completions:", len(tables()["completions"]))
        assert len(tables()["completions"]) == 1
        cb.set_offline(False); bpg.evaluate("dispatchEvent(new Event('online'))"); wait_status(bpg, "idle"); bpg.wait_for_timeout(500)
        assert len(tables()["completions"]) == 2, "queue did not drain"
        print("B online: queue drained → server completions: 2")
        a.reload(); a.wait_for_selector(".unit-title"); a.wait_for_timeout(1500)
        a.click("nav [data-tab=plan]"); a.wait_for_selector("li[data-seq='3'][data-status=skipped]", timeout=10000); print("A: sees B's skip after reload")

        # ---- C: another user sees nothing ----
        cc, c = device("C")
        c.click("button[data-action=have-account]"); sign_in(c, "c@test.keel"); c.wait_for_timeout(2500)
        assert c.locator("textarea").count() == 1 and c.locator(".unit-title").count() == 0, "user C must not receive user A's enrollment"
        print("C: cross-user isolation OK (still on onboarding)")

        # ---- A deletes the account ----
        a.click("nav [data-tab=settings]"); a.click("button[data-action=delete-account]"); a.wait_for_selector("textarea")
        tb = tables(); uid_rows = sum(1 for t in tb.values() for r in t if r.get("user_id") == tb["users"][0]["id"] if tb["users"]) if tb["users"] else 0
        a_left = [r for t, rows in tb.items() for r in rows if (r.get("user_id") or r.get("id")) and t != "users" and r.get("user_id") not in {u["id"] for u in tb["users"]}]
        assert not a_left, a_left
        print("A: account deleted → server rows for A: 0; local wiped → onboarding")
        print("SYNC E2E PASSED"); b.close()
except Exception:
    try: print("API LOG:", json.load(urllib.request.urlopen(API + "/__log"))[-25:]); print("TABLES:", {k: len(v) for k, v in tables().items()})
    except Exception as e2: print("no api log", e2)
    raise
finally:
    srv.terminate(); api.terminate()
