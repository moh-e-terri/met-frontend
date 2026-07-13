export const ADMIN_HEADER_HEIGHT = 65;

export const ADMIN_NAVBAR_Z_INDEX = 40;
export const ADMIN_SIDEBAR_Z_INDEX = 60;
export const ADMIN_OVERLAY_Z_INDEX = 50;

export const adminLayoutVars = "[--admin-header-height:65px]" as const;

export const adminHeaderHeightClass = "h-[var(--admin-header-height)]";
export const adminSidebarTopClass = "top-0";
export const adminSidebarHeightClass = "h-dvh";
export const adminSidebarLayerClass =
  "shadow-[-12px_0_40px_rgba(15,23,42,0.08)]";
export const adminOverlayTopClass = "inset-0 h-dvh";
