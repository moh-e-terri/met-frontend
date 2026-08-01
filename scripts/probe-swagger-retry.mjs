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
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  console.log(`[${res.status}] ${method} ${path}`, json.message, JSON.stringify(json).slice(0, 350));
  return json;
}

const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();

function dumpAround(label, needle, size = 1500) {
  const i = js.indexOf(needle);
  console.log(`\n=== ${label} @ ${i} ===`);
  if (i >= 0) console.log(js.slice(i, i + size));
}

dumpAround("student profile", '"/student/profile"');
dumpAround("admin students id", '"/admin/students/{id}"');
dumpAround("admin profile", "admin/profile");
dumpAround("instructor students edit", "تعديل بيانات طالب");
dumpAround("instructor student", "Instructor");

// search for teacher edit student summary
for (const term of [
  "تعديل الملف الشخصي للطالب",
  "تعديل بيانات طالب",
  "instructor/students",
  "/admin/profile",
  "profileImage",
]) {
  let from = 0;
  let n = 0;
  while (n < 5) {
    const i = js.indexOf(term, from);
    if (i < 0) break;
    console.log(`\nFOUND ${term} @ ${i}:`, js.slice(Math.max(0, i - 80), i + 120).replace(/\s+/g, " "));
    from = i + term.length;
    n += 1;
  }
}

const student = await login("student10@gmail.com", "123456");
const admin = await login("admin1@edu.com", "123456789");
const teacher = await login("teacher10@gmail.com", "123456");

console.log("\n=== RETRY documented endpoints ===");
await req("PUT", "/student/profile", student, {
  firstName: "Mohammed",
  secondName: "E.",
  familyName: "Alterri",
  profileImage:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
});

await req("PATCH", "/admin/students/6a4e516a4d71aabcc385eaa4", admin, {
  firstName: "Mohammed",
  secondName: "E.",
  familyName: "Alterri",
});

await req("PUT", "/admin/students/6a4e516a4d71aabcc385eaa4", admin, {
  firstName: "Mohammed",
  secondName: "E.",
  familyName: "Alterri",
});

await req("GET", "/admin/students/6a4e516a4d71aabcc385eaa4", admin);

// Maybe id is user id?
await req("PATCH", "/admin/students/6a4e51684d71aabcc385eaa2", admin, {
  firstName: "Mohammed",
  secondName: "E.",
  familyName: "Alterri",
});
