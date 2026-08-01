import { getUniversities } from "./universities";
import { asArray, asRecord, pickId, pickString } from "./utils";

export function resolveCourseUniversityFields(course: Record<string, unknown>): {
  university?: string;
  universityId?: string;
} {
  const allowedUniversities = asArray(course.allowedUniversities);
  const firstAllowed = allowedUniversities[0];
  const firstAllowedRecord =
    typeof firstAllowed === "object" && firstAllowed ? asRecord(firstAllowed) : {};

  const universityRecord = asRecord(
    course.university ??
      (typeof course.universityId === "object" && course.universityId
        ? course.universityId
        : null) ??
      firstAllowedRecord,
  );

  const university = pickString(
    universityRecord.name,
    universityRecord.nameAr,
    universityRecord.nameEn,
    course.universityName,
    pickString(firstAllowedRecord.name, firstAllowedRecord.nameEn),
    typeof course.university === "string" ? course.university : "",
  );

  const universityId =
    pickId(universityRecord) ||
    pickId(firstAllowedRecord) ||
    (typeof course.universityId === "string" ? course.universityId : "") ||
    (typeof firstAllowed === "string" ? firstAllowed : "") ||
    undefined;

  return {
    university: university || undefined,
    universityId: universityId || undefined,
  };
}

export async function fillMissingUniversityNames<
  T extends { university?: string; universityId?: string },
>(courses: T[]): Promise<T[]> {
  const needsLookup = courses.some((course) => !course.university && course.universityId);
  if (!needsLookup) return courses;

  try {
    const universities = await getUniversities();
    const byId = new Map(universities.map((university) => [university.id, university.name]));

    return courses.map((course) => {
      if (course.university || !course.universityId) return course;
      const name = byId.get(course.universityId);
      return name ? { ...course, university: name } : course;
    });
  } catch {
    return courses;
  }
}
