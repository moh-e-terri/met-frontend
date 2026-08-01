import { CourseCommunityCard } from "@/shared/modules/course-workspace/CourseCommunityCard";

interface MyCourseFeedProps {
  courseId: string;
  courseTitle: string;
}

export const MyCourseFeed = ({ courseId, courseTitle }: MyCourseFeedProps) => {
  return (
    <CourseCommunityCard
      to={`/student/courses/${courseId}/community`}
      courseTitle={courseTitle}
    />
  );
};
