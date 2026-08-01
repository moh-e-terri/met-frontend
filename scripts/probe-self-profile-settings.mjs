/**
 * Focused probe: self profile update + avatar for student/teacher.
 * Run: node scripts/probe-self-profile-settings.mjs
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
  if (!res.ok) throw new Error(`${email}: ${json.message || res.status}`);
  return { token: json.data.accessToken, user: json.data.user };
}

async function req(method, path, { token, body, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });
  const json = await res.json().catch(() => ({}));
  console.log(`[${res.status}] ${method} ${path} — ${json.message || ""}`);
  if (json.data) {
    const snippet = JSON.stringify(json.data).slice(0, 500);
    console.log("  data:", snippet);
  }
  return { ok: res.ok, status: res.status, json };
}

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function main() {
  const student = await login("student10@gmail.com", "123456");
  const teacher = await login("teacher10@gmail.com", "123456");

  console.log("\n=== STUDENT reads ===");
  await req("GET", "/auth/me", { token: student.token });
  await req("GET", "/student/profile", { token: student.token });

  console.log("\n=== STUDENT update JSON ===");
  for (const [method, path, body] of [
    ["PUT", "/student/profile", { firstName: "Mohammed", secondName: "E.", familyName: "Alterri" }],
    ["PATCH", "/student/profile", { firstName: "Mohammed" }],
    ["PUT", "/auth/me", { firstName: "Mohammed" }],
    ["PATCH", "/auth/me", { firstName: "Mohammed" }],
    ["PUT", "/auth/profile", { firstName: "Mohammed" }],
    ["PUT", "/users/me", { firstName: "Mohammed" }],
    ["PUT", "/profile", { firstName: "Mohammed" }],
  ]) {
    await req(method, path, { token: student.token, body });
    await sleep(200);
  }

  console.log("\n=== STUDENT avatar multipart ===");
  for (const field of ["profileImage", "avatar", "image", "photo"]) {
    const fd = new FormData();
    fd.append(field, new Blob([png], { type: "image/png" }), "avatar.png");
    fd.append("firstName", "Mohammed");
    await req("PUT", "/student/profile", { token: student.token, formData: fd });
    await sleep(250);
  }
  await req("GET", "/auth/me", { token: student.token });
  await req("GET", "/student/profile", { token: student.token });

  console.log("\n=== TEACHER reads ===");
  await req("GET", "/auth/me", { token: teacher.token });
  await req("GET", "/instructor/profile", { token: teacher.token });

  console.log("\n=== TEACHER update JSON ===");
  const marker = `bio-${Date.now()}`;
  await req("PUT", "/instructor/profile", {
    token: teacher.token,
    body: {
      firstName: "Teacher10",
      secondName: "Bla",
      familyName: "Bla",
      phoneNumber: "0599999999",
      bio: marker,
      paypalAccount: "teacher10@paypal.test",
    },
  });
  await sleep(300);
  const after = await req("GET", "/instructor/profile", { token: teacher.token });
  console.log("  bio saved?", after.json?.data?.instructor?.bio === marker);
  console.log("  phone saved?", after.json?.data?.instructor?.phoneNumber);
  console.log("  paypal saved?", after.json?.data?.instructor?.paypalAccount);
  console.log("  names:", after.json?.data?.user?.firstName, after.json?.data?.user?.fullName);

  console.log("\n=== TEACHER avatar multipart ===");
  for (const field of ["profileImage", "avatar", "image"]) {
    const fd = new FormData();
    fd.append(field, new Blob([png], { type: "image/png" }), `t-${field}.png`);
    fd.append("bio", marker);
    await req("PUT", "/instructor/profile", { token: teacher.token, formData: fd });
    await sleep(300);
    const check = await req("GET", "/instructor/profile", { token: teacher.token });
    console.log(`  after ${field}: profileImage=`, check.json?.data?.user?.profileImage);
  }

  // Restore milder bio
  await req("PUT", "/instructor/profile", {
    token: teacher.token,
    body: { bio: "" },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
