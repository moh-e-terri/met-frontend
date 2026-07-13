import { STUDENT_DEFAULT_AVATAR } from "@/student/constants/assets";
import { apiClient, type ApiEnvelope } from "./client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "./utils";

export interface CommunityPostView {
  id: string;
  author: string;
  role: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  image?: string;
  pinned?: boolean;
  tag?: string;
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

export function mapCommunityPosts(raw: unknown): CommunityPostView[] {
  const data = asRecord(raw);
  const posts = asArray<Record<string, unknown>>(
    data.posts ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return posts
    .map((post) => {
      const id = pickId(post);
      const content = pickString(post.content, post.text, post.body);
      if (!id || !content) return null;

      const author = asRecord(post.author ?? post.user ?? post.createdBy);

      return {
        id,
        author: pickString(
          author.name,
          author.fullName,
          pickString(author.firstName) && pickString(author.lastName)
            ? `${pickString(author.firstName)} ${pickString(author.lastName)}`
            : "",
          "عضو",
        ),
        role: pickString(author.role, author.title, post.authorRole, "عضو المجتمع"),
        avatar: pickString(author.avatar, author.image) || STUDENT_DEFAULT_AVATAR,
        time: formatRelativeTime(pickString(post.createdAt, post.time, post.date)),
        content,
        likes: pickNumber(post.likes, post.likesCount, post.reactions),
        comments: pickNumber(post.comments, post.commentsCount, post.replies, post.repliesCount),
        image: pickString(post.image, post.mediaUrl, post.attachmentUrl) || undefined,
        pinned: Boolean(post.pinned ?? post.isPinned),
        tag: pickString(post.tag, post.category, post.communityName) || undefined,
      };
    })
    .filter((post) => post !== null) as CommunityPostView[];
}

export interface FetchCommunityPostsParams {
  page?: number;
  limit?: number;
}

export async function fetchCommunityPosts(
  params: FetchCommunityPostsParams = {},
): Promise<CommunityPostView[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/community/posts", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });

  return mapCommunityPosts(response.data.data);
}

export async function createCommunityPost(
  content: string,
  options?: { tag?: string },
): Promise<CommunityPostView | null> {
  const response = await apiClient.post<ApiEnvelope<unknown>>("/community/posts", {
    content,
    ...(options?.tag ? { tag: options.tag } : {}),
  });
  const posts = mapCommunityPosts(response.data.data);
  if (posts.length) return posts[0];

  const data = asRecord(response.data.data);
  const single = mapCommunityPosts([data]);
  return single[0] ?? null;
}

export const communityQueryKeys = {
  posts: (limit: number, page = 1) => ["community", "posts", page, limit] as const,
};
