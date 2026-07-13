import type { CourseExam } from "@/core/api/exams";
import { QuizCard } from "./QuizCard";

interface QuizzesGridProps {
  quizzes: CourseExam[];
  onSubmit?: (exam: CourseExam, writtenAnswer: string) => void | Promise<unknown>;
  onViewResult?: (exam: CourseExam) => void | Promise<void>;
  loadingExamId?: string | null;
}

export const QuizzesGrid = ({
  quizzes,
  onSubmit,
  onViewResult,
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
          onSubmit={onSubmit}
          onViewResult={onViewResult}
          isLoading={loadingExamId === quiz.id}
        />
      ))}
    </div>
  );
};
