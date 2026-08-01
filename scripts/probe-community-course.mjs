const API = "https://met-efgo.onrender.com/api/v1";
const BASE = "https://met-efgo.onrender.com";

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
  console.log(`[${res.status}] ${method} ${path}`, params || "", json.message || "");
  console.log(JSON.stringify(json.data ?? json, null, 2).slice(0, 1200));
  return { res, json };
}

const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();
const i = js.indexOf('"/community/posts"');
console.log("swagger community/posts @", i);
if (i >= 0) console.log(js.slice(i, i + 2200));

const teacher = await login("teacher10@gmail.com", "123456");
const courseId = "6a50b07c38df697a23eb821b";
const stamp = Date.now();

console.log("\n=== create with courseId+tag ===");
const created = await req("POST", "/community/posts", teacher, {
  content: `[QA Phase2] course-post-${stamp}`,
  tag: `course:${courseId}`,
  courseId,
});

const post =
  created.json?.data?.post ||
  created.json?.data ||
  (Array.isArray(created.json?.data?.posts) ? created.json.data.posts[0] : null);
console.log("created fields:", {
  id: post?._id || post?.id,
  tag: post?.tag,
  courseId: post?.courseId,
  content: post?.content,
});

console.log("\n=== list filters ===");
for (const params of [
  { page: 1, limit: 5 },
  { page: 1, limit: 20, courseId },
  { page: 1, limit: 20, course: courseId },
  { page: 1, limit: 20, tag: `course:${courseId}` },
  { page: 1, limit: 20, community: "course", courseId },
  { page: 1, limit: 20, scope: "course", courseId },
  { page: 1, limit: 20, type: "course", courseId },
]) {
  await req("GET", "/community/posts", teacher, null, params);
}

console.log("\n=== create WITHOUT courseId (general) ===");
await req("POST", "/community/posts", teacher, {
  content: `general-post-${stamp}`,
});
