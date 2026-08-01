/**
 * Probe avatar persistence options for instructor (+ any student alternatives).
 */
const BASE = "https://met-efgo.onrender.com/api/v1";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data.accessToken;
}

async function req(method, path, token, body) {
  const headers = { Authorization: `Bearer ${token}` };
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  console.log(`[${res.status}] ${method} ${path} — ${json.message || ""}`);
  return { status: res.status, json };
}

const teacher = await login("teacher10@gmail.com", "123456");

console.log("\n=== data URL profileImage ===");
const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
await req("PUT", "/instructor/profile", teacher, { profileImage: dataUrl });
let me = await req("GET", "/auth/me", teacher);
console.log("  profileImage starts with:", String(me.json?.data?.user?.profileImage || "").slice(0, 40));

console.log("\n=== upload endpoints ===");
for (const path of [
  "/upload",
  "/uploads",
  "/media",
  "/media/upload",
  "/files",
  "/files/upload",
  "/instructor/upload",
  "/instructor/avatar",
  "/instructor/profile/avatar",
  "/auth/avatar",
]) {
  const fd = new FormData();
  fd.append("file", new Blob([png], { type: "image/png" }), "a.png");
  fd.append("image", new Blob([png], { type: "image/png" }), "a.png");
  fd.append("profileImage", new Blob([png], { type: "image/png" }), "a.png");
  await req("POST", path, teacher, fd);
}

console.log("\n=== multipart with Content-Type omitted, only profileImage + names ===");
{
  const fd = new FormData();
  fd.append("profileImage", new Blob([png], { type: "image/png" }), "real.png");
  fd.append("firstName", "Teacher10");
  fd.append("secondName", "Bla");
  fd.append("familyName", "Bla");
  await req("PUT", "/instructor/profile", teacher, fd);
  me = await req("GET", "/auth/me", teacher);
  console.log("  profileImage:", me.json?.data?.user?.profileImage);
}

// Clear profileImage back to null if possible
await req("PUT", "/instructor/profile", teacher, {
  firstName: "Teacher10",
  secondName: "Bla",
  familyName: "Bla",
  profileImage: null,
  bio: "",
});
me = await req("GET", "/auth/me", teacher);
console.log("cleared?", me.json?.data?.user?.profileImage);
