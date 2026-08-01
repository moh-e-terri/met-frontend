import { STUDENT_DEFAULT_AVATAR } from "@/student/constants/assets";
import { apiClient, type ApiEnvelope } from "./client";
import {
  asArray,
  asRecord,
  pickId,
  pickNumber,
  pickString,
  resolveMediaUrl,
} from "./utils";

export interface ChatThread {
  id: string;
  name: string;
  preview: string;
  time: string;
  avatar: string;
  unread?: number;
  online?: boolean;
  role?: string;
  university?: string;
  major?: string;
  participantId?: string;
  sharedCourses?: Array<{
    title: string;
    status: "active" | "completed";
  }>;
}

export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  outgoing: boolean;
  showAvatar?: boolean;
  type?: "text" | "divider";
}

function formatRelativeTime(value?: string): string {
  if (!value) return "الآن";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function formatMessageTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function mapParticipant(raw: Record<string, unknown>) {
  const first = pickString(raw.firstName);
  const last = pickString(raw.familyName, raw.lastName);
  const second = pickString(raw.secondName, raw.middleName);
  const built = [first, second, last].filter(Boolean).join(" ");

  return {
    id: pickId(raw),
    name:
      pickString(raw.name, raw.fullName) ||
      built ||
      pickString(raw.email) ||
      "مستخدم",
    avatar:
      resolveMediaUrl(pickString(raw.avatar, raw.image, raw.profileImage)) ||
      STUDENT_DEFAULT_AVATAR,
    role: pickString(raw.role, raw.title),
    university: pickString(asRecord(raw.university).name, raw.universityName),
    major: pickString(raw.major, raw.field),
  };
}

export function mapConversations(raw: unknown, currentUserId?: string): ChatThread[] {
  const data = asRecord(raw);
  const listSource =
    data.conversations ??
    data.items ??
    data.chats ??
    data.conversation ??
    (Array.isArray(raw) ? raw : []);
  const conversations = asArray<Record<string, unknown>>(listSource);

  return conversations
    .map((item) => {
      const id = pickId(item) || pickString(item.conversationId);
      if (!id) return null;

      const participants = asArray<Record<string, unknown> | string>(
        item.participants ?? item.users ?? item.members,
      );
      const otherFromList =
        participants.find((user) => {
          if (typeof user === "string") {
            return Boolean(user) && user !== currentUserId;
          }
          const pid = pickId(user);
          return (
            Boolean(pid) &&
            pid !== currentUserId &&
            typeof user === "object" &&
            !Array.isArray(user) &&
            Object.keys(user).length > 1
          );
        }) ??
        participants.find((user) => {
          if (typeof user === "string") return Boolean(user) && user !== currentUserId;
          const pid = pickId(user);
          return Boolean(pid) && pid !== currentUserId;
        });

      const otherUserRaw = item.otherUser ?? item.participant ?? item.user ?? otherFromList;
      const otherUser =
        typeof otherUserRaw === "string"
          ? { _id: otherUserRaw, id: otherUserRaw }
          : asRecord(otherUserRaw);
      const participant = mapParticipant(otherUser);

      // When API returns participants as bare ids, keep the other user's id.
      const participantIdFromStrings =
        typeof otherFromList === "string" ? otherFromList : undefined;
      const lastMessage = asRecord(item.lastMessage ?? item.latestMessage ?? item.message);
      const course = asRecord(item.course);

      return {
        id,
        name: participant.name || pickString(item.title, item.name) || "محادثة",
        preview:
          pickString(
            lastMessage.content,
            lastMessage.text,
            item.preview,
            item.lastMessageText,
          ) || "لا توجد رسائل بعد",
        time: formatRelativeTime(
          pickString(lastMessage.createdAt, item.updatedAt, item.lastMessageAt, item.createdAt),
        ),
        avatar: participant.avatar,
        unread: pickNumber(item.unreadCount, item.unread) || undefined,
        online: Boolean(item.online),
        role: participant.role,
        university: participant.university,
        major: participant.major,
        participantId: participant.id || participantIdFromStrings || undefined,
        sharedCourses: pickString(course.title, course.name)
          ? [{ title: pickString(course.title, course.name), status: "active" as const }]
          : undefined,
      };
    })
    .filter((thread) => thread !== null) as ChatThread[];
}

export function mapChatMessages(
  raw: unknown,
  currentUserId?: string,
): ChatMessage[] {
  const data = asRecord(raw);
  const messages = asArray<Record<string, unknown>>(
    data.messages ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return messages.map((message, index) => {
    const sender = asRecord(message.sender ?? message.user ?? message.author);
    const senderId = pickId(sender) || pickString(message.senderId);
    const outgoing = currentUserId
      ? senderId === currentUserId
      : Boolean(message.isMine ?? message.outgoing ?? message.isOutgoing);

    return {
      id: pickId(message) || `message-${index}`,
      text: pickString(message.content, message.text, message.body),
      time: formatMessageTime(pickString(message.createdAt, message.time, message.date)),
      outgoing,
      showAvatar: !outgoing,
      type: "text",
    };
  });
}

export async function fetchConversations(currentUserId?: string): Promise<ChatThread[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/chat");
  return mapConversations(response.data.data, currentUserId);
}

export async function fetchChatMessages(
  conversationId: string,
  currentUserId?: string,
): Promise<ChatMessage[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/chat/${conversationId}/messages`,
  );
  return mapChatMessages(response.data.data, currentUserId);
}

export async function sendChatMessage(conversationId: string, content: string) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/chat/${conversationId}/messages`,
    { content, type: "text" },
  );
  return response.data;
}

export async function startConversation(
  payload: {
    targetUserId: string;
    courseId?: string;
  },
  currentUserId?: string,
): Promise<ChatThread | null> {
  const response = await apiClient.post<ApiEnvelope<unknown>>("/chat", payload);
  const data = asRecord(response.data.data);
  const conversation = asRecord(data.conversation ?? data);

  // Prefer mapping from list shape; fall back to synthesizing a thread
  const fromList = mapConversations(
    data.conversations ? data : { conversations: [conversation] },
    currentUserId,
  );
  if (fromList[0]?.id) {
    return {
      ...fromList[0],
      participantId: fromList[0].participantId || payload.targetUserId,
    };
  }

  const id = pickId(conversation) || pickString(conversation.conversationId);
  if (!id) return null;

  return {
    id,
    name: "محادثة جديدة",
    preview: "لا توجد رسائل بعد",
    time: "الآن",
    avatar: STUDENT_DEFAULT_AVATAR,
    participantId: payload.targetUserId,
    online: false,
  };
}

export const chatQueryKeys = {
  conversations: ["chat", "conversations"] as const,
  messages: (conversationId: string) => ["chat", conversationId, "messages"] as const,
};
