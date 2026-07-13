import { courseApi } from '../infrastructure/api/CourseApi';
import { courseAdapter } from '../adapters/CourseAdapter';
import type { Course } from '../entities/Course';

export const courseRepository = {
  getAll: async (): Promise<Course[]> => {
    const dtos = await courseApi.getCourses();
    return dtos.map(courseAdapter);
  },
  getById: async (id: string): Promise<Course> => {
    const dto = await courseApi.getCourseById(id);
    return courseAdapter(dto);
  },
};
