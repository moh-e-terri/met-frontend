import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminQueryKeys,
  createAdminCourse,
  createAdminUniversity,
  fetchAdminInstructors,
  fetchAdminUniversities,
} from "@/admin/api";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

export const AdminCreateCourseForm = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [metCost, setMetCost] = useState("50");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showUniversityForm, setShowUniversityForm] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [universityNameEn, setUniversityNameEn] = useState("");
  const [universityCity, setUniversityCity] = useState("");

  const instructorsQuery = useQuery({
    queryKey: adminQueryKeys.instructorOptions,
    queryFn: () => fetchAdminInstructors({ limit: 100 }).then((result) => result.items),
  });

  const universitiesQuery = useQuery({
    queryKey: adminQueryKeys.universities(),
    queryFn: () => fetchAdminUniversities(),
  });

  const createCourseMutation = useMutation({
    mutationFn: () =>
      createAdminCourse({
        title: title.trim(),
        description: description.trim() || undefined,
        instructorId: instructorId || undefined,
        allowedUniversities: universityId ? [universityId] : [],
        metCost: metCost ? Number(metCost) : undefined,
        level,
      }),
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setInstructorId("");
      setUniversityId("");
      setMetCost("50");
      setError(null);
      setSuccess("تم إنشاء الدورة بنجاح.");
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.courses({ limit: 100 }) });
    },
    onError: (mutationError) => {
      setSuccess(null);
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر إنشاء الدورة",
      );
    },
  });

  const createUniversityMutation = useMutation({
    mutationFn: () =>
      createAdminUniversity({
        name: universityName.trim(),
        nameEn: universityNameEn.trim() || undefined,
        city: universityCity.trim() || undefined,
      }),
    onSuccess: async () => {
      setUniversityName("");
      setUniversityNameEn("");
      setUniversityCity("");
      setShowUniversityForm(false);
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.universities() });
    },
  });

  return (
    <section
      id="create-course-form"
      className="scroll-mt-24 rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center justify-start gap-2">
          <AdminIcon
            src="/images/student/icon-book.svg"
            className="size-5 text-[#f5a524]"
          />
          <h2 className="text-lg font-bold text-[#0f172a]">إنشاء دورة جديدة</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowUniversityForm((open) => !open)}
          className="text-sm font-semibold text-[#3b82f6] hover:underline"
        >
          {showUniversityForm ? "إخفاء نموذج الجامعة" : "+ إضافة جامعة"}
        </button>
      </div>

      {showUniversityForm ? (
        <form
          className="mb-6 space-y-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            createUniversityMutation.mutate();
          }}
        >
          <p className="text-sm font-bold text-[#0f172a]">إضافة جامعة جديدة</p>
          <input
            value={universityName}
            onChange={(event) => setUniversityName(event.target.value)}
            placeholder="اسم الجامعة"
            required
            className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={universityNameEn}
              onChange={(event) => setUniversityNameEn(event.target.value)}
              placeholder="الاسم بالإنجليزية (اختياري)"
              className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
              dir="ltr"
            />
            <input
              value={universityCity}
              onChange={(event) => setUniversityCity(event.target.value)}
              placeholder="المدينة (اختياري)"
              className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            />
          </div>
          <button
            type="submit"
            disabled={createUniversityMutation.isPending}
            className="rounded-2xl bg-[#3b82f6] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {createUniversityMutation.isPending ? "جاري الحفظ..." : "حفظ الجامعة"}
          </button>
        </form>
      ) : null}

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSuccess(null);
          createCourseMutation.mutate();
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-right">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              عنوان الدورة
            </span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: أساسيات الأمن السيبراني"
              required
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white"
            />
          </label>

          <label className="block text-right">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              المحاضر الرئيسي
            </span>
            <select
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none focus:border-[#f5a524]/30 focus:bg-white"
            >
              <option value="">اختر المحاضر (اختياري)</option>
              {(instructorsQuery.data ?? []).map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-right">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              الجامعة المسموح بها
            </span>
            <select
              value={universityId}
              onChange={(event) => setUniversityId(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none focus:border-[#f5a524]/30 focus:bg-white"
            >
              <option value="" disabled>
                اختر الجامعة
              </option>
              {(universitiesQuery.data ?? []).map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-right">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              تكلفة MET
            </span>
            <input
              type="number"
              min={0}
              value={metCost}
              onChange={(event) => setMetCost(event.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none focus:border-[#f5a524]/30 focus:bg-white"
            />
          </label>

          <label className="block text-right md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              المستوى
            </span>
            <select
              value={level}
              onChange={(event) =>
                setLevel(event.target.value as typeof level)
              }
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
            >
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </label>
        </div>

        <label className="block text-right">
          <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
            الوصف
          </span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="اكتب وصفاً مختصراً للدورة وأهدافها التعليمية..."
            className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white"
          />
        </label>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {success ? <p className="text-sm text-[#14b8a6]">{success}</p> : null}

        <div className="flex justify-end border-t border-[#f1f5f9] pt-5">
          <button
            type="submit"
            disabled={createCourseMutation.isPending}
            className="rounded-2xl bg-[#f5a524] px-6 py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] disabled:opacity-70"
          >
            {createCourseMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر الدورة"}
          </button>
        </div>
      </form>
    </section>
  );
};
