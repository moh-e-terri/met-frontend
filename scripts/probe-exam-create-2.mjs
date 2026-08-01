const API = "https://met-efgo.onrender.com/api/v1";

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return json.data.accessToken;
}

const teacher = await login("teacher10@gmail.com", "123456");
const courseId = "6a50b07c38df697a23eb821b";

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
  console.log(`[${res.status}] ${label}`, json.message || "", JSON.stringify(json.data || {}).slice(0, 400));
}

await tryCreate("questionType field", {
  title: "probe-qtype",
  duration: 10,
  passingScore: 50,
  isPublished: true,
  showGradesImmediately: true,
  questions: [
    {
      questionType: "mcq",
      questionText: "سؤال بنوع questionType",
      options: ["أ", "ب", "ج", "د"],
      correctAnswer: 1,
      points: 2,
    },
  ],
});

await tryCreate("written only", {
  title: "probe-written",
  duration: 10,
  passingScore: 50,
  isPublished: true,
  questions: [
    {
      questionType: "written",
      questionText: "اكتب إجابة قصيرة",
      points: 5,
    },
  ],
});

await tryCreate("type written with options missing", {
  title: "probe-written-2",
  duration: 10,
  questions: [{ type: "written", questionText: "سؤال مقالي" }],
});
