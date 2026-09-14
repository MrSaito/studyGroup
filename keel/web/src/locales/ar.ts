// Arabic — machine draft (session 6), pending native review.
import type { Strings } from "../i18n.ts";
const t: Partial<Strings> = {
  tagline: "شيء صغير واحد تفعله اليوم.", // draft
  onboardGoal: "ما الذي تعمل من أجله؟", // draft
  onboardGoalHint: "سطر واحد. هذا هو \\\"لماذا\\\" الخاص بك — لن تراه إلا عندما تعود بعد انقطاع.", // draft
  onboardPlan: "اختر خطة", // draft
  onboardPlanHint: "الصق خارطة طريق بصيغة Markdown أو JSON، أو ابدأ بخطة مضمّنة.", // draft
  useRoadmap: "استخدم خارطة طريق مهندس الذكاء الاصطناعي (36 أسبوعاً)", // draft
  useSample: "استخدم الخطة النموذجية (أسبوعان)", // draft
  loading: "جارٍ التحميل…", // draft
  templateLoadFail: "تعذّر تحميل هذه الخطة. تحقق من الاتصال وحاول مجدداً.", // draft
  moreNotes: "…و{n} ملاحظات أخرى", // draft
  importPlan: "استورد هذه الخطة", // draft
  onboardAvail: "متى ستعمل عليها؟", // draft
  minutesPerDay: "دقائق في اليوم", // draft
  onboardIntention: "إشارتك", // draft
  intentionHint: "بعد [شيء تفعله أصلاً]، في [مكان]، سأفتح Keel.", // draft
  intentionAfter: "بعد…", // draft
  intentionPlace: "في…", // draft
  startPlan: "ابدأ الخطة", // draft
  today: "اليوم", // draft
  restDay: "يوم راحة", // draft
  restHint: "لا شيء لتفعله. أنت على الجدول.", // draft
  markRest: "خذ يوم الراحة", // draft
  doneForToday: "انتهى عمل اليوم.", // draft
  noSessionToday: "لا شيء مخطط اليوم.", // draft
  nextUp: "التالي", // draft
  start: "ابدأ", // draft
  notToday: "ليس اليوم", // draft
  pushTomorrow: "أجّل إلى الغد", // draft
  swapReview: "مراجعة 10 دقائق بدلاً من ذلك", // draft
  cancel: "إلغاء", // draft
  learn: "تعلّم", // draft
  do: "نفّذ", // draft
  tip: "نصيحة", // draft
  deliverable: "المخرَج", // draft
  checkpoint: "نقطة تحقق", // draft
  logLabel: "ثلاثة أسطر عمّا فعلته", // draft
  done: "تم", // draft
  back: "رجوع", // draft
  progress: "التقدّم", // draft
  finishBy: "الانتهاء بحلول", // draft
  consistency: "الانتظام", // draft
  ofLast28: "من الجلسات المخططة في آخر 28 يوماً", // draft
  stage: "المرحلة", // draft
  week: "الأسبوع", // draft
  returnTitle: "مستعد لعودة من 10 دقائق؟", // draft
  returnHint: "خطتك حيث تركتها تماماً.", // draft
  replanTitle: "أتريد تخفيف الأسبوعين القادمين؟", // draft
  replanHint: "وحدات بنصف الحجم لأسبوعين، ثم العودة إلى المعتاد.", // draft
  replanYes: "نعم، انصف الأسبوعين القادمين", // draft
  replanNo: "أبقِ الخطة كما هي", // draft
  archiveTitle: "خطتك ما زالت هنا.", // draft
  archiveHint: "أعد البدء من أول هذه المرحلة، أو ضعها جانباً.", // draft
  archiveRestart: "أعد هذه المرحلة", // draft
  archiveAway: "ضعها جانباً", // draft
  settings: "الإعدادات", // draft
  language: "اللغة", // draft
  exportData: "صدّر بياناتي", // draft
  resetApp: "احذف الخطة والسجل", // draft
  resetConfirm: "سيحذف هذا كل شيء على هذا الجهاز. متابعة؟", // draft
  version: "الإصدار", // draft
  units: "وحدات", // draft
  min: "د", // draft
  timerStop: "أوقف المؤقت", // draft
  timerGo: "المؤقت", // draft
  planComplete: "اكتملت الخطة.", // draft
  planCompleteHint: "كل الوحدات منجزة. ابدأ خطة جديدة من الإعدادات متى شئت.", // draft
  invalidPlan: "لم يتم استيراد هذه الخطة:", // draft
  storageFail: "تعذّر الحفظ على هذا الجهاز. قد تكون الذاكرة ممتلئة أو محظورة في الوضع الخاص.", // draft
  importFile: "…أو اختر ملفاً (.md أو .json)", // draft
  plan: "الخطة", // draft
  typeLearn: "تعلّم", // draft
  typeBuild: "بناء", // draft
  typeReview: "مراجعة", // draft
  typeRest: "راحة", // draft
  skipUnit: "تخطَّ هذه الوحدة", // draft
  skipReason: "لماذا تتخطاها؟", // draft
  skipHint: "لن تُعرض مجدداً. التخطي ليس جلسة.", // draft
  skipConfirm: "تخطَّ", // draft
  skipped: "تم التخطي", // draft
  weeklyReview: "المراجعة الأسبوعية", // draft
  weeklyReviewHint: "خمس دقائق: ما الذي ثبت، وما الذي لم يثبت.", // draft
  reviewedThisWeek: "تمت المراجعة هذا الأسبوع", // draft
  quizTitle: "من الذاكرة", // draft
  quizHint: "قبل أن تكشف، قل بصوت عالٍ ما تتذكره.", // draft
  quizQuestion: "ماذا تتذكر من", // draft
  reveal: "أظهر ما كتبته", // draft
  youWrote: "كتبتَ", // draft
  noQuiz: "لا شيء قديم بما يكفي للاختبار بعد — تعود ملاحظاتك إلى هنا بعد أسبوع من كتابتها.", // draft
  qFinished: "ماذا أنهيت هذا الأسبوع؟", // draft
  qStuck: "أين تعثّرت؟", // draft
  qNext: "ما الشيء الواحد للأسبوع القادم؟", // draft
  saveReview: "احفظ المراجعة", // draft
  doAnother: "نفّذ وحدة أخرى اليوم", // draft
  details: "التفاصيل", // draft
  doneOn: "أُنجزت في", // draft
  plannedFor: "مخطط لها في", // draft
  skippedBecause: "تم التخطي:", // draft
  yourLog: "سجلّك", // draft
  minutesLogged: "دقيقة مسجّلة", // draft
  thisWeek: "هذا الأسبوع", // draft
  sessions: "جلسات", // draft
  workingDays: "أيام العمل", // draft
  yourCue: "إشارتك", // draft
  saveChanges: "احفظ التغييرات", // draft
  saved: "تم الحفظ.", // draft
  startNewPlan: "ابدأ خطة جديدة", // draft
  restoreBackup: "استعد من ملف نسخة احتياطية", // draft
  restoreConfirm: "أتستبدل كل شيء على هذا الجهاز بهذه النسخة؟", // draft
  restoreFail: "هذا الملف ليس نسخة احتياطية من Keel.", // draft
  restored: "تمت استعادة النسخة الاحتياطية.", // draft
  translationDraft: "هذه الترجمة مسودة. أخبرنا بما يبدو خاطئاً.", // draft
  backupSync: "النسخ الاحتياطي والمزامنة", // draft
  syncSoon: "تسجيل الدخول والمزامنة بين الأجهزة قادمان في الإصدار التالي.", // draft
  syncHint: "اختياري. سجّل الدخول لحفظ خطتك وسجلّك واستخدام Keel على هاتف آخر. لا يغادر شيء هذا الجهاز حتى تفعل.", // draft
  email: "البريد الإلكتروني", // draft
  sendCode: "أرسل لي رمزاً", // draft
  codeLabel: "الرمز المكوّن من 6 أرقام من البريد", // draft
  verify: "تحقق", // draft
  signInFail: "تعذّر إرسال الرمز:", // draft
  codeFail: "هذا الرمز لم ينجح. تحقق من البريد وحاول مجدداً.", // draft
  offlineHint: "لا اتصال الآن. حاول مجدداً عندما تكون متصلاً.", // draft
  lastSynced: "آخر مزامنة", // draft
  syncing: "جارٍ المزامنة…", // draft
  syncOffline: "غير متصل — ستتم مزامنة التغييرات عند عودتك.", // draft
  syncError: "واجهت المزامنة مشكلة؛ ستعيد المحاولة.", // draft
  syncReauth: "سجّل الدخول مجدداً لمتابعة المزامنة. لم يُفقد شيء.", // draft
  syncNow: "زامن الآن", // draft
  signOut: "تسجيل الخروج", // draft
  signOutKeep: "تم تسجيل الخروج. تبقى خطتك على هذا الجهاز.", // draft
  haveAccount: "أستخدم Keel بالفعل على هاتف آخر", // draft
  reminders: "التذكيرات", // draft
  remindersHint: "تذكير واحد في وقت إشارتك، وثانٍ بعد 90 دقيقة مع خيار 10 دقائق. لا أكثر من اثنين أبداً. مع احترام ساعات الهدوء.", // draft
  remindAt: "ذكّرني في", // draft
  quietFrom: "هدوء من", // draft
  quietTo: "حتى", // draft
  remindersOn: "تفعيل التذكيرات", // draft
  remindersOff: "إيقاف التذكيرات", // draft
  pushDenied: "الإشعارات محظورة لـ Keel في إعدادات المتصفح.", // draft
  pushUnsupported: "تحتاج التذكيرات إلى تثبيت Keel على الشاشة الرئيسية (أضف إلى الشاشة الرئيسية ثم أعد الفتح).", // draft
  deleteAccount: "احذف حسابي", // draft
  deleteAccountConfirm: "سيحذف هذا حسابك وكل ما تمت مزامنته معه. وتُحذف نسختك المحلية أيضاً. متابعة؟", // draft
  linkOrCode: "تحقق من بريدك. اضغط على الرابط فيه، أو اكتب الرمز هنا إن وُجد.", // draft
};
export default t;
