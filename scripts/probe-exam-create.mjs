const BASE = "https://met-efgo.onrender.com";
const API = `${BASE}/api/v1`;

const js = await (await fetch(`${BASE}/api-docs/swagger-ui-init.js`)).text();
const i = js.indexOf('"/courses/{courseId}/exams"');
console.log("exams path at", i);
if (i >= 0) console.log(js.slice(i, i + 3500));

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

const teacher = await login("teacher10@gmail.com", "123456");
const dash = await (
  await fetch(`${API}/instructor/dashboard`, {
    headers: { Authorization: `Bearer ${teacher}` },
  })
).json();
const courses =
  dash.data?.instructor?.assignedCourses ||
  dash.data?.courses ||
  [];
const course = courses[0];
const courseId = course?._id || course?.id || course?.course?._id;
console.log("\ncourseId", courseId, course?.title);

async function tryCreate(label, body) {
  const res = await fetch(`${API}/courses/${courseId}/exams`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${teacher}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  console.log(`\n[${res.status}] ${label}`, json.message || "", JSON.stringify(json).slice(0, 500));
  return { res, json };
}

// Match current frontend payload (broken)
await tryCreate("frontend-style", {
  title: "probe-quiz-1",
  duration: 15,
  passingScore: 60,
  questionsCount: 2,
  isPublished: true,
  showGradesImmediately: true,
  questions: [
    { type: "mcq", question: "س1", options: ["أ", "ب", "ج", "د"], correctAnswer: 0 },
    { type: "mcq", question: "س2", options: ["أ", "ب", "ج", "د"], correctAnswer: 1 },
  ],
});

// questionText style
await tryCreate("questionText", {
  title: "probe-quiz-2",
  duration: 15,
  passingScore: 60,
  isPublished: true,
  showGradesImmediately: true,
  questions: [
    {
      type: "mcq",
      questionText: "ما هو HTML؟",
      options: ["لغة ترميز", "قاعدة بيانات", "نظام تشغيل", "متصفح"],
      correctAnswer: 0,
    },
    {
      type: "mcq",
      questionText: "ما هو CSS؟",
      options: ["تنسيق", "سيرفر", "نظام", "لغة آلة"],
      correctAnswer: 0,
    },
  ],
});

// written question variant
await tryCreate("mixed", {
  title: "probe-quiz-3",
  duration: 20,
  passingScore: 50,
  isPublished: false,
  showGradesImmediately: false,
  questions: [
    {
      type: "mcq",
      questionText: "سؤال اختيار",
      options: ["1", "2", "3", "4"],
      correctAnswer: 2,
    },
    {
      type: "written",
      questionText: "اشرح باختصار",
    },
  ],
});
