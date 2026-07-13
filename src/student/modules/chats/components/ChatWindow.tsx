import { useState, type FormEvent } from "react";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { ChatMessage, ChatThread } from "@/core/api/chat";

interface ChatWindowProps {
  thread: ChatThread;
  messages: ChatMessage[];
  onSendMessage?: (content: string) => void | Promise<unknown>;
  isSending?: boolean;
  isLoadingMessages?: boolean;
}

export const ChatWindow = ({
  thread,
  messages,
  onSendMessage,
  isSending = false,
  isLoadingMessages = false,
}: ChatWindowProps) => {
  const [draft, setDraft] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSending || !onSendMessage) return;

    await onSendMessage(trimmed);
    setDraft("");
  };

  return (
    <section className="flex min-h-[520px] min-w-0 flex-1 flex-col border-[#e2e8f0] xl:border-l">
      <header
        className="flex items-center justify-between gap-3 border-b border-[#e2e8f0] px-4 py-3"
        dir="rtl"
      >
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={thread.avatar}
            alt=""
            className="size-10 shrink-0 rounded-full"
            aria-hidden
          />
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-bold text-[#0f172a]">
              {thread.name}
            </p>
            {thread.online && (
              <p className="text-xs text-[#22c55e]">متصل الآن</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1" dir="ltr">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
            aria-label="معلومات"
          >
            <StudentIcon
              src="/images/student/icon-info.svg"
              className="size-4"
            />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
            aria-label="مكالمة فيديو"
          >
            <StudentIcon
              src="/images/student/icon-video.svg"
              className="size-4"
            />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
            aria-label="مكالمة صوتية"
          >
            <StudentIcon
              src="/images/student/icon-phone.svg"
              className="size-4"
            />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8fafc] p-4" dir="rtl">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`h-12 animate-pulse rounded-2xl bg-white ${index % 2 === 0 ? "ml-auto w-2/3" : "mr-auto w-2/3"}`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[280px] items-center justify-center">
            <p className="text-sm text-[#64748b]">ابدأ المحادثة بإرسال رسالة.</p>
          </div>
        ) : (
          messages.map((message) => {
            if (message.type === "divider") {
              return (
                <div key={message.id} className="flex justify-center">
                  <span className="rounded-full bg-white px-4 py-1.5 text-xs text-[#64748b] shadow-sm">
                    {message.text}
                  </span>
                </div>
              );
            }

            if (message.outgoing) {
              return (
                <div key={message.id} className="flex justify-start" dir="ltr">
                  <div className="max-w-[75%]">
                    <div className="rounded-2xl rounded-bl-md bg-[#f5a524] px-4 py-2.5 text-right text-sm leading-6 text-white">
                      {message.text}
                    </div>
                    {message.time && (
                      <p className="mt-1 text-left text-[10px] text-[#94a3b8]">
                        {message.time}
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className="flex items-end justify-start gap-2"
                dir="rtl"
              >
                {message.showAvatar ? (
                  <img
                    src={thread.avatar}
                    alt=""
                    className="size-8 shrink-0 rounded-full"
                    aria-hidden
                  />
                ) : (
                  <span className="size-8 shrink-0" aria-hidden />
                )}
                <div className="max-w-[75%]">
                  <div className="rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-sm leading-6 text-[#475569] shadow-sm">
                    {message.text}
                  </div>
                  {message.time && (
                    <p className="mt-1 text-right text-[10px] text-[#94a3b8]">
                      {message.time}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form className="border-t border-[#e2e8f0] p-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3" dir="ltr">
          <button
            type="submit"
            disabled={isSending || !draft.trim() || !onSendMessage}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f5a524] text-white shadow-[0px_8px_16px_-4px_rgba(245,165,36,0.35)] transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="إرسال"
          >
            <StudentIcon
              src="/images/student/icon-send.svg"
              className="size-4 text-white"
            />
          </button>

          <label className="relative min-w-0 flex-1">
            <span className="sr-only">اكتب رسالتك هنا</span>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="اكتب رسالتك هنا..."
              disabled={isSending || !onSendMessage}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-3 pl-4 pr-28 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white disabled:opacity-60"
              dir="rtl"
            />
            <div
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1"
              dir="rtl"
            >
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-white hover:text-[#64748b]"
                aria-label="إيموجي"
              >
                <StudentIcon
                  src="/images/student/icon-emoji.svg"
                  className="size-4"
                />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-white hover:text-[#64748b]"
                aria-label="صورة"
              >
                <StudentIcon
                  src="/images/student/icon-image.svg"
                  className="size-4"
                />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-white hover:text-[#64748b]"
                aria-label="مرفق"
              >
                <StudentIcon
                  src="/images/student/icon-attach.svg"
                  className="size-4"
                />
              </button>
            </div>
          </label>
        </div>
      </form>
    </section>
  );
};
