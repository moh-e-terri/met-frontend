import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import {
  chatQueryKeys,
  fetchChatMessages,
  fetchConversations,
  sendChatMessage,
  startConversation,
  type ChatThread,
} from "@/core/api/chat";
import { PageMotion } from "@/shared/motion";
import { ChatContactProfile } from "@/student/modules/chats/components/ChatContactProfile";
import { ChatWindow } from "@/student/modules/chats/components/ChatWindow";
import { ChatsListPanel } from "@/student/modules/chats/components/ChatsListPanel";

const CONVERSATIONS_POLL_MS = 8_000;
const MESSAGES_POLL_MS = 3_000;
const PENDING_CHAT_USER_KEY = "met_pending_chat_user";
const PENDING_CHAT_NAME_KEY = "met_pending_chat_name";
const PENDING_CHAT_COURSE_KEY = "met_pending_chat_course";

/** Survives React Strict Mode remounts within the same page load. */
let stickyFocusUserId: string | null = null;
let stickyFocusName: string | null = null;
let stickyFocusCourseId: string | null = null;

interface ChatsWorkspaceProps {
  /** Extra pending threads (e.g. student instructors not yet started) */
  pendingThreads?: ChatThread[];
  emptyTitle?: string;
  emptySubtitle?: string;
  isExtraLoading?: boolean;
  isExtraError?: boolean;
  extraErrorMessage?: string;
}

function readSessionFocus() {
  try {
    return {
      userId: sessionStorage.getItem(PENDING_CHAT_USER_KEY) || "",
      name: sessionStorage.getItem(PENDING_CHAT_NAME_KEY) || "",
      courseId: sessionStorage.getItem(PENDING_CHAT_COURSE_KEY) || "",
    };
  } catch {
    return { userId: "", name: "", courseId: "" };
  }
}

function writeSessionFocus(userId: string, name?: string, courseId?: string) {
  stickyFocusUserId = userId;
  stickyFocusName = name || null;
  stickyFocusCourseId = courseId || null;
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

function clearSessionFocus() {
  stickyFocusUserId = null;
  stickyFocusName = null;
  stickyFocusCourseId = null;
  try {
    sessionStorage.removeItem(PENDING_CHAT_USER_KEY);
    sessionStorage.removeItem(PENDING_CHAT_NAME_KEY);
    sessionStorage.removeItem(PENDING_CHAT_COURSE_KEY);
  } catch {
    // ignore
  }
}

function findThreadForUser(threads: ChatThread[], userId: string): ChatThread | undefined {
  const target = userId.trim();
  if (!target) return undefined;
  return threads.find((thread) => thread.participantId?.trim() === target);
}

export const ChatsWorkspace = ({
  pendingThreads = [],
  emptyTitle = "لا توجد محادثات بعد",
  emptySubtitle = "ابدأ محادثة من قائمة الطلاب أو المدرسين.",
  isExtraLoading = false,
  isExtraError = false,
  extraErrorMessage,
}: ChatsWorkspaceProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState("");
  const [isOpeningTarget, setIsOpeningTarget] = useState(false);
  const openingRef = useRef(false);

  const urlUserId = searchParams.get("userId") || "";
  const urlName = searchParams.get("name") || "";
  const urlCourseId = searchParams.get("courseId") || "";
  const urlConversationId = searchParams.get("conversationId") || "";

  // Capture focus ASAP (URL + sticky + session) so remounts don't lose the target.
  if (urlUserId) {
    writeSessionFocus(urlUserId, urlName || undefined, urlCourseId || undefined);
  }

  const sessionFocus = readSessionFocus();
  const targetUserId = urlUserId || stickyFocusUserId || sessionFocus.userId || "";
  const targetName = urlName || stickyFocusName || sessionFocus.name || "";
  const courseId =
    urlCourseId || stickyFocusCourseId || sessionFocus.courseId || undefined;

  const conversationsQuery = useQuery({
    queryKey: [...chatQueryKeys.conversations, session?.userId ?? "anon"],
    queryFn: () => fetchConversations(session?.userId),
    enabled: Boolean(session?.userId),
    refetchInterval: CONVERSATIONS_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const threads = useMemo(() => {
    const conversations = conversationsQuery.data ?? [];
    const existingParticipants = new Set(
      conversations.map((thread) => thread.participantId).filter(Boolean),
    );
    const pending = pendingThreads.filter(
      (thread) => thread.participantId && !existingParticipants.has(thread.participantId),
    );
    return [...conversations, ...pending];
  }, [conversationsQuery.data, pendingThreads]);

  const clearFocusParams = () => {
    setSearchParams(
      (current) => {
        if (
          !current.get("userId") &&
          !current.get("name") &&
          !current.get("courseId") &&
          !current.get("conversationId")
        ) {
          return current;
        }
        const next = new URLSearchParams(current);
        next.delete("userId");
        next.delete("name");
        next.delete("courseId");
        next.delete("conversationId");
        return next;
      },
      { replace: true },
    );
  };

  // Open conversation from notification deep-link.
  useEffect(() => {
    if (!urlConversationId) return;
    const match = threads.find((thread) => thread.id === urlConversationId);
    if (!match) return;
    if (activeId !== match.id) setActiveId(match.id);
    clearFocusParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clearFocusParams is stable enough via setSearchParams
  }, [urlConversationId, threads, activeId]);

  // Open existing / start new conversation for the focused user.
  useEffect(() => {
    if (!targetUserId || !session?.userId) return;

    const existing = findThreadForUser(threads, targetUserId);
    if (existing) {
      if (activeId !== existing.id) {
        setActiveId(existing.id);
      }
      clearFocusParams();
      // Keep sticky briefly so Strict Mode remount can re-apply, then clear.
      window.setTimeout(() => {
        if (stickyFocusUserId === targetUserId) {
          clearSessionFocus();
        }
      }, 300);
      setIsOpeningTarget(false);
      openingRef.current = false;
      return;
    }

    if (conversationsQuery.isLoading || isExtraLoading) {
      setIsOpeningTarget(true);
      return;
    }

    if (openingRef.current) return;
    openingRef.current = true;
    setIsOpeningTarget(true);

    void (async () => {
      try {
        const started = await startConversation(
          { targetUserId, courseId },
          session.userId,
        );
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });

        const refreshed =
          queryClient.getQueryData<ChatThread[]>([
            ...chatQueryKeys.conversations,
            session.userId,
          ]) ?? [];
        const matched =
          findThreadForUser(refreshed, targetUserId) ||
          (started?.id
            ? refreshed.find((thread) => thread.id === started.id) || started
            : null);

        if (matched?.id) {
          if (targetName) {
            queryClient.setQueryData<ChatThread[]>(
              [...chatQueryKeys.conversations, session.userId],
              (current) =>
                (current ?? []).map((thread) =>
                  thread.id === matched.id
                    ? {
                        ...thread,
                        name: targetName,
                        participantId: thread.participantId || targetUserId,
                      }
                    : thread,
                ),
            );
          }
          setActiveId(matched.id);
          clearFocusParams();
          window.setTimeout(() => {
            if (stickyFocusUserId === targetUserId) {
              clearSessionFocus();
            }
          }, 300);
        }
      } catch {
        // allow retry
      } finally {
        openingRef.current = false;
        setIsOpeningTarget(false);
      }
    })();
  }, [
    targetUserId,
    targetName,
    courseId,
    session?.userId,
    threads,
    conversationsQuery.isLoading,
    isExtraLoading,
    activeId,
    queryClient,
    setSearchParams,
  ]);

  // Default selection only when there is no pending focus target.
  useEffect(() => {
    if (targetUserId) return;
    if (!activeId && threads.length > 0) {
      setActiveId(threads[0].id);
    }
  }, [activeId, threads, targetUserId]);

  const activeThread = threads.find((thread) => thread.id === activeId) ?? threads[0];
  const conversationIds = new Set((conversationsQuery.data ?? []).map((thread) => thread.id));
  const isPending =
    Boolean(activeThread) && !conversationIds.has(activeThread.id);

  const messagesQuery = useQuery({
    queryKey: chatQueryKeys.messages(activeThread?.id ?? ""),
    queryFn: () => fetchChatMessages(activeThread!.id, session?.userId),
    enabled: Boolean(activeThread?.id) && !isPending,
    refetchInterval: activeThread?.id && !isPending ? MESSAGES_POLL_MS : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeThread) return;

      let conversationId = activeThread.id;

      if (isPending && activeThread.participantId) {
        const started = await startConversation(
          { targetUserId: activeThread.participantId, courseId },
          session?.userId,
        );
        if (!started?.id) {
          throw new Error("تعذر بدء المحادثة");
        }
        conversationId = started.id;
        setActiveId(started.id);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
      }

      await sendChatMessage(conversationId, content);
      return conversationId;
    },
    onSuccess: async (conversationId) => {
      if (conversationId) {
        await queryClient.invalidateQueries({
          queryKey: chatQueryKeys.messages(conversationId),
        });
      }
      await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const isLoading = conversationsQuery.isLoading || isExtraLoading;
  const isError = conversationsQuery.isError && (isExtraError || pendingThreads.length === 0);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-4">
      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {conversationsQuery.error instanceof Error
            ? conversationsQuery.error.message
            : extraErrorMessage || "تعذر تحميل المحادثات"}
        </div>
      ) : null}

      {isOpeningTarget ? (
        <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#64748b]">
          جاري فتح المحادثة...
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm">
        {isLoading ? (
          <div className="h-[min(720px,calc(100vh-11rem))] animate-pulse bg-[#f8fafc]" />
        ) : threads.length === 0 ? (
          <div className="px-6 py-16 text-center" dir="rtl">
            <p className="text-lg font-bold text-[#0f172a]">{emptyTitle}</p>
            <p className="mt-2 text-sm text-[#64748b]">{emptySubtitle}</p>
          </div>
        ) : activeThread ? (
          <div
            className="grid grid-cols-1 xl:h-[min(720px,calc(100vh-11rem))] xl:grid-cols-[280px_minmax(0,1fr)_320px]"
            dir="ltr"
          >
            <div className="order-3 hidden min-h-0 xl:order-1 xl:block xl:row-start-1">
              <ChatContactProfile thread={activeThread} />
            </div>

            <div className="order-2 min-h-0 min-w-0 xl:order-2 xl:row-start-1">
              <ChatWindow
                thread={activeThread}
                messages={messagesQuery.data ?? []}
                isLoadingMessages={messagesQuery.isLoading && !isPending}
                isSending={sendMutation.isPending}
                onSendMessage={(content) => sendMutation.mutateAsync(content)}
              />
            </div>

            <div className="order-1 min-h-0 xl:order-3 xl:row-start-1">
              <ChatsListPanel
                threads={threads}
                activeId={activeThread.id}
                onSelect={(id) => {
                  clearSessionFocus();
                  setActiveId(id);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </PageMotion>
  );
};
