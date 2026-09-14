// Russian — machine draft (session 6), pending native review.
import type { Strings } from "../i18n.ts";
const t: Partial<Strings> = {
  tagline: "Одно небольшое дело на сегодня.", // draft
  onboardGoal: "К чему вы идёте?", // draft
  onboardGoalHint: "Одна строка. Это ваше «зачем» — вы увидите его, только когда вернётесь после перерыва.", // draft
  onboardPlan: "Выберите план", // draft
  onboardPlanHint: "Вставьте дорожную карту в Markdown или JSON плана, либо начните со встроенного плана.", // draft
  useRoadmap: "Дорожная карта AI-инженера (36 недель)", // draft
  useSample: "Пример плана (2 недели)", // draft
  loading: "Загрузка…", // draft
  templateLoadFail: "Не удалось загрузить план. Проверьте соединение и попробуйте снова.", // draft
  moreNotes: "…и ещё {n} замечаний", // draft
  importPlan: "Импортировать этот план", // draft
  onboardAvail: "Когда вы будете заниматься?", // draft
  minutesPerDay: "Минут в день", // draft
  onboardIntention: "Ваш сигнал", // draft
  intentionHint: "После [того, что вы уже делаете], в [месте], я открою Keel.", // draft
  intentionAfter: "После…", // draft
  intentionPlace: "Где…", // draft
  startPlan: "Начать план", // draft
  today: "Сегодня", // draft
  restDay: "День отдыха", // draft
  restHint: "Делать ничего не нужно. Вы идёте по графику.", // draft
  markRest: "Взять день отдыха", // draft
  doneForToday: "На сегодня всё.", // draft
  noSessionToday: "На сегодня ничего не запланировано.", // draft
  nextUp: "Далее", // draft
  start: "Начать", // draft
  notToday: "Не сегодня", // draft
  pushTomorrow: "Перенести на завтра", // draft
  swapReview: "Вместо этого — 10-минутное повторение", // draft
  cancel: "Отмена", // draft
  learn: "Изучить", // draft
  do: "Сделать", // draft
  tip: "Совет", // draft
  deliverable: "Результат", // draft
  checkpoint: "Контрольная точка", // draft
  logLabel: "Три строки о том, что вы сделали", // draft
  done: "Готово", // draft
  back: "Назад", // draft
  progress: "Прогресс", // draft
  finishBy: "Финиш к", // draft
  consistency: "Постоянство", // draft
  ofLast28: "запланированных занятий за последние 28 дней", // draft
  stage: "Этап", // draft
  week: "Неделя", // draft
  returnTitle: "Готовы к 10-минутному возвращению?", // draft
  returnHint: "Ваш план там же, где вы его оставили.", // draft
  replanTitle: "Сделать следующие две недели легче?", // draft
  replanHint: "Блоки вполовину меньше на две недели, потом как обычно.", // draft
  replanYes: "Да, уменьшить следующие две недели вдвое", // draft
  replanNo: "Оставить план как есть", // draft
  archiveTitle: "Ваш план всё ещё здесь.", // draft
  archiveHint: "Начните этот этап заново или отложите план.", // draft
  archiveRestart: "Начать этап заново", // draft
  archiveAway: "Отложить", // draft
  settings: "Настройки", // draft
  language: "Язык", // draft
  exportData: "Экспортировать мои данные", // draft
  resetApp: "Удалить план и историю", // draft
  resetConfirm: "Это удалит всё на этом устройстве. Продолжить?", // draft
  version: "Версия", // draft
  units: "блоков", // draft
  min: "мин", // draft
  timerStop: "Остановить таймер", // draft
  timerGo: "Таймер", // draft
  planComplete: "План завершён.", // draft
  planCompleteHint: "Все блоки выполнены. Начните новый план в настройках, когда будете готовы.", // draft
  invalidPlan: "Этот план не импортировался:", // draft
  storageFail: "Не удалось сохранить на этом устройстве. Хранилище может быть заполнено или заблокировано в приватном режиме.", // draft
  importFile: "…или выберите файл (.md или .json)", // draft
  plan: "План", // draft
  typeLearn: "Изучение", // draft
  typeBuild: "Практика", // draft
  typeReview: "Повторение", // draft
  typeRest: "Отдых", // draft
  skipUnit: "Пропустить блок", // draft
  skipReason: "Почему вы его пропускаете?", // draft
  skipHint: "Он больше не появится. Пропуск — не занятие.", // draft
  skipConfirm: "Пропустить", // draft
  skipped: "Пропущено", // draft
  weeklyReview: "Еженедельный обзор", // draft
  weeklyReviewHint: "Пять минут: что закрепилось, а что нет.", // draft
  reviewedThisWeek: "Обзор на этой неделе сделан", // draft
  quizTitle: "По памяти", // draft
  quizHint: "Прежде чем открыть, скажите вслух, что помните.", // draft
  quizQuestion: "Что вы помните из", // draft
  reveal: "Показать, что я написал", // draft
  youWrote: "Вы написали", // draft
  noQuiz: "Пока нечего спрашивать — заметки возвращаются сюда через неделю после записи.", // draft
  qFinished: "Что вы закончили на этой неделе?", // draft
  qStuck: "Где застряли?", // draft
  qNext: "Одно главное дело на следующую неделю?", // draft
  saveReview: "Сохранить обзор", // draft
  doAnother: "Сделать ещё один блок сегодня", // draft
  details: "Подробности", // draft
  doneOn: "Выполнено", // draft
  plannedFor: "Запланировано на", // draft
  skippedBecause: "Пропущено:", // draft
  yourLog: "Ваша запись", // draft
  minutesLogged: "мин записано", // draft
  thisWeek: "На этой неделе", // draft
  sessions: "занятий", // draft
  workingDays: "Рабочие дни", // draft
  yourCue: "Ваш сигнал", // draft
  saveChanges: "Сохранить изменения", // draft
  saved: "Сохранено.", // draft
  startNewPlan: "Начать новый план", // draft
  restoreBackup: "Восстановить из файла резервной копии", // draft
  restoreConfirm: "Заменить всё на этом устройстве этой копией?", // draft
  restoreFail: "Этот файл — не резервная копия Keel.", // draft
  restored: "Резервная копия восстановлена.", // draft
  translationDraft: "Это черновой перевод. Сообщите нам, что звучит неправильно.", // draft
};
export default t;
