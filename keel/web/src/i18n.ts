// String tables from the first commit (PATTERNS §7). Urdu is machine-drafted
// and flagged for native review in HANDOVER.md.
export type Locale = "en" | "ur";
export const RTL: Record<Locale, boolean> = { en: false, ur: true };

const en = {
  appName: "Keel",
  tagline: "One small thing to do today.",
  onboardGoal: "What are you working toward?",
  onboardGoalHint: "One line. This is your \"why\" — you'll see it only when you come back after a break.",
  onboardPlan: "Choose a plan",
  onboardPlanHint: "Paste a Markdown roadmap or plan JSON, or start with a bundled plan.",
  useRoadmap: "Use the AI Engineer roadmap (36 weeks)",
  useSample: "Use the sample plan (2 weeks)",
  loading: "Loading…",
  templateLoadFail: "Couldn't load that plan. Check your connection and try again.",
  moreNotes: "…and {n} more notes",
  importPlan: "Import this plan",
  onboardAvail: "When will you work on it?",
  minutesPerDay: "Minutes per day",
  onboardIntention: "Your cue",
  intentionHint: "After [something you already do], at [place], I will open Keel.",
  intentionAfter: "After…",
  intentionPlace: "At…",
  startPlan: "Start the plan",
  today: "Today",
  restDay: "Rest day",
  restHint: "Nothing to do. You're on schedule.",
  markRest: "Take the rest day",
  doneForToday: "Done for today.",
  noSessionToday: "Nothing planned today.",
  nextUp: "Next",
  start: "Start",
  notToday: "Not today",
  pushTomorrow: "Push to tomorrow",
  swapReview: "Do a 10‑minute review instead",
  cancel: "Cancel",
  learn: "Learn",
  do: "Do",
  tip: "Tip",
  deliverable: "Deliverable",
  checkpoint: "Checkpoint",
  logLabel: "Three lines on what you did",
  done: "Done",
  back: "Back",
  progress: "Progress",
  finishBy: "Finish by",
  consistency: "Consistency",
  ofLast28: "of planned sessions in the last 28 days",
  stage: "Stage",
  week: "Week",
  returnTitle: "Ready for a 10‑minute re‑entry?",
  returnHint: "Your plan is right where you left it.",
  replanTitle: "Want to make the next two weeks lighter?",
  replanHint: "Half‑size units for two weeks, then back to normal.",
  replanYes: "Yes, halve the next two weeks",
  replanNo: "Keep the plan as it is",
  archiveTitle: "Your plan is still here.",
  archiveHint: "Restart at the beginning of this stage, or put it away.",
  archiveRestart: "Restart this stage",
  archiveAway: "Put it away",
  settings: "Settings",
  language: "Language",
  exportData: "Export my data",
  resetApp: "Delete plan and history",
  resetConfirm: "This deletes everything on this device. Continue?",
  version: "Version",
  units: "units",
  min: "min",
  timerStop: "Stop timer",
  timerGo: "Timer",
  planComplete: "Plan complete.",
  planCompleteHint: "Every unit done. Import a new plan from Settings whenever you're ready.",
  invalidPlan: "That plan didn't import:",
  storageFail: "Couldn't save on this device. Storage may be full or blocked in private mode.",
  importFile: "…or choose a file (.md or .json)",
  plan: "Plan",
  typeLearn: "Learn",
  typeBuild: "Build",
  typeReview: "Review",
  typeRest: "Rest",
  skipUnit: "Skip this unit",
  skipReason: "Why are you skipping it?",
  skipHint: "It won't be shown again. Skipping isn't a session.",
  skipConfirm: "Skip",
  skipped: "Skipped",
  weeklyReview: "Weekly review",
  weeklyReviewHint: "Five minutes: what stuck, what didn't.",
  reviewedThisWeek: "Reviewed this week",
  quizTitle: "From memory",
  quizHint: "Before you reveal, say out loud what you remember.",
  quizQuestion: "What do you remember from",
  reveal: "Show what I wrote",
  youWrote: "You wrote",
  noQuiz: "Nothing old enough to quiz yet — your notes come back here a week after you write them.",
  qFinished: "What did you finish this week?",
  qStuck: "Where did you get stuck?",
  qNext: "What's the one thing for next week?",
  saveReview: "Save review",
};
export type Strings = typeof en;

const ur: Strings = {
  ...en,
  tagline: "آج کے لیے ایک چھوٹا سا کام۔",
  onboardGoal: "آپ کس مقصد کے لیے کام کر رہے ہیں؟",
  onboardGoalHint: "ایک سطر۔ یہ آپ کا \"کیوں\" ہے — یہ آپ کو صرف وقفے کے بعد واپسی پر نظر آئے گا۔",
  onboardPlan: "منصوبہ چنیں",
  onboardPlanHint: "مارک ڈاؤن روڈ میپ یا JSON چسپاں کریں، یا شامل شدہ منصوبے سے شروع کریں۔",
  useRoadmap: "AI انجینئر روڈ میپ استعمال کریں (36 ہفتے)", // draft
  useSample: "نمونہ منصوبہ استعمال کریں (2 ہفتے)", // draft
  loading: "لوڈ ہو رہا ہے…", // draft
  templateLoadFail: "یہ منصوبہ لوڈ نہیں ہو سکا۔ کنکشن چیک کر کے دوبارہ کوشش کریں۔", // draft
  moreNotes: "…اور {n} مزید نوٹس", // draft
  importPlan: "یہ منصوبہ درآمد کریں",
  onboardAvail: "آپ اس پر کب کام کریں گے؟",
  minutesPerDay: "منٹ فی دن",
  onboardIntention: "آپ کا اشارہ",
  intentionHint: "[کسی معمول] کے بعد، [جگہ] پر، میں Keel کھولوں گا۔",
  intentionAfter: "کے بعد…",
  intentionPlace: "جگہ…",
  startPlan: "منصوبہ شروع کریں",
  today: "آج",
  restDay: "آرام کا دن",
  restHint: "کچھ کرنا نہیں۔ آپ شیڈول پر ہیں۔",
  markRest: "آرام کا دن لیں",
  doneForToday: "آج کا کام مکمل۔",
  noSessionToday: "آج کچھ طے نہیں۔",
  nextUp: "اگلا",
  start: "شروع کریں",
  notToday: "آج نہیں",
  pushTomorrow: "کل پر ڈالیں",
  swapReview: "اس کے بجائے 10 منٹ کا جائزہ",
  cancel: "منسوخ",
  learn: "سیکھیں",
  do: "کریں",
  tip: "مشورہ",
  deliverable: "نتیجہ",
  checkpoint: "چیک پوائنٹ",
  logLabel: "تین سطریں: آپ نے کیا کیا",
  done: "مکمل",
  back: "واپس",
  progress: "پیش رفت",
  finishBy: "تکمیل تک",
  consistency: "تسلسل",
  ofLast28: "پچھلے 28 دنوں کے طے شدہ سیشنز میں سے",
  stage: "مرحلہ",
  week: "ہفتہ",
  returnTitle: "10 منٹ کی واپسی کے لیے تیار؟",
  returnHint: "آپ کا منصوبہ وہیں ہے جہاں آپ نے چھوڑا تھا۔",
  replanTitle: "اگلے دو ہفتے ہلکے کر دیں؟",
  replanHint: "دو ہفتے آدھے یونٹ، پھر معمول کے مطابق۔",
  replanYes: "ہاں، اگلے دو ہفتے آدھے کریں",
  replanNo: "منصوبہ ویسا ہی رکھیں",
  archiveTitle: "آپ کا منصوبہ اب بھی یہاں ہے۔",
  archiveHint: "اس مرحلے کے آغاز سے دوبارہ شروع کریں، یا اسے رکھ دیں۔",
  archiveRestart: "یہ مرحلہ دوبارہ شروع کریں",
  archiveAway: "رکھ دیں",
  settings: "ترتیبات",
  language: "زبان",
  exportData: "میرا ڈیٹا برآمد کریں",
  resetApp: "منصوبہ اور تاریخ حذف کریں",
  resetConfirm: "یہ اس آلے پر سب کچھ حذف کر دے گا۔ جاری رکھیں؟",
  version: "ورژن",
  units: "یونٹس",
  min: "منٹ",
  timerStop: "ٹائمر روکیں",
  timerGo: "ٹائمر",
  planComplete: "منصوبہ مکمل۔",
  planCompleteHint: "ہر یونٹ مکمل۔ جب چاہیں ترتیبات سے نیا منصوبہ درآمد کریں۔",
  invalidPlan: "یہ منصوبہ درآمد نہیں ہوا:",
  storageFail: "اس آلے پر محفوظ نہیں ہو سکا۔ اسٹوریج بھر گئی ہو یا نجی موڈ میں بند ہو۔",
  importFile: "…یا فائل چنیں (.md یا .json)", // draft
  plan: "منصوبہ", // draft
  typeLearn: "سیکھیں", // draft
  typeBuild: "بنائیں", // draft
  typeReview: "جائزہ", // draft
  typeRest: "آرام", // draft
  skipUnit: "یہ یونٹ چھوڑ دیں", // draft
  skipReason: "آپ اسے کیوں چھوڑ رہے ہیں؟", // draft
  skipHint: "یہ دوبارہ نہیں دکھایا جائے گا۔ چھوڑنا سیشن نہیں ہے۔", // draft
  skipConfirm: "چھوڑ دیں", // draft
  skipped: "چھوڑ دیا", // draft
  weeklyReview: "ہفتہ وار جائزہ", // draft
  weeklyReviewHint: "پانچ منٹ: کیا یاد رہا، کیا نہیں۔", // draft
  reviewedThisWeek: "اس ہفتے جائزہ ہو گیا", // draft
  quizTitle: "یادداشت سے", // draft
  quizHint: "دکھانے سے پہلے، جو یاد ہے بلند آواز میں کہیں۔", // draft
  quizQuestion: "آپ کو کیا یاد ہے:", // draft
  reveal: "دکھائیں میں نے کیا لکھا", // draft
  youWrote: "آپ نے لکھا", // draft
  noQuiz: "ابھی کچھ اتنا پرانا نہیں کہ پوچھا جائے — آپ کے نوٹس لکھنے کے ایک ہفتے بعد یہاں واپس آتے ہیں۔", // draft
  qFinished: "اس ہفتے آپ نے کیا مکمل کیا؟", // draft
  qStuck: "آپ کہاں اٹکے؟", // draft
  qNext: "اگلے ہفتے کی ایک چیز کیا ہے؟", // draft
  saveReview: "جائزہ محفوظ کریں", // draft
};

export const STRINGS: Record<Locale, Strings> = { en, ur };
