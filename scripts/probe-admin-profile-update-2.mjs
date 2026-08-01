/**
 * Focused probe: profile payloads + remaining update/upload paths.
 * Run: node scripts/probe-admin-profile-update-2.mjs
 */
const BASE = process.env.API_URL || "https://met-efgo.onrender.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `login failed ${email}`);
  return { token: json.data?.accessToken, user: json.data?.user };
}

async function req(method, path, { token, body, formData, label } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData ? formData : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  console.log(`[${res.status}] ${label || `${method} ${path}`} — ${json.message || ""}`);
  return { ok: res.ok, status: res.status, json };
}

function deepKeys(obj, prefix = "", depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 3) return [];
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return [path, ...deepKeys(v, path, depth + 1)];
    }
    return [`${path}=${Array.isArray(v) ? `[${v.length}]` : JSON.stringify(v)?.slice(0, 60)}`];
  });
}

async function main() {
  const admin = await login("admin1@edu.com", "123456789");
  const student = await login("student10@gmail.com", "123456");
  const teacher = await login("teacher10@gmail.com", "123456");

  console.log("\n=== auth/me student fields ===");
  const me = await req("GET", "/auth/me", { token: student.token });
  console.log(deepKeys(me.json?.data?.user || {}).join("\n"));

  console.log("\n=== student/profile ===");
  const sp = await req("GET", "/student/profile", { token: student.token });
  console.log(JSON.stringify(sp.json?.data, null, 2)?.slice(0, 2500));

  console.log("\n=== instructor/profile ===");
  const ip = await req("GET", "/instructor/profile", { token: teacher.token });
  console.log(JSON.stringify(ip.json?.data, null, 2)?.slice(0, 2500));

  // Get instructor detail via admin
  const list = await req("GET", "/admin/instructors?page=1&limit=1", { token: admin.token });
  const row = list.json?.data?.instructors?.[0] || list.json?.data?.[0];
  const instructorId = row?._id;
  console.log("\n=== admin instructor detail ===", instructorId);
  if (instructorId) {
    const detail = await req("GET", `/admin/instructors/${instructorId}`, { token: admin.token });
    console.log(JSON.stringify(detail.json?.data, null, 2)?.slice(0, 3000));
  }

  await sleep(2000);

  console.log("\n=== More update paths ===");
  const paths = [
    ["PATCH", "/instructor/profile", teacher.token, { bio: "probe" }],
    ["PUT", "/instructor/profile", teacher.token, { bio: "probe" }],
    ["PATCH", "/student/profile", student.token, { universityId: undefined }],
    ["POST", "/student/profile", student.token, { firstName: "Student" }],
    ["POST", "/auth/update-me", student.token, { firstName: "Student" }],
    ["PATCH", "/auth/update-me", student.token, { firstName: "Student" }],
    ["PUT", "/auth/update-me", student.token, { firstName: "Student" }],
    ["PATCH", `/admin/instructors/${instructorId}`, admin.token, { bio: "probe" }],
    ["PUT", `/admin/instructors/${instructorId}`, admin.token, { bio: "probe" }],
    ["PATCH", `/admin/instructors/${instructorId}/profile`, admin.token, { bio: "probe" }],
    ["PUT", `/admin/instructors/${instructorId}/profile`, admin.token, { bio: "probe" }],
  ];

  for (const [method, path, token, body] of paths) {
    if (!path.includes("undefined")) {
      await req(method, path, { token, body });
      await sleep(300);
    }
  }

  await sleep(3000);

  console.log("\n=== Multipart on known profile routes ===");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  for (const [method, path, token, field] of [
    ["POST", "/student/profile", student.token, "profileImage"],
    ["PUT", "/student/profile", student.token, "profileImage"],
    ["PATCH", "/student/profile", student.token, "profileImage"],
    ["POST", "/instructor/profile", teacher.token, "profileImage"],
    ["PUT", "/instructor/profile", teacher.token, "profileImage"],
    ["PATCH", "/instructor/profile", teacher.token, "profileImage"],
    ["POST", "/auth/me", student.token, "profileImage"],
    ["POST", "/upload", student.token, "file"],
    ["POST", "/uploads", student.token, "file"],
    ["POST", "/media/upload", student.token, "file"],
    ["POST", "/files/upload", student.token, "file"],
    ["POST", "/admin/upload", admin.token, "file"],
  ]) {
    const fd = new FormData();
    fd.append(field, new Blob([png], { type: "image/png" }), "probe.png");
    fd.append("firstName", "Student");
    await req(method, path, {
      token,
      formData: fd,
      label: `${method} ${path} multipart ${field}`,
    });
    await sleep(400);
  }

  // Try swagger/openapi
  console.log("\n=== Docs ===");
  for (const p of ["/docs", "/swagger", "/openapi.json", "/api-docs", "/swagger.json"]) {
    await req("GET", p.replace(/^\/api\/v1/, "") || p, { token: admin.token }).catch(() => {});
  }
  // docs might be outside /api/v1
  for (const url of [
    "https://met-efgo.onrender.com/docs",
    "https://met-efgo.onrender.com/api-docs",
    "https://met-efgo.onrender.com/swagger",
    "https://met-efgo.onrender.com/openapi.json",
  ]) {
    const res = await fetch(url);
    console.log(`[${res.status}] ${url}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
