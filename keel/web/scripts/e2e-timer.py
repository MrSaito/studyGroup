# A2 gate: the unit timer keeps correct time while the tab is hidden (no ticks) and across a reload.
# Uses Playwright's fake clock: advance 5 minutes while "hidden", then assert the display.
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
BASE = os.environ.get("KEEL_URL", "http://127.0.0.1:4173/")
srv = None
if "127.0.0.1" in BASE:
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "4174", "-d", "dist", "--bind", "127.0.0.1"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    BASE = "http://127.0.0.1:4174/"; time.sleep(1.5)
SET_VIS = "(state) => { Object.defineProperty(document, 'visibilityState', { value: state, configurable: true }); Object.defineProperty(document, 'hidden', { value: state === 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }"
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--no-proxy-server"] if srv else [])
        pg = b.new_page(viewport={"width": 390, "height": 844})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.clock.install(time="2026-09-14T10:00:00")
        pg.goto(BASE); pg.wait_for_selector("textarea"); pg.fill("textarea", "Timer test"); pg.click("button.primary")
        pg.click("button[data-template=sample]"); pg.wait_for_selector(".days"); pg.click("button.primary"); pg.click("button.primary")
        pg.wait_for_selector(".unit-title"); pg.click("button.primary"); pg.wait_for_selector(".timer button:not([disabled])")
        ring = lambda: pg.inner_text(".timer-ring span")
        assert ring() == "40:00", ring()                      # "Variables and types" is a 40-minute unit
        # The interval tick lags a fake-clock jump by up to one tick; a visibilitychange forces the
        # synchronous recompute (that is the A2 path under test), so assertions are exact.
        sync = lambda: pg.evaluate(SET_VIS, "visible")
        pg.click(".timer button"); pg.clock.run_for(10_000); sync(); assert ring() == "39:50", ring()
        pg.evaluate(SET_VIS, "hidden")                        # tab goes to background: interval stops
        pg.clock.run_for(5 * 60 * 1000)                       # five minutes pass with no ticks
        sync()                                                # back: recompute immediately from wall clock
        assert ring() == "34:50", ring(); print("Hidden 5 min → display", ring())
        pg.fill("textarea", "draft log survives reload")
        pg.clock.run_for(1_000); pg.wait_for_timeout(300)     # let the log debounce flush to IndexedDB
        pg.reload(); pg.wait_for_selector(".timer button:not([disabled])")
        pg.clock.run_for(2_000); sync()
        r = ring(); assert r in ("34:46", "34:47", "34:48"), r   # still running, resumed from IndexedDB (± real-time drift)
        assert pg.input_value("textarea") == "draft log survives reload"
        print("After reload → display", r, "| log restored")
        pg.click(".unit .primary"); pg.wait_for_selector("text=Done for today")
        assert not errs, errs
        print("TIMER E2E PASSED"); b.close()
finally:
    if srv: srv.terminate()
