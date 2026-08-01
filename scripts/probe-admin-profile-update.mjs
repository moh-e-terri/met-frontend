/**
 * Probe admin/student/instructor profile update + avatar endpoints.
 * Run: node scripts/probe-admin-profile-update.mjs
 */
const BASE = process.env.API_URL || "https://met-efgo.onrender.com/api/v1";

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
    json = { raw: text.slice(0, 300) };
  }
  const line = `[${res.status}] ${label || `${method} ${path}`} — ${json.message || json.status || res.statusText}`;
  console.log(line);
  if (json?.data && typeof json.data === "object" && !Array.isArray(json.data)) {
    const keys = Object.keys(json.data).slice(0, 20);
    if (keys.length) console.log("   data keys:", keys.join(", "));
  }
  return { ok: res.ok, status: res.status, json };
}

function pickList(json) {
  const data = json?.data;
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of ["students", "instructors", "items", "docs", "users"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

function pickId(obj) {
  if (!obj || typeof obj !== "object") return "";
  return obj._id || obj.id || "";
}

function flattenPerson(item) {
  const student = item?.student && typeof item.student === "object" ? item.student : item;
  const user =
    student?.userId && typeof student.userId === "object"
      ? student.userId
      : item?.userId && typeof item.userId === "object"
        ? item.userId
        : student;
  return {
    profileId: pickId(student),
    userId: typeof student?.userId === "string" ? student.userId : pickId(user),
    email: user?.email || student?.email || item?.email,
    firstName: user?.firstName || student?.firstName,
  };
}

async function main() {
  console.log("API:", BASE);
  const admin = await login("admin1@edu.com", "123456789");
  const student = await login("student10@gmail.com", "123456");
  const teacher = await login("teacher10@gmail.com", "123456");
  console.log("admin user:", pickId(admin.user), admin.user?.email);
  console.log("student auth id:", pickId(student.user), student.user?.email);
  console.log("teacher auth id:", pickId(teacher.user), teacher.user?.email);

  const studentsRes = await req("GET", "/admin/students?page=1&limit=5", {
    token: admin.token,
    label: "GET /admin/students",
  });
  const instructorsRes = await req("GET", "/admin/instructors?page=1&limit=5", {
    token: admin.token,
    label: "GET /admin/instructors",
  });

  const studentRow = pickList(studentsRes.json)[0];
  const instructorRow = pickList(instructorsRes.json)[0];
  const s = flattenPerson(studentRow);
  const i = flattenPerson(instructorRow);
  console.log("\nSample student ids:", s);
  console.log("Sample instructor ids:", i);
  console.log("Sample student keys:", studentRow ? Object.keys(studentRow) : []);
  console.log("Sample instructor keys:", instructorRow ? Object.keys(instructorRow) : []);

  // Detail GETs
  console.log("\n=== Detail GET ===");
  for (const id of [s.profileId, s.userId].filter(Boolean)) {
    await req("GET", `/admin/students/${id}`, { token: admin.token });
    await req("GET", `/students/${id}`, { token: admin.token });
    await req("GET", `/users/${id}`, { token: admin.token });
    await req("GET", `/admin/users/${id}`, { token: admin.token });
  }
  for (const id of [i.profileId, i.userId].filter(Boolean)) {
    await req("GET", `/admin/instructors/${id}`, { token: admin.token });
    await req("GET", `/instructors/${id}`, { token: admin.token });
  }

  // Self profile GET
  console.log("\n=== Self profile ===");
  await req("GET", "/auth/me", { token: student.token, label: "GET /auth/me (student)" });
  await req("GET", "/student/profile", { token: student.token });
  await req("GET", "/students/me", { token: student.token });
  await req("GET", "/users/me", { token: student.token });
  await req("GET", "/profile", { token: student.token });
  await req("GET", "/instructor/profile", { token: teacher.token });

  // PATCH/PUT candidates (safe no-op-ish: same firstName)
  const patchBodies = [
    { firstName: s.firstName || "Test" },
    { firstName: s.firstName || "Test", profileImage: "https://example.com/a.png" },
    { avatar: "https://example.com/a.png" },
    { profileImage: "https://example.com/a.png" },
  ];

  console.log("\n=== Student update candidates (admin) ===");
  for (const id of [s.profileId, s.userId].filter(Boolean)) {
    for (const method of ["PATCH", "PUT"]) {
      await req(method, `/admin/students/${id}`, {
        token: admin.token,
        body: patchBodies[0],
      });
      await req(method, `/admin/users/${id}`, {
        token: admin.token,
        body: patchBodies[0],
      });
      await req(method, `/users/${id}`, {
        token: admin.token,
        body: patchBodies[0],
      });
    }
  }

  console.log("\n=== Instructor update candidates (admin) ===");
  for (const id of [i.profileId, i.userId].filter(Boolean)) {
    for (const method of ["PATCH", "PUT"]) {
      await req(method, `/admin/instructors/${id}`, {
        token: admin.token,
        body: { firstName: i.firstName || "Teacher" },
      });
    }
  }

  console.log("\n=== Self update candidates (student) ===");
  const studentAuthId = pickId(student.user);
  for (const path of [
    "/auth/me",
    "/auth/update-profile",
    "/auth/profile",
    "/student/profile",
    "/students/me",
    "/users/me",
    "/profile",
    `/users/${studentAuthId}`,
    `/students/${studentAuthId}`,
  ]) {
    await req("PATCH", path, {
      token: student.token,
      body: { firstName: student.user?.firstName || "Student" },
    });
    await req("PUT", path, {
      token: student.token,
      body: { firstName: student.user?.firstName || "Student" },
    });
  }

  console.log("\n=== Avatar upload candidates (multipart) ===");
  // 1x1 png
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  const fieldNames = ["avatar", "profileImage", "image", "photo", "file"];
  const uploadPaths = [
    "/auth/avatar",
    "/auth/profile-image",
    "/auth/upload-avatar",
    "/users/avatar",
    "/users/me/avatar",
    "/student/avatar",
    "/student/profile/avatar",
    "/students/me/avatar",
    "/profile/avatar",
    "/upload/avatar",
    "/uploads/avatar",
    `/admin/students/${s.profileId}/avatar`,
    `/admin/students/${s.userId}/avatar`,
    `/admin/users/${s.userId}/avatar`,
    `/users/${studentAuthId}/avatar`,
    `/students/${s.profileId}/avatar`,
  ].filter((p) => !p.includes("undefined") && !p.includes("null"));

  for (const path of uploadPaths) {
    for (const field of fieldNames.slice(0, 2)) {
      const fd = new FormData();
      fd.append(field, new Blob([png], { type: "image/png" }), "probe-avatar.png");
      await req("POST", path, {
        token: path.includes("/admin/") ? admin.token : student.token,
        formData: fd,
        label: `POST ${path} field=${field}`,
      });
      await req("PATCH", path, {
        token: path.includes("/admin/") ? admin.token : student.token,
        formData: fd,
        label: `PATCH ${path} field=${field}`,
      });
    }
  }

  // Also try admin updating student with image URL
  if (s.profileId) {
    console.log("\n=== Admin set avatar URL on student ===");
    await req("PATCH", `/admin/students/${s.profileId}`, {
      token: admin.token,
      body: { profileImage: "https://met-efgo.onrender.com/uploads/probe.png" },
    });
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
