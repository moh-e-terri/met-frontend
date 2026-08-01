const BASE = "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return json.data?.accessToken || json.data?.token;
}

async function req(method, path, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, message: json.message, keys: Object.keys(json.data || {}), sample: Array.isArray(json.data) ? json.data[0] : json.data };
}

async function main() {
  const admin = await login("admin1@edu.com", "123456789");
  const teacher = await login("teacher10@gmail.com", "123456");
  const student = await login("student10@gmail.com", "123456");

  const list = await fetch(`${BASE}/admin/courses?limit=5`, {
    headers: { Authorization: `Bearer ${admin}` },
  }).then((r) => r.json());
  const course = (list.data || []).find((c) => (c.enrolledCount || 0) > 0) || (list.data || [])[0];
  const id = course?._id;
  console.log("course", id, course?.title, "enrolled", course?.enrolledCount);

  for (const [name, token] of [
    ["admin", admin],
    ["teacher", teacher],
    ["student", student],
  ]) {
    console.log(`\n=== ${name} ===`);
    console.log("lessons", await req("GET", `/courses/${id}/lessons`, token));
    console.log("students", await req("GET", `/instructor/courses/${id}/students`, token));
    console.log("exams", await req("GET", `/courses/${id}/exams`, token));
    console.log("assignments", await req("GET", `/courses/${id}/assignments`, token));
    console.log("student content", await req("GET", `/student/courses/${id}/content`, token));
  }
}

main().catch(console.error);
