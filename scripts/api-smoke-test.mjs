/**
 * Smoke test for all OpenAPI endpoints against production API.
 * Run: node scripts/api-smoke-test.mjs
 */
const BASE = process.env.API_URL || "https://met-efgo.onrender.com/api/v1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin1@edu.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456789";
const UMM_AL_QURA_UNIVERSITY_ID = "6a0d8cee65a071c8ca32fa29";

const results = [];

function pickId(value) {
  if (!value || typeof value !== "object") return null;
  const id = value._id ?? value.id;
  return typeof id === "string" ? id : null;
}

function extractList(json) {
  const data = json?.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of ["courses", "items", "posts", "students", "instructors", "lessons", "assignments", "exams", "conversations", "messages"]) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
}

async function request(method, path, { token, body, label, expectFail = false } = {}) {
  const url = `${BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 200) };
    }
    const ok = expectFail ? !res.ok : res.ok;
    results.push({
      label: label || `${method} ${path}`,
      ok,
      status: res.status,
      message: json.message || json.status || (res.ok ? "OK" : "FAIL"),
    });
    return { ok: res.ok, status: res.status, json, res };
  } catch (error) {
    results.push({
      label: label || `${method} ${path}`,
      ok: false,
      status: 0,
      message: error.message,
    });
    return { ok: false, json: null };
  }
}

async function login(email, password) {
  const { ok, json } = await request("POST", "/auth/login", {
    body: { email, password },
    label: `LOGIN ${email}`,
  });
  return ok ? json?.data?.accessToken : null;
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

function printResults() {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\n========== SUMMARY: ${passed}/${results.length} passed ==========`);
  if (failed.length) {
    console.log("\nFAILED:");
    for (const f of failed) {
      console.log(`  [${f.status}] ${f.label}: ${f.message}`);
    }
  }
  process.exit(failed.length ? 1 : 0);
}

async function main() {
  console.log(`Testing API: ${BASE}`);

  section("Batch 1 — Auth");
  await request("POST", "/auth/register", {
    label: "POST /auth/register (new student)",
    body: {
      firstName: "Test",
      secondName: "Smoke",
      familyName: "QA",
      email: `smoke-${Date.now()}@test.edu`,
      password: "123456789",
      confirmPassword: "123456789",
      universityId: UMM_AL_QURA_UNIVERSITY_ID,
    },
  });

  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  if (!adminToken) {
    console.error("Cannot continue without admin token");
    printResults();
  }

  section("Batch 2 — Universities");
  await request("GET", "/universities", { label: "GET /universities" });

  section("Batch 7 — Admin reads");
  const adminCoursesRes = await request("GET", "/admin/courses?page=1&limit=10", { token: adminToken });
  const adminStudentsRes = await request("GET", "/admin/students?page=1&limit=10", { token: adminToken });
  await request("GET", "/admin/stats", { token: adminToken });
  await request("GET", "/admin/universities?page=1&limit=10", { token: adminToken });
  await request("GET", "/admin/instructors?page=1&limit=10", { token: adminToken });
  await request("GET", "/admin/finance/payments", { token: adminToken });

  const adminCourses = extractList(adminCoursesRes.json);
  const sampleCourseId = pickId(adminCourses[0]);

  section("Batch 3 — Student core");
  const studentEmail = `student-qa-${Date.now()}@test.edu`;
  await request("POST", "/auth/register", {
    body: {
      firstName: "QA",
      secondName: "Student",
      familyName: "Test",
      email: studentEmail,
      password: "123456789",
      confirmPassword: "123456789",
      universityId: UMM_AL_QURA_UNIVERSITY_ID,
    },
    label: "POST /auth/register (student)",
  });

  const studentToken = await login(studentEmail, "123456789");
  let enrolledCourseId = null;
  let lessonId = null;

  if (studentToken) {
    await request("GET", "/auth/me", { token: studentToken });
    await request("GET", "/student/dashboard", { token: studentToken });
    const availableRes = await request("GET", "/student/courses/available?page=1&limit=12", {
      token: studentToken,
    });
    await request("GET", "/student/met/history", { token: studentToken });
    await request("GET", "/student/chat/instructors", { token: studentToken });

    const availableCourses = extractList(availableRes.json);
    const courseToEnroll = pickId(availableCourses[0]) || sampleCourseId;

    if (courseToEnroll) {
      const enrollRes = await request("POST", `/student/courses/${courseToEnroll}/enroll`, {
        token: studentToken,
        label: "POST /student/courses/{id}/enroll",
      });
      if (enrollRes.ok) enrolledCourseId = courseToEnroll;

      const contentRes = await request("GET", `/student/courses/${courseToEnroll}/content`, {
        token: studentToken,
        label: "GET /student/courses/{id}/content",
      });
      const contentData = contentRes.json?.data ?? {};
      const lessons = extractList({ data: contentData.lessons ?? contentData });
      lessonId = pickId(lessons[0]);
    }

    section("Batch 4 — Progress, assignments, exams");
    await request("GET", "/progress/overview", { token: studentToken });

    if (enrolledCourseId && lessonId) {
      await request("PATCH", `/progress/courses/${enrolledCourseId}/lessons/${lessonId}`, {
        token: studentToken,
        label: "PATCH /progress/courses/{courseId}/lessons/{lessonId}",
      });
    } else {
      results.push({
        label: "PATCH /progress/lesson (skipped)",
        ok: true,
        status: 0,
        message: "no enrolled course/lesson",
      });
    }

    if (enrolledCourseId) {
      await request("GET", `/courses/${enrolledCourseId}/lessons`, {
        token: studentToken,
        label: "GET /courses/{courseId}/lessons",
      });
      const assignmentsRes = await request("GET", `/courses/${enrolledCourseId}/assignments`, {
        token: studentToken,
        label: "GET /courses/{courseId}/assignments",
      });
      const examsRes = await request("GET", `/courses/${enrolledCourseId}/exams`, {
        token: studentToken,
        label: "GET /courses/{courseId}/exams",
      });

      const assignments = extractList(assignmentsRes.json);
      const assignmentId = pickId(assignments[0]);
      if (assignmentId) {
        await request(
          "POST",
          `/courses/${enrolledCourseId}/assignments/${assignmentId}/submit`,
          {
            token: studentToken,
            body: { textAnswer: "Smoke test submission" },
            label: "POST /courses/{courseId}/assignments/{id}/submit",
          },
        );
      }

      const exams = extractList(examsRes.json);
      const examId = pickId(exams[0]);
      if (examId) {
        await request("GET", `/courses/${enrolledCourseId}/exams/${examId}/my-result`, {
          token: studentToken,
          label: "GET /courses/{courseId}/exams/{id}/my-result",
        });
      }
    }

    section("Batch 5 — Community, chat, notifications");
    await request("POST", "/community/posts", {
      token: studentToken,
      body: { content: `Smoke test post ${Date.now()}` },
      label: "POST /community/posts",
    });
    await request("GET", "/community/posts?page=1&limit=5", { token: studentToken });

    const chatRes = await request("GET", "/chat", { token: studentToken });
    const conversations = extractList(chatRes.json);
    const conversationId = pickId(conversations[0]);
    if (conversationId) {
      await request("GET", `/chat/${conversationId}/messages`, {
        token: studentToken,
        label: "GET /chat/{conversationId}/messages",
      });
    }

    await request("GET", "/notifications", { token: studentToken });
    await request("PATCH", "/notifications/read-all", { token: studentToken });
  }

  section("Batch 6 — Instructor");
  const teacherToken = await login("teacher1@gmail.com", "123456789");
  if (teacherToken) {
    const dashRes = await request("GET", "/instructor/dashboard", { token: teacherToken });
    await request("GET", "/instructor/finance", { token: teacherToken });
    const dashData = dashRes.json?.data ?? {};
    const teacherCourses = extractList({
      data: dashData.courses ?? dashData.assignedCourses ?? dashData.recentCourses ?? [],
    });
    const teacherCourseId = pickId(teacherCourses[0]);
    if (teacherCourseId) {
      await request("GET", `/instructor/courses/${teacherCourseId}/students`, {
        token: teacherToken,
        label: "GET /instructor/courses/{courseId}/students",
      });
    } else {
      results.push({
        label: "GET /instructor/courses/{courseId}/students (skipped)",
        ok: true,
        status: 0,
        message: "instructor has no assigned courses on server",
      });
    }
  } else {
    results.push({
      label: "LOGIN teacher1@gmail.com",
      ok: false,
      status: 401,
      message: "instructor credentials unavailable",
    });
  }

  section("Batch 7 — Admin writes (test student only)");
  const adminStudents = extractList(adminStudentsRes.json);
  const testStudent = adminStudents.find((s) => {
    const user = s.userId ?? s.user ?? s;
    return pickId(s) && String(user?.email ?? s.email ?? "").includes("student-qa");
  });
  const testStudentId = pickId(testStudent);
  if (testStudentId && adminToken) {
    await request("PATCH", `/admin/students/${testStudentId}/met`, {
      token: adminToken,
      body: { amount: 1, description: "QA smoke test" },
      label: "PATCH /admin/students/{id}/met",
    });
  } else {
    results.push({
      label: "PATCH /admin/students/{id}/met (skipped)",
      ok: true,
      status: 0,
      message: "no matching test student in first page",
    });
  }

  section("Auth logout");
  await request("POST", "/auth/logout", { token: studentToken || adminToken });

  if (studentToken) {
    section("Change password (rollback)");
    await request("POST", "/auth/change-password", {
      token: studentToken,
      body: {
        currentPassword: "123456789",
        newPassword: "123456789",
        confirmNewPassword: "123456789",
      },
      label: "POST /auth/change-password (same password)",
    });
  }

  printResults();
}

main();
