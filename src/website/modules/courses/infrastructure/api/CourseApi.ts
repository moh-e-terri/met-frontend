import { apiClient } from '@/core/api/client';
import type { CourseDto } from '../../dto/CourseDto';

export const courseApi = {
  getCourses: async (): Promise<CourseDto[]> => {
    const { data } = await apiClient.get<CourseDto[]>('/courses');
    return data;
  },
  getCourseById: async (id: string): Promise<CourseDto> => {
    const { data } = await apiClient.get<CourseDto>(`/courses/${id}`);
    return data;
  },
};
