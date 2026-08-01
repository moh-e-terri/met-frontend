import {
  createCommunityPost,
  communityQueryKeys,
  fetchCommunityPosts as fetchCommunityPostsApi,
  type CommunityPostView,
} from "@/core/api/community";
import type { CommunityPostItem } from "./types";

export { createCommunityPost, communityQueryKeys, type CommunityPostView };

function toCommunityPostItem(post: CommunityPostView): CommunityPostItem {
  return {
    id: post.id,
    author: post.author,
    avatar: post.avatar,
    time: post.time,
    content: post.content,
    likes: post.likes,
    replies: post.comments,
    tag: post.tag,
  };
}

export async function fetchCommunityPosts(
  limit = 10,
  currentUserId?: string,
): Promise<CommunityPostItem[]> {
  const posts = await fetchCommunityPostsApi({ limit, currentUserId });
  return posts.map(toCommunityPostItem);
}
