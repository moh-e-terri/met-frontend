const BASE = 'https://met-efgo.onrender.com/api/v1';

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${email}: ${json.message}`);
  return json.data.accessToken;
}

async function main() {
  const admin = await login('admin1@edu.com', '123456789');
  const headers = {
    Authorization: `Bearer ${admin}`,
    'Content-Type': 'application/json',
  };

  const createRes = await fetch(`${BASE}/admin/courses`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `QA Phase2 Course ${Date.now()}`,
      description: 'QA test course for phase 2 browser testing',
      instructorId: '6a4e51e44d71aabcc385eadd',
      allowedUniversities: ['6a4c8d969e84a4b195b3f26f'],
      metCost: 30,
      level: 'beginner',
    }),
  });
  const created = await createRes.json();
  console.log('create course:', createRes.status, created.message || '');
  const courseId =
    created.data?._id ||
    created.data?.id ||
    created.data?.course?._id;
  console.log('courseId:', courseId);

  const student = await login('student10@gmail.com', '123456');
  const availRes = await fetch(`${BASE}/student/courses/available?page=1&limit=10`, {
    headers: { Authorization: `Bearer ${student}` },
  });
  const avail = await availRes.json();
  const list = Array.isArray(avail.data)
    ? avail.data
    : avail.data?.courses || [];
  console.log('student available courses:', list.length, list.map((c) => c.title));

  const teacher = await login('teacher10@gmail.com', '123456');
  const dashRes = await fetch(`${BASE}/instructor/dashboard`, {
    headers: { Authorization: `Bearer ${teacher}` },
  });
  const dash = await dashRes.json();
  console.log(
    'teacher dashboard courses:',
    dash.data?.courses?.length ?? 0,
    dash.data?.courses?.map((c) => c.title),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
