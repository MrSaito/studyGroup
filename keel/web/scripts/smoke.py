# Headless end-to-end smoke: onboard → complete a unit → persist across reload → progress → Urdu RTL → SW registered → offline reload
# → delete everything → onboard again OFFLINE with the bundled AI Engineer roadmap (lazy chunk must be precached).
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
BASE = os.environ.get("KEEL_URL", "http://127.0.0.1:4173/")
srv = None
if "127.0.0.1" in BASE:
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "4173", "-d", "dist", "--bind", "127.0.0.1"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--no-proxy-server"] if srv else [])
        pg = b.new_page(viewport={"width": 390, "height": 844})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.clock.set_fixed_time("2026-09-14T10:00:00")  # a Monday; deterministic regardless of sandbox clock
        pg.goto(BASE); pg.wait_for_selector("textarea")
        pg.fill("textarea", "Pass FCPS Part II")
        pg.click("button.primary"); pg.click("button[data-template=sample]")
        pg.wait_for_selector(".days"); pg.click("button.primary"); pg.click("button.primary")
        pg.wait_for_selector(".unit-title"); pg.screenshot(path="/tmp/today.png")
        t1 = pg.inner_text(".unit-title"); assert t1 == "Variables and types", t1
        print("Today:", t1, "|", pg.inner_text(".course-meta").replace("\n", " "))
        pg.click("button.primary"); pg.wait_for_selector(".timer"); pg.screenshot(path="/tmp/unit.png")
        pg.fill("textarea", "Did the thing"); pg.click("button.primary")
        pg.wait_for_selector("text=Done for today"); pg.screenshot(path="/tmp/after.png")
        pg.reload(); pg.wait_for_selector(".unit-title")
        assert "Done for today" in pg.inner_text(".eyebrow"), "completion not persisted"
        print("Persisted after reload:", pg.inner_text(".unit-title"))
        pg.click("nav button:nth-child(2)"); pg.wait_for_selector(".cells")
        n, d = pg.locator(".cell").count(), pg.locator(".cell.done").count(); assert (n, d) == (10, 1), (n, d)
        print("Progress cells:", n, "done:", d, "| score:", pg.inner_text(".score strong"))
        pg.screenshot(path="/tmp/progress.png")
        pg.click("nav button:nth-child(3)"); pg.select_option("select", "ur"); pg.wait_for_timeout(300)
        assert pg.evaluate("document.documentElement.dir") == "rtl"; print("Urdu RTL:", pg.inner_text("h2"))
        pg.screenshot(path="/tmp/settings-ur.png")
        pg.wait_for_timeout(1500)
        assert pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.length)") == 1, "SW not registered"
        pg.context.set_offline(True); pg.reload(); pg.wait_for_selector("h2"); print("Offline reload OK:", pg.inner_text("h2"))
        # Still offline: wipe, then onboard with the bundled 36-week roadmap (A8). Its lazy chunk must come from the SW cache.
        pg.click("nav button:nth-child(3)"); pg.select_option("select", "en"); pg.on("dialog", lambda d: d.accept()); pg.click("button.danger")
        pg.wait_for_selector("textarea"); pg.fill("textarea", "Become an AI engineer"); pg.click("button.primary")
        pg.click("button[data-template=ai-engineer-36w]"); pg.wait_for_selector(".days")
        meta = pg.inner_text("section p.muted"); assert "252 units" in meta, meta
        assert pg.locator(".notice").count() == 0, "template must not show validation notes"
        pg.click("button.primary"); pg.click("button.primary"); pg.wait_for_selector(".unit-title")
        t2 = pg.inner_text(".unit-title"); assert t2 == "Set up the machine", t2
        pos = pg.inner_text(".course-meta").replace("\n", " "); assert "Day 1 of 252" in pos, pos
        print("Roadmap offline:", t2, "|", pos)
        pg.click("nav button:nth-child(2)"); pg.wait_for_selector(".cells")
        n = pg.locator(".cell").count(); assert n == 252, n; print("Roadmap progress cells:", n, "| stages:", pg.locator(".stage").count())
        assert not errs, errs
        print("SMOKE PASSED"); b.close()
finally:
    if srv: srv.terminate()
