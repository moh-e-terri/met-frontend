const BASE = "https://met-efgo.onrender.com";
const API = `${BASE}/api/v1`;

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
  console.log(`[${res.status}] ${method} ${path} :: ${json.message || ""}`);
  return { status: res.status, json };
}

const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();
const paths = [...js.matchAll(/"(\/[^"]+)"\s*:\s*\{/g)].map((m) => m[1]);
console.log(
  "all paths with student|profile|admin:\n",
  [...new Set(paths)]
    .filter((p) => /student|profile|admin\/|instructor\//i.test(p))
    .sort()
    .join("\n"),
);

const teacher = await login("teacher10@gmail.com", "123456");
const admin = await login("admin1@edu.com", "123456789");
const sid = "6a4e516a4d71aabcc385eaa4"; // student profile id
const uid = "6a4e51684d71aabcc385eaa2";
const body = { firstName: "Mohammed", secondName: "E.", familyName: "Alterri" };

console.log("\n=== teacher trying student edits ===");
for (const [method, path] of [
  ["PATCH", `/instructor/students/${sid}`],
  ["PUT", `/instructor/students/${sid}`],
  ["PATCH", `/instructor/students/${uid}`],
  ["PUT", `/instructor/students/${uid}`],
  ["PATCH", `/instructor/students/${sid}/profile`],
  ["PUT", `/instructor/students/${sid}/profile`],
  ["PATCH", `/admin/students/${sid}`], // expect 403
  ["PATCH", `/instructor/courses/6a50b07c38df697a23eb821b/students/${sid}`],
  ["PUT", `/instructor/courses/6a50b07c38df697a23eb821b/students/${sid}`],
  ["PATCH", `/instructor/profile/students/${sid}`],
  ["PUT", `/students/${sid}`],
  ["PATCH", `/students/${sid}`],
]) {
  await req(method, path, teacher, body);
}

// Confirm admin patch still works + universityId
console.log("\n=== admin patch with profileImage ===");
await req("PATCH", `/admin/students/${sid}`, admin, {
  ...body,
  profileImage:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
});

// GET admin profile fields
await req("GET", "/admin/profile", admin);
await req("PUT", "/admin/profile", admin, {
  firstName: "Admin",
  secondName: "System",
  familyName: "One",
});
