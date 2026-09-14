// Urdu — machine draft, pending native review (A6).
import type { Strings } from "../i18n.ts";
const t: Partial<Strings> = {
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
  doAnother: "آج ایک اور یونٹ کریں", // draft
  details: "تفصیلات", // draft
  doneOn: "مکمل ہوا", // draft
  plannedFor: "طے شدہ", // draft
  skippedBecause: "چھوڑا گیا:", // draft
  yourLog: "آپ کا لاگ", // draft
  minutesLogged: "منٹ درج", // draft
  thisWeek: "اس ہفتے", // draft
  sessions: "سیشن", // draft
  workingDays: "کام کے دن", // draft
  yourCue: "آپ کا اشارہ", // draft
  saveChanges: "تبدیلیاں محفوظ کریں", // draft
  saved: "محفوظ ہو گیا۔", // draft
  startNewPlan: "نیا منصوبہ شروع کریں", // draft
  restoreBackup: "بیک اپ فائل سے بحال کریں", // draft
  restoreConfirm: "اس آلے پر سب کچھ اس بیک اپ سے بدل دیں؟", // draft
  restoreFail: "یہ فائل Keel بیک اپ نہیں ہے۔", // draft
  restored: "بیک اپ بحال ہو گیا۔", // draft
  translationDraft: "یہ ترجمہ ابھی مسودہ ہے۔ جو غلط لگے ہمیں بتائیں۔", // draft
};
export default t;
