// Internationalization (i18n) support
// Provides translation utilities and locale management

export type Locale = "en" | "fr" | "es" | "ar" | "pt" | "sw" | "yo" | "ha"

export const SUPPORTED_LOCALES: { code: Locale; name: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "pt", name: "Português", dir: "ltr" },
  { code: "sw", name: "Kiswahili", dir: "ltr" },
  { code: "yo", name: "Yorùbá", dir: "ltr" },
  { code: "ha", name: "Hausa", dir: "ltr" },
]

type TranslationKey = string
type Translations = Record<TranslationKey, string>

const translations: Record<Locale, Translations> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.students": "Students",
    "nav.teachers": "Teachers",
    "nav.classes": "Classes",
    "nav.attendance": "Attendance",
    "nav.billing": "Billing",
    "nav.settings": "Settings",
    "nav.messages": "Messages",
    "nav.announcements": "Announcements",
    "nav.reports": "Reports",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.search": "Search...",
    "common.loading": "Loading...",
    "common.noResults": "No results found",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.next": "Next",
    "common.submit": "Submit",
    "common.close": "Close",
    "auth.login": "Log In",
    "auth.logout": "Log Out",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot Password?",
    "student.name": "Student Name",
    "student.admissionNumber": "Admission Number",
    "student.class": "Class",
    "student.status": "Status",
    "attendance.present": "Present",
    "attendance.absent": "Absent",
    "attendance.late": "Late",
    "attendance.excused": "Excused",
    "billing.invoice": "Invoice",
    "billing.paid": "Paid",
    "billing.pending": "Pending",
    "billing.overdue": "Overdue",
  },
  fr: {
    "nav.dashboard": "Tableau de bord",
    "nav.students": "Élèves",
    "nav.teachers": "Enseignants",
    "nav.classes": "Classes",
    "nav.attendance": "Présence",
    "nav.billing": "Facturation",
    "nav.settings": "Paramètres",
    "nav.messages": "Messages",
    "nav.announcements": "Annonces",
    "nav.reports": "Rapports",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.create": "Créer",
    "common.search": "Rechercher...",
    "common.loading": "Chargement...",
    "common.noResults": "Aucun résultat",
    "common.confirm": "Confirmer",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.submit": "Soumettre",
    "common.close": "Fermer",
    "auth.login": "Connexion",
    "auth.logout": "Déconnexion",
    "auth.email": "E-mail",
    "auth.password": "Mot de passe",
    "auth.forgotPassword": "Mot de passe oublié ?",
    "student.name": "Nom de l'élève",
    "student.admissionNumber": "Numéro d'admission",
    "student.class": "Classe",
    "student.status": "Statut",
    "attendance.present": "Présent",
    "attendance.absent": "Absent",
    "attendance.late": "En retard",
    "attendance.excused": "Excusé",
    "billing.invoice": "Facture",
    "billing.paid": "Payé",
    "billing.pending": "En attente",
    "billing.overdue": "En retard",
  },
  es: {
    "nav.dashboard": "Panel",
    "nav.students": "Estudiantes",
    "nav.teachers": "Profesores",
    "nav.classes": "Clases",
    "nav.attendance": "Asistencia",
    "nav.billing": "Facturación",
    "nav.settings": "Configuración",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.search": "Buscar...",
    "auth.login": "Iniciar sesión",
    "auth.logout": "Cerrar sesión",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.students": "الطلاب",
    "nav.teachers": "المعلمون",
    "nav.classes": "الفصول",
    "nav.attendance": "الحضور",
    "nav.billing": "الفواتير",
    "nav.settings": "الإعدادات",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.search": "بحث...",
    "auth.login": "تسجيل الدخول",
    "auth.logout": "تسجيل الخروج",
  },
  pt: {
    "nav.dashboard": "Painel",
    "nav.students": "Alunos",
    "nav.teachers": "Professores",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "auth.login": "Entrar",
  },
  sw: {
    "nav.dashboard": "Dashibodi",
    "nav.students": "Wanafunzi",
    "nav.teachers": "Walimu",
    "common.save": "Hifadhi",
    "common.cancel": "Ghairi",
    "auth.login": "Ingia",
  },
  yo: {
    "nav.dashboard": "Dasibodu",
    "nav.students": "Àwọn akẹ́kọ̀ọ́",
    "nav.teachers": "Àwọn olùkọ́",
    "common.save": "Fi pamọ́",
    "common.cancel": "Fagilee",
    "auth.login": "Wọlé",
  },
  ha: {
    "nav.dashboard": "Dashibod",
    "nav.students": "Ɗalibai",
    "nav.teachers": "Malamai",
    "common.save": "Ajiye",
    "common.cancel": "Soke",
    "auth.login": "Shiga",
  },
}

let currentLocale: Locale = "en"

export function setLocale(locale: Locale) {
  currentLocale = locale
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale)
    document.documentElement.lang = locale
    const localeInfo = SUPPORTED_LOCALES.find((l) => l.code === locale)
    if (localeInfo) document.documentElement.dir = localeInfo.dir
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("locale") as Locale | null
    if (stored && translations[stored]) return stored
  }
  return currentLocale
}

export function t(key: TranslationKey, params?: Record<string, string>): string {
  const locale = getLocale()
  let text = translations[locale]?.[key] || translations.en[key] || key

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v)
    })
  }

  return text
}

export function getDirection(): "ltr" | "rtl" {
  const locale = getLocale()
  return SUPPORTED_LOCALES.find((l) => l.code === locale)?.dir || "ltr"
}
