# Headless end-to-end smoke (Playwright, Chromium). Deterministic clock (a Monday). Path:
#   onboard with the sample → complete a unit → persists across reload
#   → Plan: skip a unit with a reason (advances, not a session, day not spent)
#   → Progress: cells incl. skipped; weekly review (quiz empty: nothing ≥7 days old) → saved
#   → Urdu RTL → SW registered → offline reload
#   → still offline: delete everything → onboard with the bundled 36-week roadmap (lazy chunk from SW cache)
#   → fresh context: onboard by choosing a Markdown FILE (A5)
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
BASE = os.environ.get("KEEL_URL", "http://127.0.0.1:4173/")
HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLE_MD = os.path.join(HERE, "..", "..", "engine", "examples", "sample-plan.md")
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

        # Plan (A4): skip unit 3 with a reason. Today must still show unit 2 and the day stays spent.
        pg.click("nav [data-tab=plan]"); pg.wait_for_selector(".plan-row")
        assert pg.locator(".plan-row").count() == 10
        assert pg.get_attribute("li[data-seq='2']", "data-status") == "current"
        pg.click("li[data-seq='3'] button"); pg.wait_for_selector(".sheet textarea")
        pg.fill(".sheet textarea", "Already comfortable with this"); pg.click(".sheet .primary")
        pg.wait_for_selector("li[data-seq='3'][data-status=skipped]"); pg.screenshot(path="/tmp/plan.png")
        pg.click("nav [data-tab=today]"); pg.wait_for_selector(".unit-title")
        assert "Done for today" in pg.inner_text(".eyebrow") and pg.inner_text(".unit-title") == "Lists and dictionaries", "skip must not spend the day or move today"
        print("Plan: skipped unit 3 |", pg.inner_text(".course-meta").split("\n")[0])

        pg.click("nav [data-tab=progress]"); pg.wait_for_selector(".cells")
        n, d, sk = pg.locator(".cell").count(), pg.locator(".cell.done").count(), pg.locator(".cell.skipped").count()
        assert (n, d, sk) == (10, 1, 1), (n, d, sk)
        print("Progress cells:", n, "done:", d, "skipped:", sk, "| score:", pg.inner_text(".score strong"))
        pg.screenshot(path="/tmp/progress.png")

        # Weekly review (A3) from Progress: quiz empty on day 1, answers saved, Progress reflects it.
        pg.click("button[data-action=review]"); pg.wait_for_selector(".review")
        assert pg.locator(".quiz-empty").count() == 1, "quiz should be empty: nothing is 7 days old"
        pg.fill("textarea[name=finished]", "Variables"); pg.fill("textarea[name=stuck]", "Nothing yet"); pg.fill("textarea[name=next]", "Dictionaries")
        pg.screenshot(path="/tmp/review.png"); pg.click(".review .primary")
        pg.wait_for_selector("[data-reviewed]"); print("Weekly review saved:", pg.inner_text("[data-reviewed]"))

        pg.click("nav [data-tab=settings]"); pg.select_option("select", "ur"); pg.wait_for_timeout(300)
        assert pg.evaluate("document.documentElement.dir") == "rtl"; print("Urdu RTL:", pg.inner_text("h2"))
        pg.screenshot(path="/tmp/settings-ur.png")
        pg.wait_for_timeout(1500)
        assert pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.length)") == 1, "SW not registered"
        pg.context.set_offline(True); pg.reload(); pg.wait_for_selector("h2"); print("Offline reload OK:", pg.inner_text("h2"))

        # Still offline: wipe, then onboard with the bundled 36-week roadmap (A8). Its lazy chunk must come from the SW cache.
        pg.click("nav [data-tab=settings]"); pg.select_option("select", "en"); pg.on("dialog", lambda d: d.accept()); pg.click("button.danger")
        pg.wait_for_selector("textarea"); pg.fill("textarea", "Become an AI engineer"); pg.click("button.primary")
        pg.click("button[data-template=ai-engineer-36w]"); pg.wait_for_selector(".days")
        meta = pg.inner_text("section p.muted"); assert "252 units" in meta, meta
        assert pg.locator(".notice").count() == 0, "template must not show validation notes"
        pg.click("button.primary"); pg.click("button.primary"); pg.wait_for_selector(".unit-title")
        t2 = pg.inner_text(".unit-title"); assert t2 == "Set up the machine", t2
        pos = pg.inner_text(".course-meta").replace("\n", " "); assert "Day 1 of 252" in pos, pos
        print("Roadmap offline:", t2, "|", pos)
        pg.click("nav [data-tab=progress]"); pg.wait_for_selector(".cells")
        n = pg.locator(".cell").count(); assert n == 252, n; print("Roadmap progress cells:", n, "| stages:", pg.locator(".stage").count())
        assert not errs, errs

        # Fresh context (online): onboard by choosing a Markdown file (A5).
        ctx2 = b.new_context(viewport={"width": 390, "height": 844}); p2 = ctx2.new_page()
        p2.clock.set_fixed_time("2026-09-14T10:00:00")
        p2.goto(BASE); p2.wait_for_selector("textarea"); p2.fill("textarea", "File import"); p2.click("button.primary")
        p2.set_input_files("input[type=file]", SAMPLE_MD); p2.wait_for_selector(".days")
        meta = p2.inner_text("section p.muted"); assert "10 units" in meta, meta
        print("File import:", meta.replace("\n", " "))
        print("SMOKE PASSED"); b.close()
finally:
    if srv: srv.terminate()
