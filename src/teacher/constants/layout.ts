export const TEACHER_HEADER_HEIGHT = 65;

export const TEACHER_NAVBAR_Z_INDEX = 40;
export const TEACHER_SIDEBAR_Z_INDEX = 60;
export const TEACHER_OVERLAY_Z_INDEX = 50;

export const teacherLayoutVars = "[--teacher-header-height:65px]" as const;

export const teacherHeaderHeightClass = "h-[var(--teacher-header-height)]";
export const teacherSidebarTopClass = "top-0";
export const teacherSidebarHeightClass = "h-dvh";
export const teacherSidebarLayerClass =
  "shadow-[-12px_0_40px_rgba(15,23,42,0.08)]";
export const teacherOverlayTopClass = "inset-0 h-dvh";
