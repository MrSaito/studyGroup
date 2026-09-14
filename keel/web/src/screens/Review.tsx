import { useState } from "preact/hooks";
import { retrievalQuiz, weekStart } from "@keel/engine";
import type { Ctx } from "../app.tsx";

// Weekly review (Blueprint §3.6, §5.7, free tier — A3). Retrieval quiz first:
// the learner's own log lines from a week or more ago, recall before reveal,
// nothing graded. Then three questions stored as a `reviews` row.
export function ReviewScreen(p: { ctx: Ctx }) {
  const { ctx } = p;
  const { t } = ctx;
  const quiz = retrievalQuiz(ctx.enrollment, ctx.today);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState("");
  const [stuck, setStuck] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await ctx.addReview({ week_start: weekStart(ctx.today), finished: finished.trim(), stuck: stuck.trim(), next: next.trim() });
    ctx.go({ name: "progress" });
  };

  return (
    <section class="review">
      <button class="link back" onClick={() => ctx.go({ name: "today" })}>{t.back}</button>
      <h2>{t.weeklyReview}</h2>
      <p class="muted">{t.weeklyReviewHint}</p>

      <h3>{t.quizTitle}</h3>
      {quiz.length === 0 ? <p class="muted quiz-empty">{t.noQuiz}</p> : <p class="muted">{t.quizHint}</p>}
      {quiz.map((q) => (
        <div class="quiz-item" key={q.unit.id}>
          <p>{t.quizQuestion} <strong>{q.unit.title}</strong>?</p>
          {revealed[q.unit.id]
            ? <blockquote class="why">{t.youWrote}: {q.log_text}</blockquote>
            : <button class="link" onClick={() => setRevealed((r) => ({ ...r, [q.unit.id]: true }))}>{t.reveal}</button>}
        </div>
      ))}

      <label>{t.qFinished}<textarea rows={2} name="finished" value={finished} onInput={(e) => setFinished((e.target as HTMLTextAreaElement).value)} /></label>
      <label>{t.qStuck}<textarea rows={2} name="stuck" value={stuck} onInput={(e) => setStuck((e.target as HTMLTextAreaElement).value)} /></label>
      <label>{t.qNext}<textarea rows={2} name="next" value={next} onInput={(e) => setNext((e.target as HTMLTextAreaElement).value)} /></label>
      <button class="primary" disabled={saving || (!finished.trim() && !stuck.trim() && !next.trim())} onClick={save}>{t.saveReview}</button>
    </section>
  );
}
