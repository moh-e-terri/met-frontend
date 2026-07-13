import { useQuery } from '@tanstack/react-query';
import { courseRepository } from '../repository/CourseRepository';

export const useGetCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => courseRepository.getAll(),
  });
};
