import type { CommunityPostView } from "@/core/api/community";
import { STUDENT_DEFAULT_AVATAR } from "@/student/constants/assets";

export interface CommunityGroupInsight {
  name: string;
  count: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface CommunityMemberInsight {
  name: string;
  avatar: string;
  online: boolean;
}

export interface CommunityInsights {
  groups: CommunityGroupInsight[];
  trendingTag: string;
  hashtags: string[];
  activeMembers: CommunityMemberInsight[];
}

const GROUP_STYLES = [
  { icon: "/images/student/icon-code.svg", iconBg: "bg-[#eff6ff]", iconColor: "text-[#3b82f6]" },
  { icon: "/images/student/icon-database.svg", iconBg: "bg-[#ecfdf5]", iconColor: "text-[#14b8a6]" },
  { icon: "/images/student/icon-shield.svg", iconBg: "bg-[#fff7ed]", iconColor: "text-[#f5a524]" },
  { icon: "/images/student/icon-book.svg", iconBg: "bg-[#f5f3ff]", iconColor: "text-[#8b5cf6]" },
];

function extractHashtags(content: string): string[] {
  const matches = content.match(/#[\u0600-\u06FF\w]+/g) ?? [];
  return matches.map((tag) => tag.trim());
}

export function buildCommunityInsights(posts: CommunityPostView[]): CommunityInsights {
  const tagCounts = new Map<string, number>();
  const authorCounts = new Map<string, { author: string; avatar: string; count: number }>();

  for (const post of posts) {
    if (post.tag) {
      tagCounts.set(post.tag, (tagCounts.get(post.tag) ?? 0) + 1);
    }

    for (const hashtag of extractHashtags(post.content)) {
      tagCounts.set(hashtag, (tagCounts.get(hashtag) ?? 0) + 1);
    }

    const existing = authorCounts.get(post.author);
    if (existing) {
      existing.count += 1;
    } else {
      authorCounts.set(post.author, {
        author: post.author,
        avatar: post.avatar,
        count: 1,
      });
    }
  }

  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
  const groups = sortedTags.slice(0, 4).map(([name, count], index) => {
    const style = GROUP_STYLES[index % GROUP_STYLES.length];
    return {
      name: name.startsWith("#") ? name.slice(1) : name,
      count: `${count}`,
      ...style,
    };
  });

  const hashtags = sortedTags
    .filter(([tag]) => tag.startsWith("#"))
    .slice(0, 4)
    .map(([tag]) => tag);

  const activeMembers = [...authorCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((entry) => ({
      name: entry.author,
      avatar: entry.avatar || STUDENT_DEFAULT_AVATAR,
      online: entry.count > 1,
    }));

  return {
    groups,
    trendingTag: sortedTags[0]?.[0] ?? "#مجتمع_التعلم",
    hashtags: hashtags.length ? hashtags : ["#تعلم", "#برمجة", "#جامعة", "#مساعدة"],
    activeMembers,
  };
}

export function filterPostsByCourseTag(
  posts: CommunityPostView[],
  courseId: string,
): CommunityPostView[] {
  const courseTag = `course:${courseId}`;
  return posts.filter(
    (post) =>
      post.courseId === courseId ||
      post.tag === courseTag ||
      post.content.includes(courseTag) ||
      post.content.includes(`[[course:${courseId}]]`),
  );
}

/** Hide course-scoped posts from the general community feed. */
export function excludeCourseCommunityPosts(
  posts: CommunityPostView[],
): CommunityPostView[] {
  return posts.filter((post) => {
    if (post.courseId) return false;
    if (post.tag?.startsWith("course:")) return false;
    if (/\[\[course:[^\]]+\]\]/.test(post.content)) return false;
    return true;
  });
}
