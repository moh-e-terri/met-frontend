import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  adminQueryKeys,
  fetchAdminInstructors,
  fetchAdminUniversities,
  type UpdateAdminCoursePayload,
} from "@/admin/api";
import {
  COURSE_IMAGE_PRESETS,
  type AdminCatalogCourse,
} from "../data/mockAdminCourses";
import { AdminCourseImagePicker } from "./AdminCourseImagePicker";
import { AdminModal } from "./AdminModal";

interface AdminCourseEditModalProps {
  course: AdminCatalogCourse | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateAdminCoursePayload) => Promise<unknown>;
  isSubmitting?: boolean;
  error?: string | null;
}

export const AdminCourseEditModal = ({
  course,
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
}: AdminCourseEditModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [metCost, setMetCost] = useState("50");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner",
  );
  const [thumbnail, setThumbnail] = useState<string>(COURSE_IMAGE_PRESETS[0]);

  const instructorsQuery = useQuery({
    queryKey: adminQueryKeys.instructorOptions,
    queryFn: () => fetchAdminInstructors({ limit: 100 }).then((result) => result.items),
    enabled: open,
  });

  const universitiesQuery = useQuery({
    queryKey: adminQueryKeys.universities(),
    queryFn: () => fetchAdminUniversities(),
    enabled: open,
  });

  useEffect(() => {
    if (!course || !open) return;
    setTitle(course.title);
    setDescription(course.description ?? "");
    setInstructorId(course.instructorId ?? "");
    setUniversityId(course.universityIds?.[0] ?? "");
    setMetCost(String(course.metCost ?? 50));
    setLevel(course.level ?? "beginner");
    setThumbnail(course.image || COURSE_IMAGE_PRESETS[0]);
  }, [course, open]);

  if (!course) return null;

  return (
    <AdminModal
      open={open}
      title="تعديل المقرر"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#e2e8f0] px-5 py-2.5 text-sm font-bold text-[#64748b]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="admin-edit-course-form"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      }
    >
      <form
        id="admin-edit-course-form"
        className="space-y-5 text-right"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            instructorId: instructorId || undefined,
            allowedUniversities: universityId ? [universityId] : [],
            metCost: metCost ? Number(metCost) : undefined,
            level,
            thumbnail: thumbnail || undefined,
          });
        }}
      >
        <AdminCourseImagePicker value={thumbnail} onChange={setThumbnail} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              عنوان الدورة
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              المحاضر
            </span>
            <select
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
            >
              <option value="">بدون محاضر</option>
              {(instructorsQuery.data ?? []).map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
              الجامعة
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

          <label className="block">
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

          <label className="block md:col-span-2">
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

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#0f172a]">
            الوصف
          </span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
          />
        </label>

        {(course.enrolledCount ?? 0) > 0 ? (
          <p className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#c2410c]">
            هذا المقرر لديه طلاب مسجّلون. إن لم يدعم الخادم التعديل المباشر،
            لن يتم حفظ التغييرات للحفاظ على بيانات التسجيل.
          </p>
        ) : null}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </form>
    </AdminModal>
  );
};
