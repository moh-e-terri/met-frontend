/** ارتفاع navbar لوحة الطالب — يُستخدم في الهيدر والسايدبار معاً */
export const STUDENT_HEADER_HEIGHT = 65;

export const STUDENT_NAVBAR_Z_INDEX = 40;
export const STUDENT_SIDEBAR_Z_INDEX = 60;
export const STUDENT_OVERLAY_Z_INDEX = 50;
export const STUDENT_DROPDOWN_Z_INDEX = 70;

export const studentLayoutVars = "[--student-header-height:65px]" as const;

export const studentHeaderHeightClass = "h-[var(--student-header-height)]";

export const studentSidebarTopClass = "top-0";

export const studentSidebarHeightClass = "h-dvh";

export const studentSidebarLayerClass =
  "shadow-[-12px_0_40px_rgba(15,23,42,0.08)]";

export const studentOverlayTopClass = "inset-0 h-dvh";
