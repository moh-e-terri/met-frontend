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

async function req(method, path, token, body, params) {
  const url = new URL(`${API}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  console.log(`\n[${res.status}] ${method} ${path}`, params || "", "::", json.message || "");
  const data = json.data ?? json;
  console.log(JSON.stringify(data, null, 2).slice(0, 1500));
  return { res, json, data };
}

const teacher = await login("teacher10@gmail.com", "123456");
const student = await login("student10@gmail.com", "123456");
const courseId = "6a50b07c38df697a23eb821b";
const stamp = Date.now();

console.log("=== list course community ===");
await req("GET", `/community/courses/${courseId}/posts`, teacher, null, {
  page: 1,
  limit: 10,
});

console.log("=== create course post ===");
const created = await req(
  "POST",
  `/community/courses/${courseId}/posts`,
  teacher,
  { content: `course-scoped-${stamp}` },
);
const post = created.data?.post || created.data;
const postId = post?._id || post?.id;
console.log("created courseId field:", post?.courseId, "id:", postId);

console.log("=== list course again ===");
const courseList = await req("GET", `/community/courses/${courseId}/posts`, teacher, null, {
  page: 1,
  limit: 20,
});
const coursePosts = Array.isArray(courseList.data)
  ? courseList.data
  : courseList.data?.posts || [];
console.log(
  "found stamp?",
  JSON.stringify(coursePosts).includes(`course-scoped-${stamp}`),
  "count",
  coursePosts.length,
);

console.log("=== list GENERAL feed — should ideally NOT include course post ===");
const general = await req("GET", "/community/posts", teacher, null, {
  page: 1,
  limit: 30,
});
const generalPosts = Array.isArray(general.data)
  ? general.data
  : general.data?.posts || [];
const leaked = generalPosts.some(
  (p) =>
    p._id === postId ||
    p.id === postId ||
    String(p.content || "").includes(`course-scoped-${stamp}`),
);
console.log("leaked into general?", leaked);
console.log(
  "sample courseIds in general:",
  generalPosts.slice(0, 8).map((p) => ({
    id: p._id,
    courseId: p.courseId,
    content: String(p.content || "").slice(0, 40),
  })),
);

console.log("=== student create on course ===");
await req("POST", `/community/courses/${courseId}/posts`, student, {
  content: `student-course-${stamp}`,
});

console.log("=== create with attachments field ===");
await req("POST", `/community/courses/${courseId}/posts`, teacher, {
  content: `with-attach-${stamp}`,
  attachments: [],
});

// swagger snippet
const js = await (
  await fetch("https://met-efgo.onrender.com/api-docs/swagger-ui-init.js")
).text();
const i = js.indexOf("/community/courses/");
console.log("\nswagger courses community @", i);
if (i >= 0) console.log(js.slice(i - 50, i + 1800));
