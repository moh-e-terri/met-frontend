/**
 * Probe how to build a rich student profile for admin + teacher.
 */
const BASE = "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || email);
  return json.data.accessToken;
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  console.log(`[${res.status}] GET ${path} — ${json.message || ""}`);
  return { status: res.status, json };
}

const admin = await login("admin1@edu.com", "123456789");
const teacher = await login("teacher10@gmail.com", "123456");

const students = await get("/admin/students?page=1&limit=3", admin);
const list =
  students.json?.data?.students ||
  students.json?.data?.items ||
  (Array.isArray(students.json?.data) ? students.json.data : []);
const sample = list[0];
console.log("\nSample student keys:", sample ? Object.keys(sample) : []);
console.log("userId type:", typeof sample?.userId, sample?.userId && typeof sample.userId === "object" ? Object.keys(sample.userId) : sample?.userId);
console.log("enrolledCourses:", JSON.stringify(sample?.enrolledCourses)?.slice(0, 300));
console.log("metTransactions count:", sample?.metTransactions?.length);

const profileId = sample?._id;
const userId = typeof sample?.userId === "object" ? sample.userId._id : sample?.userId;

console.log("\n=== Admin detail candidates ===", { profileId, userId });
for (const path of [
  `/admin/students/${profileId}`,
  `/admin/students/${userId}`,
  `/admin/users/${userId}`,
  `/students/${profileId}`,
  `/students/${userId}`,
]) {
  await get(path, admin);
}

const courses = await get("/admin/courses?page=1&limit=50", admin);
const courseList =
  courses.json?.data?.courses ||
  courses.json?.data?.items ||
  (Array.isArray(courses.json?.data) ? courses.json.data : []);
console.log("admin courses count", courseList.length);

// Teacher dashboard courses
const dash = await get("/instructor/dashboard", teacher);
const tCourses =
  dash.json?.data?.courses ||
  dash.json?.data?.assignedCourses ||
  dash.json?.data?.recentCourses ||
  [];
console.log("\nteacher courses sample:", JSON.stringify(tCourses)?.slice(0, 400));

const courseIds = (Array.isArray(tCourses) ? tCourses : [])
  .map((c) => c._id || c.id || c.courseId)
  .filter(Boolean)
  .slice(0, 5);

console.log("teacher courseIds", courseIds);

for (const cid of courseIds) {
  const r = await get(`/instructor/courses/${cid}/students`, teacher);
  const st =
    r.json?.data?.students ||
    r.json?.data?.items ||
    (Array.isArray(r.json?.data) ? r.json.data : []);
  console.log(` course ${cid} students:`, st.length);
  if (st[0]) {
    console.log("  first student keys:", Object.keys(st[0]));
    console.log("  nested:", JSON.stringify(st[0]).slice(0, 350));
  }
}

// Can teacher hit admin students?
await get("/admin/students?page=1&limit=1", teacher);
await get(`/admin/students/${profileId}`, teacher);
