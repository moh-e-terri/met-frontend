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
    "/student/payments": "محفظتي",
    "/student/pay": "محفظتي",
    "/student/community": "المجتمع",
    "/student/chats": "المحادثات",
    "/student/catalog": "استكشاف المقررات",
    "/student/my-courses": "دوراتي",
    "/student/settings": "إعدادات الحساب",
    "/teacher": "لوحة التحكم",
    "/teacher/payments": "الداشبورد المالي",
    "/teacher/community": "المجتمع",
    "/teacher/chats": "المحادثات",
    "/teacher/settings": "إعدادات الحساب",
    "/admin": "لوحة التحكم",
    "/admin/courses": "المقررات",
    "/admin/lecturers": "المحاضرون",
    "/admin/overview": "بيانات المنصة",
    "/admin/students": "الطلاب",
    "/admin/community": "المجتمع العام",
    "/admin/chats": "المحادثات",
    "/admin/financials": "الشؤون المالية",
    "/admin/settings": "إعدادات الحساب",
    "/admin/support": "الدعم الفني",
  };

  if (exactTitles[path]) return exactTitles[path];

  if (/^\/admin\/courses\/[^/]+\/community$/.test(path)) return "مجتمع المقرر";
  if (/^\/admin\/courses\/[^/]+$/.test(path)) return "تفاصيل المقرر";
  if (/^\/admin\/students\/[^/]+$/.test(path)) return "ملف الطالب";
  if (/^\/admin\/lecturers\/[^/]+$/.test(path)) return "ملف المدرّس";
  if (/^\/teacher\/students\/[^/]+$/.test(path)) return "ملف الطالب";
  if (/^\/teacher\/courses\/[^/]+\/community$/.test(path)) return "مجتمع المقرر";
  if (/^\/student\/courses\/[^/]+\/community$/.test(path)) return "مجتمع المقرر";
  if (/^\/student\/courses\/[^/]+$/.test(path)) return "محتوى الدورة";
  if (/^\/student\/my-courses\/[^/]+\/quizzes\/[^/]+$/.test(path))
    return "تقديم الاختبار";
  if (/^\/student\/my-courses\/[^/]+\/quizzes$/.test(path)) return "الاختبارات";
  if (/^\/student\/my-courses\/[^/]+\/assignments$/.test(path)) return "التكليفات";
  if (/^\/student\/my-courses\/[^/]+$/.test(path)) return "لوحة الدورة";
  if (/^\/teacher\/courses\/[^/]+$/.test(path)) return "تحرير الدورة";
  if (/^\/courses\/[^/]+$/.test(path)) return "المقرر";

  return "صفحة غير موجودة";
}
