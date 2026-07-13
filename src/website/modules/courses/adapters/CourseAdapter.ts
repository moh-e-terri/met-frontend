import type { CourseDto } from '../dto/CourseDto';
import type { Course } from '../entities/Course';

export const courseAdapter = (dto: CourseDto): Course => {
  return {
    id: String(dto.id),
    name: dto.course_name,
    description: dto.course_description,
    price: dto.price_amount,
    instructorId: String(dto.instructor_id),
  };
};
