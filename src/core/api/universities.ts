import { apiClient, type ApiEnvelope } from "./client";

export interface University {
  id: string;
  name: string;
  nameEn?: string;
  city?: string;
  logo?: string | null;
}

interface ApiUniversity {
  _id?: string;
  id?: string;
  name?: string;
  nameEn?: string;
  city?: string;
  logo?: string | null;
}

interface UniversitiesResponseData {
  universities?: ApiUniversity[];
}

export async function getUniversities(): Promise<University[]> {
  const response =
    await apiClient.get<ApiEnvelope<UniversitiesResponseData | ApiUniversity[]>>(
      "/universities",
    );

  const rawData = response.data.data;
  const universities = Array.isArray(rawData)
    ? rawData
    : rawData.universities || [];

  return universities.map((university) => ({
    id: university._id || university.id || "",
    name: university.name || university.nameEn || "جامعة غير معروفة",
    nameEn: university.nameEn,
    city: university.city,
    logo: university.logo,
  }));
}
