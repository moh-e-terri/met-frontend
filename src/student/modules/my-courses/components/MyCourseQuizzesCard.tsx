import { Link } from "react-router-dom";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { MyCourseQuiz } from "../data/mockMyCourse";

interface MyCourseQuizzesCardProps {
  courseId: string;
  quizzes: MyCourseQuiz[];
}

export const MyCourseQuizzesCard = ({
  courseId,
  quizzes,
}: MyCourseQuizzesCardProps) => {
  return (
    <Link
      to={`/student/my-courses/${courseId}/quizzes`}
      className="block rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      dir="rtl"
    >
      <h2 className="mb-4 flex w-full items-center justify-start gap-2 text-base font-bold text-[#0f172a]">
        <StudentIcon
          src="/images/student/icon-quiz.svg"
          className="size-5 text-[#14b8a6]"
        />
        <span>الاختبارات القصيرة</span>
      </h2>

      <ul className="space-y-3">
        {quizzes.length === 0 ? (
          <li className="rounded-2xl bg-[#f8fafc] px-3 py-6 text-center text-sm text-[#64748b]">
            لا توجد اختبارات بعد.
          </li>
        ) : (
          quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-3"
          >
            <p className="mb-2 text-sm font-bold text-[#0f172a]">
              {quiz.title}
            </p>
            {quiz.status === "completed" ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#3b82f6]">
                  {quiz.action}
                </span>
                <span
                  className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-xs font-bold text-[#14b8a6]"
                  dir="ltr"
                >
                  {quiz.score}
                </span>
              </div>
            ) : (
              <span className="block w-full rounded-xl bg-[#f5a524] py-2 text-center text-xs font-bold text-white">
                {quiz.action}
              </span>
            )}
          </li>
          ))
        )}
      </ul>
    </Link>
  );
};
