import { cn } from "@/shared/utils/cn";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { ChatThread } from "@/core/api/chat";

interface ChatsListPanelProps {
  threads: ChatThread[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const ChatsListPanel = ({
  threads,
  activeId,
  onSelect,
}: ChatsListPanelProps) => {
  return (
    <aside
      className="flex h-full min-h-[520px] flex-col border-[#e2e8f0] xl:border-l"
      dir="rtl"
    >
      <div className="border-b border-[#e2e8f0] p-4">
        <h2 className="mb-4 text-right text-lg font-bold text-[#0f172a]">
          الدردشات
        </h2>
        <label className="relative block">
          <span className="sr-only">ابحث عن محادثة أو طالب</span>
          <input
            type="search"
            placeholder="ابحث عن محادثة أو طالب"
            className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-4 pr-11 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white"
            dir="rtl"
          />
          <StudentIcon
            src="/images/student/icon-search.svg"
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
          />
        </label>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {threads.map((thread) => {
          const isActive = thread.id === activeId;

          return (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => onSelect(thread.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-r-4 px-4 py-3 text-right transition-colors",
                  isActive
                    ? "border-[#f5a524] bg-[#fff7ed]"
                    : "border-transparent hover:bg-[#f8fafc]",
                )}
              >
                <div className="relative shrink-0">
                  <img
                    src={thread.avatar}
                    alt=""
                    className="size-11 rounded-full"
                    aria-hidden
                  />
                  {thread.online && (
                    <span className="absolute bottom-0 left-0 size-2.5 rounded-full border-2 border-white bg-[#22c55e]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#0f172a]">
                    {thread.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#64748b]">
                    {thread.preview}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] text-[#94a3b8]">
                    {thread.time}
                  </span>
                  {thread.unread ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#f5a524] text-[10px] font-bold text-white">
                      {thread.unread}
                    </span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
