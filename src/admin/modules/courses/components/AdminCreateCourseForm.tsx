import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminQueryKeys,
  createAdminCourse,
  createAdminUniversity,
  fetchAdminInstructors,
  fetchAdminUniversities,
} from "@/admin/api";
import { AppModal } from "@/shared/components/AppModal";
import { COURSE_IMAGE_PRESETS } from "../data/mockAdminCourses";
import { AdminCourseImagePicker } from "./AdminCourseImagePicker";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

export const AdminCreateCourseForm = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [metCost, setMetCost] = useState("50");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner",
  );
  const [thumbnail, setThumbnail] = useState<string>(COURSE_IMAGE_PRESETS[0]);
  const [error, setError] = useState<string | null>(null);

  const [showUniversityForm, setShowUniversityForm] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [universityNameEn, setUniversityNameEn] = useState("");
  const [universityCity, setUniversityCity] = useState("");

  const instructorsQuery = useQuery({
    queryKey: adminQueryKeys.instructorOptions,
    queryFn: () =>
      fetchAdminInstructors({ limit: 100 }).then((result) => result.items),
    enabled: open,
  });

  const universitiesQuery = useQuery({
    queryKey: adminQueryKeys.universities(),
    queryFn: () => fetchAdminUniversities(),
    enabled: open,
  });

  const resetCourseForm = () => {
    setTitle("");
    setDescription("");
    setInstructorId("");
    setUniversityId("");
    setMetCost("50");
    setLevel("beginner");
    setThumbnail(COURSE_IMAGE_PRESETS[0]);
    setError(null);
    setShowUniversityForm(false);
  };

  const close = () => {
    setOpen(false);
    resetCourseForm();
  };

  const createCourseMutation = useMutation({
    mutationFn: () =>
      createAdminCourse({
        title: title.trim(),
        description: description.trim() || undefined,
        instructorId: instructorId || undefined,
        allowedUniversities: universityId ? [universityId] : [],
        metCost: metCost ? Number(metCost) : undefined,
        level,
        thumbnail: thumbnail || undefined,
      }),
    onSuccess: async () => {
      close();
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.courses({ limit: 100 }),
      });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "تعذر إنشاء الدورة",
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
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.universities(),
      });
    },
  });

  return (
    <>
      <section
        id="create-course-form"
        className="scroll-mt-24 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#fde8c8] bg-gradient-to-l from-[#fff7ed] to-white p-5 shadow-sm"
        dir="rtl"
      >
        <div className="flex items-center gap-3 text-right">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f5a524]/15">
            <AdminIcon
              src="/images/student/icon-book.svg"
              className="size-5 text-[#f5a524]"
            />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">إنشاء دورة جديدة</h2>
            <p className="mt-0.5 text-sm text-[#64748b]">
              افتح النموذج لإضافة مقرر وإسناده لمحاضر.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)]"
        >
          <AdminIcon src="/images/student/icon-add.svg" className="size-4 text-white" />
          <span>إنشاء مقرر</span>
        </button>
      </section>

      <AppModal
        open={open}
        onClose={() => {
          if (createCourseMutation.isPending) return;
          close();
        }}
        title="إنشاء دورة جديدة"
        description="أدخل بيانات المقرر الأساسية ثم احفظه."
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={close}
              disabled={createCourseMutation.isPending}
              className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="admin-create-course-form"
              disabled={createCourseMutation.isPending}
              className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
            >
              {createCourseMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر الدورة"}
            </button>
          </div>
        }
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowUniversityForm((value) => !value)}
            className="text-sm font-semibold text-[#3b82f6] hover:underline"
          >
            {showUniversityForm ? "إخفاء نموذج الجامعة" : "+ إضافة جامعة"}
          </button>
        </div>

        {showUniversityForm ? (
          <form
            className="mb-5 space-y-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
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
          id="admin-create-course-form"
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            createCourseMutation.mutate();
          }}
        >
          <AdminCourseImagePicker value={thumbnail} onChange={setThumbnail} />

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
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
              />
            </label>

            <label className="block text-right">
              <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
                المحاضر الرئيسي
              </span>
              <select
                value={instructorId}
                onChange={(event) => setInstructorId(event.target.value)}
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
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
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
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
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
              />
            </label>

            <label className="block text-right md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
                المستوى
              </span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as typeof level)}
                className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
              >
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </label>
          </div>

          <label className="block text-right">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">الوصف</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="اكتب وصفاً مختصراً للدورة وأهدافها التعليمية..."
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
            />
          </label>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </form>
      </AppModal>
    </>
  );
};
