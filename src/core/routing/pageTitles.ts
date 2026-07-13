export const SITE_NAME = "MET E-Academy";

export function formatDocumentTitle(pageTitle?: string): string {
  if (!pageTitle) return SITE_NAME;
  return `${pageTitle} | ${SITE_NAME}`;
}

export function getPageTitle(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";

  const exactTitles: Record<string, string> = {
    "/": "الرئيسية",
    "/signup": "إنشاء حساب",
    "/signin": "تسجيل الدخول",
    "/courses": "المقررات",
    "/student": "لوحة التحكم",
    "/student/payments": "وسائل الدفع",
    "/student/pay": "وسائل الدفع",
    "/student/community": "المجتمع",
    "/student/chats": "المحادثات",
    "/student/catalog": "استكشاف المقررات",
    "/student/my-courses": "دوراتي",
    "/student/settings": "إعدادات الحساب",
    "/teacher": "لوحة التحكم",
    "/teacher/payments": "المدفوعات",
    "/teacher/community": "المجتمع",
    "/teacher/chats": "المحادثات",
    "/teacher/settings": "إعدادات الحساب",
    "/admin": "لوحة التحكم",
    "/admin/courses": "المقررات",
    "/admin/lecturers": "المحاضرون",
    "/admin/students": "الطلاب",
    "/admin/financials": "الشؤون المالية",
    "/admin/settings": "إعدادات الحساب",
    "/admin/support": "الدعم الفني",
  };

  if (exactTitles[path]) return exactTitles[path];

  if (/^\/student\/courses\/[^/]+$/.test(path)) return "محتوى الدورة";
  if (/^\/student\/my-courses\/[^/]+\/quizzes$/.test(path)) return "الاختبارات";
  if (/^\/student\/my-courses\/[^/]+\/assignments$/.test(path)) return "التكليفات";
  if (/^\/student\/my-courses\/[^/]+$/.test(path)) return "لوحة الدورة";
  if (/^\/teacher\/courses\/[^/]+$/.test(path)) return "تحرير الدورة";
  if (/^\/courses\/[^/]+$/.test(path)) return "المقرر";

  return "صفحة غير موجودة";
}
