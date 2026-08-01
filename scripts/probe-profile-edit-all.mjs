/**
 * Probe newly-enabled profile update endpoints for student/admin self
 * and admin/teacher editing students.
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
  const snippet = JSON.stringify(json).slice(0, 280);
  console.log(`[${res.status}] ${method} ${path} :: ${json.message || ""} :: ${snippet}`);
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const teacher = await login("teacher10@gmail.com", "123456");
  const student = await login("student10@gmail.com", "123456");
  const admin = await login("admin1@edu.com", "123456789");

  console.log("\n=== GET profiles ===");
  await req("GET", "/student/profile", { token: student.token });
  await req("GET", "/instructor/profile", { token: teacher.token });
  await req("GET", "/auth/me", { token: admin.token });

  console.log("\n=== Student self update candidates ===");
  const studentBodies = [
    { firstName: "Mohammed", secondName: "Probe", familyName: "Student" },
    { firstName: "Mohammed", profileImage: "https://example.com/a.png" },
  ];
  for (const [method, path] of [
    ["PUT", "/student/profile"],
    ["PATCH", "/student/profile"],
    ["PUT", "/students/profile"],
    ["PATCH", "/students/profile"],
    ["PUT", "/auth/me"],
    ["PATCH", "/auth/me"],
    ["PUT", "/auth/profile"],
    ["PATCH", "/auth/profile"],
    ["PUT", "/users/me"],
    ["PATCH", "/users/me"],
    ["PUT", "/me"],
    ["PATCH", "/me"],
  ]) {
    await req(method, path, { token: student.token, body: studentBodies[0] });
    await sleep(200);
  }

  console.log("\n=== Admin self update candidates ===");
  for (const [method, path] of [
    ["PUT", "/admin/profile"],
    ["PATCH", "/admin/profile"],
    ["PUT", "/auth/me"],
    ["PATCH", "/auth/me"],
    ["PUT", "/auth/profile"],
    ["PATCH", "/auth/profile"],
    ["PUT", "/users/me"],
    ["PATCH", "/users/me"],
    ["PUT", "/me"],
    ["PATCH", "/me"],
  ]) {
    await req(method, path, {
      token: admin.token,
      body: { firstName: "Admin", secondName: "Probe", familyName: "One" },
    });
    await sleep(200);
  }

  console.log("\n=== Resolve a student for admin/teacher edit ===");
  const list = await req("GET", "/admin/students?page=1&limit=5", { token: admin.token });
  const students =
    list.json?.data?.students ||
    list.json?.data?.items ||
    (Array.isArray(list.json?.data) ? list.json.data : []);
  const s = students[0];
  const sid = s?._id;
  const uid = typeof s?.userId === "object" ? s.userId?._id : s?.userId;
  console.log("target student", { sid, uid, name: s?.firstName || s?.name });

  if (sid || uid) {
    console.log("\n=== Admin edit student candidates ===");
    const body = {
      firstName: s?.firstName || "Student",
      secondName: s?.secondName || "Probe",
      familyName: s?.familyName || "Edit",
    };
    for (const path of [
      `/admin/students/${sid}`,
      `/admin/students/${sid}/profile`,
      `/admin/users/${uid}`,
      `/admin/users/${uid}/profile`,
      `/admin/students/user/${uid}`,
      `/students/${sid}`,
      `/students/${sid}/profile`,
    ].filter((p) => !p.includes("undefined"))) {
      for (const method of ["PATCH", "PUT"]) {
        await req(method, path, { token: admin.token, body });
        await sleep(180);
      }
    }

    // avatar multipart
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    console.log("\n=== Admin student avatar multipart ===");
    for (const path of [
      `/admin/students/${sid}/avatar`,
      `/admin/students/${sid}/profile-image`,
      `/admin/students/${sid}`,
    ].filter((p) => !p.includes("undefined"))) {
      for (const field of ["profileImage", "avatar", "image"]) {
        const fd = new FormData();
        fd.append(field, new Blob([png], { type: "image/png" }), "a.png");
        await req("POST", path, { token: admin.token, formData: fd });
        await sleep(180);
        const fd2 = new FormData();
        fd2.append(field, new Blob([png], { type: "image/png" }), "a.png");
        await req("PUT", path, { token: admin.token, formData: fd2 });
        await sleep(180);
        const fd3 = new FormData();
        fd3.append(field, new Blob([png], { type: "image/png" }), "a.png");
        await req("PATCH", path, { token: admin.token, formData: fd3 });
        await sleep(180);
      }
    }
  }

  // Teacher edit student?
  console.log("\n=== Teacher dashboard courses + student id ===");
  const dash = await req("GET", "/instructor/dashboard", { token: teacher.token });
  const courses =
    dash.json?.data?.courses ||
    dash.json?.data?.instructorCourses ||
    [];
  const course =
    (Array.isArray(courses) ? courses : []).map((c) => c.course || c)[0];
  const courseId = course?._id || course?.id;
  console.log("courseId", courseId);
  if (courseId) {
    const st = await req("GET", `/instructor/courses/${courseId}/students`, {
      token: teacher.token,
    });
    const items =
      st.json?.data?.students ||
      st.json?.data?.items ||
      (Array.isArray(st.json?.data) ? st.json.data : []);
    const enr = items[0];
    const studentDoc = enr?.student || enr?.studentId || enr;
    const tSid = studentDoc?._id;
    const tUid =
      typeof studentDoc?.userId === "object"
        ? studentDoc.userId?._id
        : studentDoc?.userId;
    console.log("teacher student", { tSid, tUid });

    console.log("\n=== Teacher edit student candidates ===");
    const tBody = { firstName: "EditedByTeacher", secondName: "X", familyName: "Y" };
    for (const path of [
      `/instructor/students/${tSid}`,
      `/instructor/students/${tUid}`,
      `/instructor/students/${tSid}/profile`,
      `/instructor/students/${tUid}/profile`,
      `/instructor/courses/${courseId}/students/${tSid}`,
      `/instructor/courses/${courseId}/students/${tUid}`,
      `/teacher/students/${tSid}`,
      `/teacher/students/${tUid}`,
    ].filter((p) => !p.includes("undefined"))) {
      for (const method of ["PATCH", "PUT"]) {
        await req(method, path, { token: teacher.token, body: tBody });
        await sleep(180);
      }
    }
  }

  // OpenAPI paths containing profile/student
  console.log("\n=== OpenAPI path scan ===");
  try {
    const res = await fetch(`${BASE.replace("/api/v1", "")}/api-docs-json`).catch(() => null);
    // try common swagger urls
    for (const url of [
      "https://met-efgo.onrender.com/api-json",
      "https://met-efgo.onrender.com/api/v1/docs-json",
      "https://met-efgo.onrender.com/swagger-json",
      "https://met-efgo.onrender.com/api/docs-json",
    ]) {
      const r = await fetch(url);
      console.log("swagger", url, r.status);
      if (r.ok) {
        const spec = await r.json();
        const paths = Object.keys(spec.paths || {});
        console.log(
          paths
            .filter((p) => /profile|student|admin\/users|auth\/me|avatar/i.test(p))
            .join("\n"),
        );
        break;
      }
    }
  } catch (e) {
    console.log("swagger fail", e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
