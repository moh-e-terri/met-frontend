/**
 * Verify PUT /instructor/profile + hunt student profile update + avatar.
 */
const BASE = "https://met-efgo.onrender.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || email);
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
  console.log(`[${res.status}] ${method} ${path}`, json.message || "", JSON.stringify(json.data || {}).slice(0, 400));
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const teacher = await login("teacher10@gmail.com", "123456");
  const student = await login("student10@gmail.com", "123456");
  const admin = await login("admin1@edu.com", "123456789");

  // Verify instructor profile update fields
  console.log("\n=== Instructor PUT field matrix ===");
  await req("PUT", "/instructor/profile", {
    token: teacher.token,
    body: {
      phoneNumber: "0500000000",
      bio: "bio-probe-" + Date.now(),
      paypalAccount: "teacher10@paypal.com",
      firstName: "Teacher10",
      secondName: "Bla",
      familyName: "Bla",
    },
  });
  await sleep(500);
  const after = await req("GET", "/instructor/profile", { token: teacher.token });
  console.log(
    "after fields:",
    JSON.stringify(
      {
        phone: after.json?.data?.instructor?.phoneNumber,
        bio: after.json?.data?.instructor?.bio,
        paypal: after.json?.data?.instructor?.paypalAccount,
        profileImage: after.json?.data?.user?.profileImage,
        firstName: after.json?.data?.user?.firstName,
      },
      null,
      2,
    ),
  );

  // Tiny PNG multipart with various field names on instructor
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  console.log("\n=== Instructor avatar fields ===");
  for (const field of ["profileImage", "avatar", "image", "photo", "file"]) {
    const fd = new FormData();
    fd.append(field, new Blob([png], { type: "image/png" }), `a-${field}.png`);
    fd.append("bio", "keep-bio");
    await req("PUT", "/instructor/profile", { token: teacher.token, formData: fd });
    await sleep(400);
    const check = await req("GET", "/instructor/profile", { token: teacher.token });
    console.log("  => profileImage now:", check.json?.data?.user?.profileImage);
    await sleep(300);
  }

  // Student profile update hunt
  console.log("\n=== Student profile update hunt ===");
  for (const [method, path, body] of [
    ["PUT", "/student/profile", { firstName: "Mohammed" }],
    ["PUT", "/student/me", { firstName: "Mohammed" }],
    ["PUT", "/students/profile", { firstName: "Mohammed" }],
    ["PATCH", "/student/me", { firstName: "Mohammed" }],
    ["PUT", "/auth/profile", { firstName: "Mohammed" }],
    ["PUT", "/users/profile", { firstName: "Mohammed" }],
    ["PUT", "/profile", { firstName: "Mohammed" }],
    ["PUT", "/me", { firstName: "Mohammed" }],
    ["PUT", "/student/account", { firstName: "Mohammed" }],
    ["PUT", "/account/profile", { firstName: "Mohammed" }],
  ]) {
    await req(method, path, { token: student.token, body });
    await sleep(250);
  }

  // Admin update student/instructor hunt beyond swagger
  console.log("\n=== Admin update hunt ===");
  const students = await req("GET", "/admin/students?page=1&limit=1", { token: admin.token });
  const s =
    students.json?.data?.students?.[0] ||
    students.json?.data?.[0] ||
    (Array.isArray(students.json?.data) ? students.json.data[0] : null);
  const sid = s?._id;
  const uid = typeof s?.userId === "object" ? s.userId._id : s?.userId;
  console.log("student ids", sid, uid);

  for (const path of [
    `/admin/students/${sid}/profile`,
    `/admin/students/${sid}/update`,
    `/admin/users/${uid}`,
    `/admin/users/${uid}/profile`,
    `/admin/profile/students/${sid}`,
    `/admin/profile/users/${uid}`,
  ].filter((p) => !p.includes("undefined"))) {
    await req("PUT", path, { token: admin.token, body: { firstName: "abdallah" } });
    await req("PATCH", path, { token: admin.token, body: { firstName: "abdallah" } });
    await sleep(200);
  }

  // Check if admin can call instructor profile? unlikely
  await req("PUT", "/instructor/profile", {
    token: admin.token,
    body: { bio: "admin-try" },
  });

  // Restore teacher bio lightly
  await req("PUT", "/instructor/profile", {
    token: teacher.token,
    body: { bio: after.json?.data?.instructor?.bio || "" },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
