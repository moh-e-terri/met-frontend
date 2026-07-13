import { useGetCourses } from '../hooks/useGetCourses';
import { PageMotion } from '@/shared/motion';
import { Button } from '@/shared/ui/button';

export const CoursesPage = () => {
  const { data: courses, isLoading, error } = useGetCourses();

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error loading courses</div>;

  return (
    <PageMotion>
      <h2 className="text-3xl font-bold mb-6">Our Courses</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <div key={course.id} className="border rounded-lg p-6 flex flex-col space-y-4">
            <h3 className="text-xl font-bold">{course.name}</h3>
            <p className="text-muted-foreground flex-1">{course.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">${course.price}</span>
              <Button size="sm">Enroll Now</Button>
            </div>
          </div>
        ))}
      </div>
    </PageMotion>
  );
};
