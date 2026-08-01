const API = "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data.accessToken;
}

async function req(method, path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  console.log(`\n[${res.status}] ${method} ${path}`, json.message || "");
  console.log(JSON.stringify(json.data ?? json, null, 2).slice(0, 2500));
  return { res, json };
}

const student = await login("student10@gmail.com", "123456");
const teacher = await login("teacher10@gmail.com", "123456");

// Find a course the student is enrolled in
const dash = await req("GET", "/student/dashboard", student);
const enrolled =
  dash.json?.data?.enrolledCourses ||
  dash.json?.data?.courses ||
  dash.json?.data?.student?.enrolledCourses ||
  [];
console.log(
  "enrolled sample",
  JSON.stringify(enrolled).slice(0, 400),
);

// Try known course
let courseId = "6a50b07c38df697a23eb821b";
const list = await req("GET", `/courses/${courseId}/exams`, student);

const exams = Array.isArray(list.json?.data)
  ? list.json.data
  : list.json?.data?.exams || [];
console.log("exam count", exams.length);
const exam = exams[0];
if (exam) {
  console.log("exam keys", Object.keys(exam));
  console.log(
    "questions sample",
    JSON.stringify(exam.questions, null, 2)?.slice(0, 1500),
  );
}

const examId = exam?._id || exam?.id;
if (examId) {
  for (const path of [
    `/courses/${courseId}/exams/${examId}`,
    `/courses/${courseId}/exams/${examId}/start`,
    `/student/courses/${courseId}/exams/${examId}`,
  ]) {
    await req("GET", path, student);
  }
  await req("POST", `/courses/${courseId}/exams/${examId}/start`, student, {});
}

// swagger exam paths
const js = await (
  await fetch("https://met-efgo.onrender.com/api-docs/swagger-ui-init.js")
).text();
const paths = [...js.matchAll(/"(\/[^"]*exam[^"]*)"/gi)].map((m) => m[1]);
console.log("\nexam paths:\n", [...new Set(paths)].join("\n"));
const i = js.indexOf('"/courses/{courseId}/exams/{examId}/submit"');
if (i >= 0) console.log(js.slice(i, i + 1200));
