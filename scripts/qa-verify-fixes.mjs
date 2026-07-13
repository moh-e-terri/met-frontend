import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://met-efgo.onrender.com/api/v1';
const __dirname = dirname(fileURLToPath(import.meta.url));
const courseId = '6a50b07c38df697a23eb821b';
const fixturesDir = join(__dirname, 'fixtures');
const minimalMp4Path = join(fixturesDir, 'qa-lesson.mp4');

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'login failed');
  return json.data.accessToken;
}

function mapRevenueDistribution(stats) {
  const finance = stats.finance ?? {};
  const totalIncome = Number(finance.totalIncomeMET ?? finance.totalIncome ?? 0);
  const reserved = Number(finance.totalReservedMET ?? finance.totalReserved ?? 0);
  const netProfit = Number(finance.netProfitMET ?? finance.netProfit ?? 0);
  const instructorShare = totalIncome > 0 && netProfit >= 0 ? Math.max(totalIncome - netProfit, 0) : 0;
  const platformShare = netProfit > 0 ? Math.max(netProfit - reserved, 0) : Math.max(totalIncome - instructorShare - reserved, 0);
  const total = Math.max(instructorShare + platformShare + reserved, totalIncome, 1);
  const pct = (v) => Math.round((v / total) * 100);
  return [
    { label: 'instructor', percentage: pct(instructorShare), amount: instructorShare },
    { label: 'platform', percentage: pct(platformShare), amount: platformShare },
    { label: 'reserved', percentage: pct(reserved), amount: reserved },
  ];
}

async function main() {
  mkdirSync(fixturesDir, { recursive: true });
  writeFileSync(
    minimalMp4Path,
    Buffer.from(
      '000000186674797069736F6D0000020069736F6D69736F32617663316D70343100000008' +
        '6D64617400000000',
      'hex',
    ),
  );

  const teacherToken = await login('teacher10@gmail.com', '123456');
  const fd = new FormData();
  fd.append('title', `QA Lesson ${Date.now()}`);
  fd.append('duration', '120');
  fd.append('order', '1');
  fd.append('isPublished', 'true');
  fd.append('video', new Blob([readFileSync(minimalMp4Path)], { type: 'video/mp4' }), 'qa-lesson.mp4');

  const uploadRes = await fetch(`${BASE}/courses/${courseId}/lessons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: fd,
  });
  const uploadJson = await uploadRes.json();
  console.log('UPLOAD', uploadRes.status, uploadJson.message || 'ok');

  const lessonsRes = await fetch(`${BASE}/courses/${courseId}/lessons`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const lessonsJson = await lessonsRes.json();
  const lessons = Array.isArray(lessonsJson.data)
    ? lessonsJson.data
    : lessonsJson.data?.lessons ?? [];
  console.log('LESSONS', lessons.length, lessons.map((l) => ({ id: l._id || l.id, title: l.title, video: l.videoUrl || l.video })));

  const adminToken = await login('admin1@edu.com', '123456789');
  const stats = await (await fetch(`${BASE}/admin/stats`, { headers: { Authorization: `Bearer ${adminToken}` } })).json();
  const revenue = mapRevenueDistribution(stats.data ?? {});
  console.log('REVENUE', revenue);

  const studentToken = await login('student10@gmail.com', '123456');
  const dash = await (await fetch(`${BASE}/student/dashboard`, { headers: { Authorization: `Bearer ${studentToken}` } })).json();
  const enrolled = dash.data?.enrolledCourses ?? [];
  console.log('STUDENT_ENROLLED', enrolled.length, enrolled[0]?.title || enrolled[0]?.course?.title);

  const contentRes = await fetch(`${BASE}/student/courses/${courseId}/content`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const contentJson = await contentRes.json();
  const contentLessons = Array.isArray(contentJson.data?.lessons)
    ? contentJson.data.lessons
    : contentJson.data?.lessons ?? [];
  console.log(
    'STUDENT_CONTENT',
    contentRes.status,
    contentLessons.length,
    'lessons with video:',
    contentLessons.filter((lesson) => lesson.video || lesson.videoUrl).length,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
