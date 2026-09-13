import { store } from "../store.ts";
import { APP_VERSION } from "../version.ts";
import type { Ctx } from "../app.tsx";

export function SettingsScreen(p: { ctx: Ctx }) {
  const { ctx } = p;
  const { t } = ctx;
  const exportData = async () => {
    const data = await store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `keel-export-${ctx.today}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <section class="settings">
      <h2>{t.settings}</h2>
      <label>{t.language}
        <select value={ctx.locale} onChange={(e) => ctx.setLocale((e.target as HTMLSelectElement).value as "en" | "ur")}>
          <option value="en">English</option>
          <option value="ur">اردو</option>
        </select>
      </label>
      <p class="muted">{ctx.rec.intention.after || ctx.rec.intention.place ? `${ctx.rec.intention.after} · ${ctx.rec.intention.place}` : ""}</p>
      <button class="secondary" onClick={exportData}>{t.exportData}</button>
      <button class="secondary danger" onClick={() => { if (confirm(t.resetConfirm)) ctx.reset(); }}>{t.resetApp}</button>
      <p class="muted">{t.version} {APP_VERSION}</p>
    </section>
  );
}
