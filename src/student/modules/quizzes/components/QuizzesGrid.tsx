import type { CourseExam } from "@/core/api/exams";
import { QuizCard } from "./QuizCard";

interface QuizzesGridProps {
  quizzes: CourseExam[];
  courseId: string;
  loadingExamId?: string | null;
}

export const QuizzesGrid = ({
  quizzes,
  courseId,
  loadingExamId,
}: QuizzesGridProps) => {
  return (
    <div
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      dir="rtl"
    >
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          courseId={courseId}
          isLoading={loadingExamId === quiz.id}
        />
      ))}
    </div>
  );
};
