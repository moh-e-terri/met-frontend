const BASE = 'https://met-efgo.onrender.com/api/v1';

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return json.data.accessToken;
}

async function main() {
  const admin = await login('admin1@edu.com', '123456789');
  const stats = await (await fetch(`${BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${admin}` },
  })).json();
  console.log('finance', JSON.stringify(stats.data?.finance, null, 2));

  const teacher = await login('teacher10@gmail.com', '123456');
  const dash = await (await fetch(`${BASE}/instructor/dashboard`, {
    headers: { Authorization: `Bearer ${teacher}` },
  })).json();
  const courses = dash.data?.courses ?? [];
  console.log('teacher courses', courses.map((c) => ({ id: c._id || c.id, title: c.title })));

  const student = await login('student10@gmail.com', '123456');
  const studentDash = await (await fetch(`${BASE}/student/dashboard`, {
    headers: { Authorization: `Bearer ${student}` },
  })).json();
  console.log('student dash keys', Object.keys(studentDash.data ?? {}));
  const enrolled =
    studentDash.data?.enrolledCourses ??
    studentDash.data?.courses ??
    studentDash.data?.continueLearning ??
    [];
  console.log('student enrolled count', Array.isArray(enrolled) ? enrolled.length : 0);
  if (Array.isArray(enrolled) && enrolled[0]) {
    console.log('first enrolled', enrolled[0].title ?? enrolled[0].course?.title);
  }

  const courseId = courses[0]?._id || courses[0]?.id;
  if (courseId) {
    const lessons = await (await fetch(`${BASE}/courses/${courseId}/lessons`, {
      headers: { Authorization: `Bearer ${teacher}` },
    })).json();
    const list = Array.isArray(lessons.data)
      ? lessons.data
      : lessons.data?.lessons ?? [];
    console.log('lessons', list.length, list.map((l) => l.title));
  }
}

main().catch(console.error);
