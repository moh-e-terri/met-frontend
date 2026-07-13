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
  const token = await login('admin1@edu.com', '123456789');
  const headers = { Authorization: `Bearer ${token}` };

  const statsRes = await fetch(`${BASE}/admin/stats`, { headers });
  const stats = await statsRes.json();
  console.log(JSON.stringify(stats.data, null, 2));

  const tt = await login('teacher10@gmail.com', '123456');
  const fd = new FormData();
  fd.append('title', 'Probe lesson');
  fd.append('duration', '600');
  fd.append('order', '1');
  fd.append('isPublished', 'true');
  const blob = new Blob(['fake'], { type: 'video/mp4' });
  for (const field of ['video', 'videoFile', 'file']) {
    const testFd = new FormData();
    testFd.append('title', 'Probe lesson');
    testFd.append('duration', '600');
    testFd.append('order', '1');
    testFd.append('isPublished', 'true');
    testFd.append(field, blob, 'test.mp4');
    const res = await fetch(`${BASE}/courses/6a50b07c38df697a23eb821b/lessons`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tt}` },
      body: testFd,
    });
    const json = await res.json();
    console.log(`field=${field}`, res.status, json.message || json.status);
  }
}

main().catch(console.error);
