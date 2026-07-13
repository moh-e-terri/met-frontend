const BASE = 'https://met-efgo.onrender.com/api/v1';
const COURSE_ID = process.argv[2] || '6a50b07c38df697a23eb821b';

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json.data.accessToken;
}

async function main() {
  const token = await login('teacher10@gmail.com', '123456');
  const fd = new FormData();
  fd.append('title', `Browser QA Lesson ${Date.now()}`);
  fd.append('duration', '120');
  fd.append('order', '99');
  fd.append('isPublished', 'true');
  const blob = new Blob(['fake-video-content'], { type: 'video/mp4' });
  fd.append('video', blob, 'qa-lesson.mp4');

  const res = await fetch(`${BASE}/courses/${COURSE_ID}/lessons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const json = await res.json();
  console.log('status:', res.status);
  console.log('message:', json.message || json.status);
  if (res.ok) {
    const lesson = json.data?.lesson || json.data;
    console.log('lessonId:', lesson?._id || lesson?.id);
    console.log('title:', lesson?.title);
  } else {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
