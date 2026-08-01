import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

const PENDING_CHAT_USER_KEY = "met_pending_chat_user";
const PENDING_CHAT_NAME_KEY = "met_pending_chat_name";
const PENDING_CHAT_COURSE_KEY = "met_pending_chat_course";

interface StartChatButtonProps {
  /** Auth user id of the other person */
  userId: string;
  name?: string;
  /** Base chats path for current role, e.g. /admin/chats */
  chatsPath: string;
  courseId?: string;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}

function rememberPendingChat(userId: string, name?: string, courseId?: string) {
  try {
    sessionStorage.setItem(PENDING_CHAT_USER_KEY, userId);
    if (name) sessionStorage.setItem(PENDING_CHAT_NAME_KEY, name);
    else sessionStorage.removeItem(PENDING_CHAT_NAME_KEY);
    if (courseId) sessionStorage.setItem(PENDING_CHAT_COURSE_KEY, courseId);
    else sessionStorage.removeItem(PENDING_CHAT_COURSE_KEY);
  } catch {
    // ignore
  }
}

export const StartChatButton = ({
  userId,
  name,
  chatsPath,
  courseId,
  className,
  label = "محادثة",
  iconOnly = true,
}: StartChatButtonProps) => {
  if (!userId) return null;

  const params = new URLSearchParams({ userId });
  if (name) params.set("name", name);
  if (courseId) params.set("courseId", courseId);

  return (
    <Link
      to={`${chatsPath}?${params.toString()}`}
      onClick={(event) => {
        event.stopPropagation();
        rememberPendingChat(userId, name, courseId);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#eff6ff] hover:text-[#3b82f6]",
        iconOnly ? "size-8" : "px-3 py-2 text-xs font-bold",
        className,
      )}
      aria-label={`محادثة مع ${name || "المستخدم"}`}
      title={`محادثة مع ${name || "المستخدم"}`}
    >
      <span
        aria-hidden
        className="inline-block size-4 bg-current mask-contain mask-center mask-no-repeat"
        style={{
          WebkitMaskImage: "url(/images/student/icon-chat.svg)",
          maskImage: "url(/images/student/icon-chat.svg)",
        }}
      />
      {!iconOnly ? <span>{label}</span> : null}
    </Link>
  );
};
