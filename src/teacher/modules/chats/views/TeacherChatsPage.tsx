import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import {
  chatQueryKeys,
  fetchChatMessages,
  fetchConversations,
  sendChatMessage,
} from "@/core/api/chat";
import { PageMotion } from "@/shared/motion";
import { ChatContactProfile } from "@/student/modules/chats/components/ChatContactProfile";
import { ChatWindow } from "@/student/modules/chats/components/ChatWindow";
import { ChatsListPanel } from "@/student/modules/chats/components/ChatsListPanel";

export const TeacherChatsPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState("");

  const conversationsQuery = useQuery({
    queryKey: chatQueryKeys.conversations,
    queryFn: () => fetchConversations(session?.userId),
  });

  const threads = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  );

  useEffect(() => {
    if (!activeId && threads.length > 0) {
      setActiveId(threads[0].id);
    }
  }, [activeId, threads]);

  const activeThread = threads.find((thread) => thread.id === activeId) ?? threads[0];

  const messagesQuery = useQuery({
    queryKey: chatQueryKeys.messages(activeThread?.id ?? ""),
    queryFn: () => fetchChatMessages(activeThread!.id, session?.userId),
    enabled: Boolean(activeThread?.id),
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeThread) return;
      await sendChatMessage(activeThread.id, content);
      return activeThread.id;
    },
    onSuccess: (conversationId) => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.messages(conversationId) });
      }
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
    },
  });

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px]">
      {conversationsQuery.isError ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {conversationsQuery.error instanceof Error
            ? conversationsQuery.error.message
            : "تعذر تحميل المحادثات"}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm">
        {conversationsQuery.isLoading ? (
          <div className="h-[520px] animate-pulse bg-[#f8fafc]" />
        ) : threads.length === 0 ? (
          <div className="px-6 py-16 text-center" dir="rtl">
            <p className="text-lg font-bold text-[#0f172a]">لا توجد محادثات بعد</p>
            <p className="mt-2 text-sm text-[#64748b]">
              ستظهر هنا محادثاتك مع الطلاب عند بدء التواصل.
            </p>
          </div>
        ) : activeThread ? (
          <div
            className="grid grid-cols-1 items-start xl:grid-cols-[280px_minmax(0,1fr)_320px]"
            dir="ltr"
          >
            <div className="order-3 hidden xl:order-1 xl:block xl:row-start-1">
              <ChatContactProfile thread={activeThread} />
            </div>

            <div className="order-2 min-w-0 xl:order-2 xl:row-start-1">
              <ChatWindow
                thread={activeThread}
                messages={messagesQuery.data ?? []}
                isLoadingMessages={messagesQuery.isLoading}
                isSending={sendMutation.isPending}
                onSendMessage={(content) => sendMutation.mutateAsync(content)}
              />
            </div>

            <div className="order-1 xl:order-3 xl:row-start-1">
              <ChatsListPanel
                threads={threads}
                activeId={activeThread.id}
                onSelect={setActiveId}
              />
            </div>
          </div>
        ) : null}
      </div>
    </PageMotion>
  );
};
