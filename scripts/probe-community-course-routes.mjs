const BASE = "https://met-efgo.onrender.com";
const API = `${BASE}/api/v1`;
const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();
const paths = [...js.matchAll(/"(\/[^"]*community[^"]*)"/gi)].map((m) => m[1]);
console.log([...new Set(paths)].sort().join("\n"));

const teacherTok = (
  await (
    await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "teacher10@gmail.com", password: "123456" }),
    })
  ).json()
).data.accessToken;

const courseId = "6a50b07c38df697a23eb821b";
for (const [method, path, body] of [
  ["GET", `/courses/${courseId}/community`, null],
  ["GET", `/courses/${courseId}/community/posts`, null],
  ["POST", `/courses/${courseId}/community/posts`, { content: "x" }],
  ["GET", `/courses/${courseId}/posts`, null],
  ["POST", `/courses/${courseId}/posts`, { content: "x" }],
  ["GET", `/community/courses/${courseId}/posts`, null],
  ["POST", `/community/courses/${courseId}/posts`, { content: "x" }],
]) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${teacherTok}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  console.log(`[${res.status}] ${method} ${path}`, json.message || "");
}
