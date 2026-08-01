import { useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => {
      const haystack = [thread.name, thread.preview, thread.role, thread.university]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [threads, query]);

  return (
    <aside
      className="flex h-auto max-h-[min(360px,45vh)] min-h-0 flex-col border-[#e2e8f0] bg-white xl:h-full xl:max-h-none xl:border-l"
      dir="rtl"
    >
      <div className="shrink-0 border-b border-[#e2e8f0] p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-right text-lg font-bold text-[#0f172a]">الدردشات</h2>
          <span className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#64748b]">
            {threads.length}
          </span>
        </div>
        <label className="relative block">
          <span className="sr-only">ابحث عن محادثة أو طالب</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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

      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {filteredThreads.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-[#94a3b8]">
            لا توجد نتائج مطابقة.
          </li>
        ) : (
          filteredThreads.map((thread) => {
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
                      className="size-11 rounded-full object-cover"
                      aria-hidden
                    />
                    {thread.online ? (
                      <span className="absolute bottom-0 left-0 size-2.5 rounded-full border-2 border-white bg-[#22c55e]" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0f172a]">{thread.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[#64748b]">{thread.preview}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] text-[#94a3b8]">{thread.time}</span>
                    {thread.unread ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-[#f5a524] text-[10px] font-bold text-white">
                        {thread.unread}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
};
