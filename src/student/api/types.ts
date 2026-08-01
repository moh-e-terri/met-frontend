export interface StudentDashboardStats {
  enrolled: number;
  completed: number;
  inProgress: number;
}

export interface StudentContinueCourse {
  id: string;
  title: string;
  progress: number;
  lessonsLabel: string;
  image: string;
  barColor: string;
  university?: string;
  universityId?: string;
}

export interface StudentDashboardProfile {
  universityName?: string;
  metBalance?: number;
  memberSince?: string;
}

export interface StudentDashboardData {
  stats: StudentDashboardStats;
  continueLearning: StudentContinueCourse[];
  profile: StudentDashboardProfile;
}

export interface CommunityPostItem {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  replies: number;
  tag?: string;
}
