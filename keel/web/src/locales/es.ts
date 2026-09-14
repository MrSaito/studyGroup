// Spanish — machine draft (session 6), pending native review.
import type { Strings } from "../i18n.ts";
const t: Partial<Strings> = {
  tagline: "Una pequeña cosa que hacer hoy.", // draft
  onboardGoal: "¿Hacia qué estás trabajando?", // draft
  onboardGoalHint: "Una línea. Es tu «porqué»: solo lo verás cuando vuelvas después de una pausa.", // draft
  onboardPlan: "Elige un plan", // draft
  onboardPlanHint: "Pega una hoja de ruta en Markdown o un JSON de plan, o empieza con un plan incluido.", // draft
  useRoadmap: "Usar la hoja de ruta de ingeniero de IA (36 semanas)", // draft
  useSample: "Usar el plan de ejemplo (2 semanas)", // draft
  loading: "Cargando…", // draft
  templateLoadFail: "No se pudo cargar ese plan. Revisa tu conexión e inténtalo de nuevo.", // draft
  moreNotes: "…y {n} notas más", // draft
  importPlan: "Importar este plan", // draft
  onboardAvail: "¿Cuándo vas a trabajar en ello?", // draft
  minutesPerDay: "Minutos al día", // draft
  onboardIntention: "Tu señal", // draft
  intentionHint: "Después de [algo que ya haces], en [lugar], abriré Keel.", // draft
  intentionAfter: "Después de…", // draft
  intentionPlace: "En…", // draft
  startPlan: "Empezar el plan", // draft
  today: "Hoy", // draft
  restDay: "Día de descanso", // draft
  restHint: "Nada que hacer. Vas según lo previsto.", // draft
  markRest: "Tomar el día de descanso", // draft
  doneForToday: "Listo por hoy.", // draft
  noSessionToday: "Nada previsto para hoy.", // draft
  nextUp: "Siguiente", // draft
  start: "Empezar", // draft
  notToday: "Hoy no", // draft
  pushTomorrow: "Pasar a mañana", // draft
  swapReview: "Hacer un repaso de 10 minutos en su lugar", // draft
  cancel: "Cancelar", // draft
  learn: "Aprender", // draft
  do: "Hacer", // draft
  tip: "Consejo", // draft
  deliverable: "Entregable", // draft
  checkpoint: "Punto de control", // draft
  logLabel: "Tres líneas sobre lo que hiciste", // draft
  done: "Hecho", // draft
  back: "Atrás", // draft
  progress: "Progreso", // draft
  finishBy: "Terminar el", // draft
  consistency: "Constancia", // draft
  ofLast28: "de las sesiones previstas en los últimos 28 días", // draft
  stage: "Etapa", // draft
  week: "Semana", // draft
  returnTitle: "¿Listo para una reentrada de 10 minutos?", // draft
  returnHint: "Tu plan está justo donde lo dejaste.", // draft
  replanTitle: "¿Quieres aligerar las próximas dos semanas?", // draft
  replanHint: "Unidades a la mitad durante dos semanas y luego vuelta a lo normal.", // draft
  replanYes: "Sí, reducir a la mitad las próximas dos semanas", // draft
  replanNo: "Mantener el plan como está", // draft
  archiveTitle: "Tu plan sigue aquí.", // draft
  archiveHint: "Reinicia desde el principio de esta etapa o guárdalo.", // draft
  archiveRestart: "Reiniciar esta etapa", // draft
  archiveAway: "Guardarlo", // draft
  settings: "Ajustes", // draft
  language: "Idioma", // draft
  exportData: "Exportar mis datos", // draft
  resetApp: "Borrar plan e historial", // draft
  resetConfirm: "Esto borra todo en este dispositivo. ¿Continuar?", // draft
  version: "Versión", // draft
  units: "unidades", // draft
  min: "min", // draft
  timerStop: "Parar temporizador", // draft
  timerGo: "Temporizador", // draft
  planComplete: "Plan completado.", // draft
  planCompleteHint: "Todas las unidades hechas. Empieza un plan nuevo desde Ajustes cuando quieras.", // draft
  invalidPlan: "Ese plan no se importó:", // draft
  storageFail: "No se pudo guardar en este dispositivo. El almacenamiento puede estar lleno o bloqueado en modo privado.", // draft
  importFile: "…o elige un archivo (.md o .json)", // draft
  plan: "Plan", // draft
  typeLearn: "Aprender", // draft
  typeBuild: "Construir", // draft
  typeReview: "Repaso", // draft
  typeRest: "Descanso", // draft
  skipUnit: "Saltar esta unidad", // draft
  skipReason: "¿Por qué la saltas?", // draft
  skipHint: "No volverá a mostrarse. Saltar no cuenta como sesión.", // draft
  skipConfirm: "Saltar", // draft
  skipped: "Saltada", // draft
  weeklyReview: "Repaso semanal", // draft
  weeklyReviewHint: "Cinco minutos: qué se quedó y qué no.", // draft
  reviewedThisWeek: "Repaso hecho esta semana", // draft
  quizTitle: "De memoria", // draft
  quizHint: "Antes de revelar, di en voz alta lo que recuerdas.", // draft
  quizQuestion: "¿Qué recuerdas de", // draft
  reveal: "Mostrar lo que escribí", // draft
  youWrote: "Escribiste", // draft
  noQuiz: "Aún no hay nada lo bastante antiguo: tus notas vuelven aquí una semana después de escribirlas.", // draft
  qFinished: "¿Qué terminaste esta semana?", // draft
  qStuck: "¿Dónde te atascaste?", // draft
  qNext: "¿Cuál es la única cosa para la próxima semana?", // draft
  saveReview: "Guardar repaso", // draft
  doAnother: "Hacer otra unidad hoy", // draft
  details: "Detalles", // draft
  doneOn: "Hecha el", // draft
  plannedFor: "Prevista para", // draft
  skippedBecause: "Saltada:", // draft
  yourLog: "Tu registro", // draft
  minutesLogged: "min registrados", // draft
  thisWeek: "Esta semana", // draft
  sessions: "sesiones", // draft
  workingDays: "Días de trabajo", // draft
  yourCue: "Tu señal", // draft
  saveChanges: "Guardar cambios", // draft
  saved: "Guardado.", // draft
  startNewPlan: "Empezar un plan nuevo", // draft
  restoreBackup: "Restaurar desde un archivo de copia", // draft
  restoreConfirm: "¿Reemplazar todo en este dispositivo con esta copia?", // draft
  restoreFail: "Ese archivo no es una copia de seguridad de Keel.", // draft
  restored: "Copia restaurada.", // draft
  translationDraft: "Esta traducción es un borrador. Dinos qué suena mal.", // draft
  backupSync: "Copia de seguridad y sincronización", // draft
  syncSoon: "El inicio de sesión y la sincronización entre dispositivos llegan en la próxima versión.", // draft
  syncHint: "Opcional. Inicia sesión para guardar tu plan e historial y usar Keel en otro teléfono. Nada sale de este dispositivo hasta que lo hagas.", // draft
  email: "Correo", // draft
  sendCode: "Enviarme un código", // draft
  codeLabel: "El código de 6 dígitos del correo", // draft
  verify: "Verificar", // draft
  signInFail: "No se pudo enviar el código:", // draft
  codeFail: "Ese código no funcionó. Revisa el correo e inténtalo de nuevo.", // draft
  offlineHint: "Sin conexión ahora mismo. Inténtalo cuando estés en línea.", // draft
  lastSynced: "Última sincronización", // draft
  syncing: "Sincronizando…", // draft
  syncOffline: "Sin conexión: los cambios se sincronizarán cuando vuelvas.", // draft
  syncError: "La sincronización tuvo un problema; se reintentará.", // draft
  syncReauth: "Inicia sesión de nuevo para seguir sincronizando. No se ha perdido nada.", // draft
  syncNow: "Sincronizar ahora", // draft
  signOut: "Cerrar sesión", // draft
  signOutKeep: "Sesión cerrada. Tu plan se queda en este dispositivo.", // draft
  haveAccount: "Ya uso Keel en otro teléfono", // draft
  reminders: "Recordatorios", // draft
  remindersHint: "Un recordatorio a la hora de tu señal y otro 90 minutos después con una opción de 10 minutos. Nunca más de dos. Se respetan las horas de silencio.", // draft
  remindAt: "Recordarme a las", // draft
  quietFrom: "Silencio desde", // draft
  quietTo: "hasta", // draft
  remindersOn: "Activar recordatorios", // draft
  remindersOff: "Desactivar recordatorios", // draft
  pushDenied: "Las notificaciones de Keel están bloqueadas en los ajustes del navegador.", // draft
  pushUnsupported: "Los recordatorios necesitan Keel instalado en la pantalla de inicio (Añadir a pantalla de inicio y volver a abrir).", // draft
  deleteAccount: "Eliminar mi cuenta", // draft
  deleteAccountConfirm: "Esto elimina tu cuenta y todo lo sincronizado con ella. La copia local también se elimina. ¿Continuar?", // draft
};
export default t;
