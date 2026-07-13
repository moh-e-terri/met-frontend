const BASE = 'https://met-efgo.onrender.com/api/v1';
const COURSE_ID = process.argv[2] || '6a50b07c38df697a23eb821b';

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  const token = json?.data?.accessToken ?? json?.data?.token;
  if (!token) throw new Error(`Login failed: ${json?.message || res.status}`);
  return token;
}

async function main() {
  const token = await login('teacher10@gmail.com', '123456');
  const res = await fetch(`${BASE}/instructor/courses/${COURSE_ID}/students`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  console.log('status:', res.status);
  const data = json.data;
  if (Array.isArray(data)) {
    console.log('shape: array', 'count:', data.length);
    if (data[0]) console.log('first keys:', Object.keys(data[0]).join(', '));
    return;
  }
  if (data && typeof data === 'object') {
    console.log('shape: object', 'keys:', Object.keys(data).join(', '));
    const students = data.students || data.items || [];
    console.log('students count:', students.length);
    if (students[0]) console.log('first student keys:', Object.keys(students[0]).join(', '));
  }
}

main().catch((e) => {
  console.error(e?.cause?.message || e.message || e);
  process.exitCode = 1;
});
