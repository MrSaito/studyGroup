// Bundled plan templates. Both are the engine's own Markdown fixtures
// (engine/examples — one source, A1). The 2-week sample is tiny and inlined.
// The 36-week roadmap (~110 KB) is a lazy Vite chunk: the entry bundle stays
// inside its 80 KB budget and a learner who pastes their own plan never
// downloads it. The chunk lands in dist/assets and is precached by the
// service worker, so onboarding with it works offline too.
//
// `plans/<id>.json` at the repo root is the committed output of the same
// import; engine/verify.sh asserts the two never drift.
import { importMarkdown, type Plan } from "@keel/engine";
import sampleMd from "@keel/examples/sample-plan.md?raw";

export interface Template {
  id: string;
  /** Returns a parsed, validated plan. Rejects on network failure (chunk not cached). */
  load: () => Promise<Plan>;
}

export const TEMPLATES: Record<"sample" | "ai-engineer-36w", Template> = {
  "sample": {
    id: "sample",
    load: async () => importMarkdown(sampleMd),
  },
  "ai-engineer-36w": {
    id: "ai-engineer-36w",
    load: () => import("@keel/examples/ai-engineer-36w.md?raw").then((m) => importMarkdown(m.default, { id: "ai-engineer-36w", source: "template" })),
  },
};
