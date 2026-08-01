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

export interface CommunityPostView {
  id: string;
  authorId: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  likedByMe: boolean;
  comments: number;
  image?: string;
  attachments: string[];
  pinned?: boolean;
  tag?: string;
  courseId?: string;
}

export interface CommunityCommentView {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  time: string;
}

function cleanNamePart(value: unknown): string {
  const text = pickString(value);
  if (!text || /^(undefined|null|n\/a)$/i.test(text)) return "";
  return text;
}

function displayName(raw: Record<string, unknown>, fallback = "عضو"): string {
  const built = [
    raw.firstName,
    raw.secondName,
    raw.middleName,
    raw.familyName,
    raw.lastName,
  ]
    .map((part) => cleanNamePart(part))
    .filter(Boolean)
    .join(" ");

  const fromFull = pickString(raw.name, raw.fullName)
    .split(/\s+/)
    .map((part) => cleanNamePart(part))
    .filter(Boolean)
    .join(" ");

  return built || fromFull || pickString(raw.email) || fallback;
}

function roleLabel(role?: string): string {
  const normalized = (role || "").toLowerCase();
  if (normalized === "admin") return "مدير";
  if (normalized === "instructor" || normalized === "teacher") return "مدرّس";
  if (normalized === "student") return "طالب";
  return role || "عضو المجتمع";
}

function formatRelativeTime(value?: string): string {
  if (!value) return "منذ قليل";
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
  return date.toLocaleDateString("ar-SA");
}

function resolveAttachment(value: unknown): string {
  if (typeof value === "string") {
    if (value.startsWith("/images/") || value.startsWith("data:")) return value;
    return resolveMediaUrl(value) || value;
  }
  const record = asRecord(value);
  const url = pickString(record.url, record.path, record.src, record.image);
  if (!url) return "";
  if (url.startsWith("/images/") || url.startsWith("data:")) return url;
  return resolveMediaUrl(url) || url;
}

function mapAuthor(raw: unknown) {
  const author = asRecord(raw);
  const nestedUser = asRecord(author.userId);
  const source =
    pickId(nestedUser) || pickString(nestedUser.firstName, nestedUser.fullName)
      ? { ...nestedUser, ...author }
      : author;

  return {
    id: pickId(source),
    name: displayName(source),
    role: roleLabel(pickString(source.role, author.role)),
    avatar:
      resolveAttachment(
        pickString(
          source.profileImage,
          source.avatar,
          source.image,
          source.photo,
        ),
      ) || STUDENT_DEFAULT_AVATAR,
  };
}

function likeIds(raw: unknown): string[] {
  return asArray(raw)
    .map((entry) => {
      if (typeof entry === "string") return entry;
      return pickId(asRecord(entry));
    })
    .filter(Boolean);
}

export function mapCommunityPosts(
  raw: unknown,
  currentUserId?: string,
): CommunityPostView[] {
  const data = asRecord(raw);
  const posts = asArray<Record<string, unknown>>(
    data.posts ?? data.items ?? data.data ?? (Array.isArray(raw) ? raw : []),
  );

  return posts.flatMap((post) => {
    if (post.isDeleted === true) return [];

    const id = pickId(post);
    const content = pickString(post.content, post.text, post.body);
    if (!id || !content) return [];

    const author = mapAuthor(post.authorId ?? post.author ?? post.user ?? post.createdBy);
    const attachments = asArray(post.attachments)
      .map((item) => resolveAttachment(item))
      .filter(Boolean);
    const likes = likeIds(post.likes);

    return [
      {
        id,
        authorId: author.id,
        author: author.name,
        role: author.role,
        avatar: author.avatar,
        time: formatRelativeTime(pickString(post.createdAt, post.time, post.date)),
        content,
        likes: likes.length || pickNumber(post.likesCount, post.reactions),
        likedByMe: currentUserId ? likes.includes(currentUserId) : false,
        comments: pickNumber(
          post.commentsCount,
          post.replies,
          post.repliesCount,
          Array.isArray(post.comments) ? post.comments.length : 0,
        ),
        image:
          attachments[0] ||
          resolveAttachment(pickString(post.image, post.mediaUrl, post.attachmentUrl)) ||
          undefined,
        attachments,
        pinned: Boolean(post.pinned ?? post.isPinned),
        tag: pickString(post.tag, post.category, post.communityName) || undefined,
        courseId:
          pickString(post.courseId) ||
          pickId(asRecord(post.courseId)) ||
          pickId(asRecord(post.course)) ||
          undefined,
      },
    ];
  });
}

export function mapCommunityComments(raw: unknown): CommunityCommentView[] {
  const data = asRecord(raw);
  const comments = asArray<Record<string, unknown>>(
    data.comments ?? data.items ?? data.data ?? (Array.isArray(raw) ? raw : []),
  );

  return comments.flatMap((comment) => {
    if (comment.isDeleted === true) return [];
    const id = pickId(comment);
    const content = pickString(comment.content, comment.text);
    if (!id || !content) return [];
    const author = mapAuthor(comment.authorId ?? comment.author ?? comment.user);

    return [
      {
        id,
        postId: pickString(comment.postId) || pickId(asRecord(comment.post)),
        authorId: author.id,
        author: author.name,
        role: author.role,
        avatar: author.avatar,
        content,
        time: formatRelativeTime(pickString(comment.createdAt, comment.time)),
      },
    ];
  });
}

export interface FetchCommunityPostsParams {
  page?: number;
  limit?: number;
  currentUserId?: string;
  /** When set, loads course-scoped community only */
  courseId?: string;
}

export async function fetchCommunityPosts(
  params: FetchCommunityPostsParams = {},
): Promise<CommunityPostView[]> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const path = params.courseId
    ? `/community/courses/${params.courseId}/posts`
    : "/community/posts";

  const response = await apiClient.get<ApiEnvelope<unknown>>(path, {
    params: { page, limit },
  });

  let posts = mapCommunityPosts(
    response.data.data ?? response.data,
    params.currentUserId,
  );

  // General feed must never show course-scoped posts (API + client safety).
  if (!params.courseId) {
    posts = posts.filter((post) => !post.courseId);
  }

  // List endpoint does not include comment counts — enrich from comments pagination.
  const withCounts = await Promise.all(
    posts.map(async (post) => {
      if (post.comments > 0) return post;
      try {
        const comments = await fetchCommunityPostCommentsCount(post.id);
        return { ...post, comments };
      } catch {
        return post;
      }
    }),
  );

  return withCounts;
}

export interface CreateCommunityPostPayload {
  content: string;
  tag?: string;
  attachments?: string[];
  /** Routes create to course community when set */
  courseId?: string;
}

export async function createCommunityPost(
  contentOrPayload: string | CreateCommunityPostPayload,
  options?: { tag?: string; attachments?: string[] },
): Promise<CommunityPostView | null> {
  const payload: CreateCommunityPostPayload =
    typeof contentOrPayload === "string"
      ? {
          content: contentOrPayload,
          tag: options?.tag,
          attachments: options?.attachments,
        }
      : contentOrPayload;

  const body: Record<string, unknown> = {
    content: payload.content.trim(),
  };
  if (payload.attachments?.length) {
    body.attachments = payload.attachments;
  }

  const path = payload.courseId
    ? `/community/courses/${payload.courseId}/posts`
    : "/community/posts";

  // Only send tag on the general endpoint (course endpoint scopes via path).
  if (!payload.courseId && payload.tag) {
    body.tag = payload.tag;
  }

  const response = await apiClient.post<ApiEnvelope<unknown>>(path, body);

  const data = asRecord(response.data.data);
  const single = mapCommunityPosts(data.post ?? data, undefined);
  if (single[0]) {
    return payload.courseId
      ? { ...single[0], courseId: single[0].courseId || payload.courseId }
      : single[0];
  }

  const posts = mapCommunityPosts(response.data.data);
  const created = posts[0] ?? null;
  if (created && payload.courseId && !created.courseId) {
    return { ...created, courseId: payload.courseId };
  }
  return created;
}

export async function toggleCommunityPostLike(postId: string): Promise<{
  liked: boolean;
  totalLikes: number;
}> {
  const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
    `/community/posts/${postId}/like`,
  );
  const data = asRecord(response.data.data);
  return {
    liked: Boolean(data.liked),
    totalLikes: pickNumber(data.totalLikes, data.likes),
  };
}

export async function fetchCommunityPostCommentsCount(postId: string): Promise<number> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/community/posts/${postId}/comments`,
    { params: { page: 1, limit: 1 } },
  );
  const pagination = asRecord(
    asRecord(response.data).pagination ?? asRecord(response.data.data).pagination,
  );
  const total = pickNumber(pagination.total, pagination.totalItems, pagination.count);
  if (total > 0) return total;

  const comments = mapCommunityComments(response.data.data ?? response.data);
  return comments.length;
}

export async function fetchCommunityPostComments(
  postId: string,
): Promise<CommunityCommentView[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/community/posts/${postId}/comments`,
  );
  return mapCommunityComments(response.data.data ?? response.data);
}

export async function createCommunityPostComment(
  postId: string,
  content: string,
): Promise<CommunityCommentView | null> {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/community/posts/${postId}/comments`,
    { content },
  );
  const data = asRecord(response.data.data);
  const mapped = mapCommunityComments(data.comment ?? data);
  return mapped[0] ?? null;
}

export async function deleteCommunityPostComment(
  postId: string,
  commentId: string,
): Promise<void> {
  await apiClient.delete(`/community/posts/${postId}/comments/${commentId}`);
}

export async function deleteCommunityPost(postId: string): Promise<void> {
  await apiClient.delete(`/community/posts/${postId}`);
}

export async function toggleCommunityPostPin(postId: string): Promise<boolean> {
  const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
    `/community/posts/${postId}/pin`,
  );
  const data = asRecord(response.data.data);
  if (typeof data.isPinned === "boolean") return data.isPinned;
  const message = pickString(response.data.message);
  return message.includes("تم تثبيت");
}

export const communityQueryKeys = {
  posts: (limit: number, page = 1, userId = "anon", courseId = "global") =>
    ["community", "posts", page, limit, userId, courseId] as const,
  comments: (postId: string) => ["community", "comments", postId] as const,
};
