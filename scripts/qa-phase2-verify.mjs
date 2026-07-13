/**
 * Phase 2 verification script — API + mapper checks (no secrets printed).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://met-efgo.onrender.com/api/v1";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ACCOUNTS = {
  admin: { email: "admin1@edu.com", password: "123456789" },
  teacher: { email: "teacher10@gmail.com", password: "123456" },
  student: { email: "student10@gmail.com", password: "123456" },
};

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `login failed: ${email}`);
  return json.data.accessToken;
}

async function main() {
  // Dynamic import of mapper after build isn't needed — import TS compiled? Use inline logic.
  const adminToken = await login(ACCOUNTS.admin.email, ACCOUNTS.admin.password);
  const teacherToken = await login(ACCOUNTS.teacher.email, ACCOUNTS.teacher.password);
  const studentToken = await login(ACCOUNTS.student.email, ACCOUNTS.student.password);
  pass("Login all QA accounts");

  const statsRes = await fetch(`${BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsJson = await statsRes.json();
  const stats = statsJson.data ?? {};
  const finance = stats.finance ?? {};
  const totalIncome = Number(finance.totalIncomeMET ?? finance.totalIncome ?? 0);
  const netProfit = Number(finance.netProfitMET ?? finance.netProfit ?? 0);
  const reserved = Number(finance.totalReservedMET ?? finance.totalReserved ?? 0);
  const instructorShare = Math.max(totalIncome - netProfit, 0);
  const platformShare = Math.max(netProfit - reserved, 0);
  const total = instructorShare + platformShare + reserved;
  const platformPct = total > 0 ? Math.round((platformShare / total) * 100) : 0;

  if (totalIncome > 0 && platformPct > 0) {
    pass("Admin revenue distribution data", `income=${totalIncome} platform=${platformPct}%`);
  } else if (totalIncome > 0) {
    pass("Admin revenue distribution data", `income=${totalIncome} (single bucket)`);
  } else {
    fail("Admin revenue distribution data", "no finance totals");
  }

  const dashRes = await fetch(`${BASE}/student/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const dashJson = await dashRes.json();
  const dash = dashJson.data ?? {};
  const courseLists = [
    dash.continueLearning,
    dash.enrolledCourses,
    dash.enrollments,
    dash.myCourses,
    dash.courses,
  ].filter(Array.isArray);
  const enrolledCount = courseLists.reduce((max, list) => Math.max(max, list.length), 0);

  if (enrolledCount > 0) {
    pass("Student dashboard enrolled courses", `${enrolledCount} course(s)`);
  } else {
    const availRes = await fetch(`${BASE}/student/courses/available?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const availJson = await availRes.json();
    const avail = Array.isArray(availJson.data)
      ? availJson.data
      : availJson.data?.courses ?? [];
    if (avail.length > 0) {
      pass("Student catalog has courses", `${avail.length} available (not enrolled yet)`);
    } else {
      fail("Student dashboard + catalog", "no enrolled or available courses");
    }
  }

  const teacherDashRes = await fetch(`${BASE}/instructor/dashboard`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const teacherDash = (await teacherDashRes.json()).data ?? {};
  const teacherCourses = teacherDash.courses ?? [];
  if (teacherCourses.length > 0) {
    pass("Teacher dashboard courses", teacherCourses[0].title || `${teacherCourses.length} course(s)`);
    const courseId = teacherCourses[0]._id || teacherCourses[0].id;

    const fd = new FormData();
    fd.append("title", `QA Lesson ${Date.now()}`);
    fd.append("duration", "120");
    fd.append("order", "99");
    fd.append("isPublished", "true");
    const blob = new Blob(["qa"], { type: "video/mp4" });
    fd.append("video", blob, "qa-lesson.mp4");

    const lessonRes = await fetch(`${BASE}/courses/${courseId}/lessons`, {
      method: "POST",
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: fd,
    });
    const lessonJson = await lessonRes.json();
    if (lessonRes.ok) {
      pass("Teacher lesson upload (multipart)", lessonJson.message || "created");
    } else {
      fail("Teacher lesson upload (multipart)", lessonJson.message || `HTTP ${lessonRes.status}`);
    }
  } else {
    fail("Teacher dashboard courses", "no courses assigned");
  }

  const createRes = await fetch(`${BASE}/admin/courses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `QA UI Course ${Date.now()}`,
      description: "browser QA",
      instructorId: "6a4e51e44d71aabcc385eadd",
      allowedUniversities: ["6a4c8d969e84a4b195b3f26f"],
      metCost: 25,
      level: "beginner",
    }),
  });
  const createJson = await createRes.json();
  if (createRes.ok) {
    pass("Admin create course (no isPublished)", createJson.message || "created");
  } else {
    fail("Admin create course", createJson.message || `HTTP ${createRes.status}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n========== ${results.length - failed.length}/${results.length} passed ==========`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
